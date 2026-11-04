-- Fase 16: el área profesional sobre las tablas de la Fase 14 (docs/DESIGN-WEB.md §10). La solicitud de
-- verificación y su revisión, el acompañamiento que empieza con una solicitud, quién termina el proceso,
-- los avisos del chat para cada lado y las notas clínicas.

-- Columnas nuevas ----------------------------------------------------------------------------------

-- Qué documentos pidió reemplazar el administrador al solicitar una subsanación.
alter table public.verification_reviews add column documents uuid[] not null default '{}';
-- Cada lado marca su propia lectura: lo que lee la persona no cuenta para el psicólogo.
alter table public.conversations add column psychologist_read_at timestamptz not null default now();
-- El tipo de aviso, para que cada lado lo diga a su manera. body queda escrito para la persona.
alter table public.messages add column event text
  check (event in ('accepted', 'share_on', 'share_off', 'ended_user', 'ended_psychologist'));
alter table public.appointments add column duration_minutes smallint not null default 50
  check (duration_minutes between 15 and 120);

-- Solicitud de verificación ------------------------------------------------------------------------

-- La solicitud se envía solo con submit_application, y la revisión solo desde set-role. Del perfil, el
-- psicólogo cambia únicamente su agenda: un perfil aprobado ya no cambia su nombre ni su licencia.
revoke insert, update on public.psychologist_profiles from authenticated;
grant update (meet_link, availability) on public.psychologist_profiles to authenticated;
revoke insert on public.verification_documents from authenticated;
revoke insert on public.verification_reviews from authenticated;
drop policy psychologist_profiles_own_insert on public.psychologist_profiles;
drop policy verification_documents_own_insert on public.verification_documents;
drop policy verification_reviews_admin_insert on public.verification_reviews;

-- Envía la solicitud, o la vuelve a enviar después de una subsanación o un rechazo. Todo junto: los
-- datos, los documentos que ya subió a credentials y los que reemplaza.
create function public.submit_application(
  p_full_name text,
  p_title text,
  p_license text,
  p_university text,
  p_specialties text[],
  p_approach text,
  p_years integer,
  p_bio text,
  p_ethics_version text,
  p_documents jsonb,
  p_replace uuid[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  current_status text;
  pending_replace uuid[];
  doc record;
  kept integer;
begin
  if me is null then
    raise exception 'Sin sesión' using errcode = '28000';
  end if;
  select status into current_status from public.psychologist_profiles where profile_id = me for update;
  if current_status in ('pending', 'approved') then
    raise exception 'La solicitud ya está enviada' using errcode = '22023';
  end if;
  if char_length(trim(coalesce(p_full_name, ''))) not between 3 and 120
    or char_length(trim(coalesce(p_title, ''))) not between 3 and 80
    or char_length(trim(coalesce(p_license, ''))) not between 3 and 60
    or char_length(trim(coalesce(p_university, ''))) not between 2 and 120
    or coalesce(cardinality(p_specialties), 0) not between 1 and 12
    or char_length(coalesce(p_approach, '')) > 120
    or p_years is null or p_years not between 0 and 70
    or char_length(coalesce(p_bio, '')) > 280
    or coalesce(p_ethics_version, '') = '' then
    raise exception 'Faltan datos' using errcode = '22023';
  end if;

  insert into public.psychologist_profiles as p (
    profile_id, full_name, title, license, university, specialties, approach, years_experience, bio,
    status, status_reason, submitted_at, ethics_accepted_at, ethics_version
  )
  values (
    me, trim(p_full_name), trim(p_title), trim(p_license), trim(p_university), p_specialties, trim(coalesce(p_approach, '')),
    p_years, trim(coalesce(p_bio, '')), 'pending', null, now(), now(), p_ethics_version
  )
  on conflict (profile_id) do update set
    full_name = excluded.full_name,
    title = excluded.title,
    license = excluded.license,
    university = excluded.university,
    specialties = excluded.specialties,
    approach = excluded.approach,
    years_experience = excluded.years_experience,
    bio = excluded.bio,
    status = 'pending',
    status_reason = null,
    submitted_at = now(),
    ethics_accepted_at = now(),
    ethics_version = excluded.ethics_version;

  -- Después de un rechazo, la solicitud nueva empieza sin documentos.
  if current_status = 'rejected' then
    update public.verification_documents set replaced = true where application_id = me and not replaced;
  end if;
  update public.verification_documents set replaced = true where application_id = me and id = any (p_replace);

  for doc in
    select * from jsonb_to_recordset(coalesce(p_documents, '[]'::jsonb)) as d (id uuid, path text, name text, size_bytes bigint)
  loop
    -- Solo un archivo propio que ya está en credentials.
    if doc.path is null or split_part(doc.path, '/', 1) <> me::text or not exists (
      select 1 from storage.objects o where o.bucket_id = 'credentials' and o.name = doc.path
    ) then
      raise exception 'Documento inválido' using errcode = '22023';
    end if;
    insert into public.verification_documents (id, application_id, path, name, size_bytes, mime_type)
    values (coalesce(doc.id, gen_random_uuid()), me, doc.path, left(coalesce(doc.name, 'documento.pdf'), 200), doc.size_bytes, 'application/pdf');
  end loop;

  -- Lo que pidió reemplazar la última subsanación tiene que estar reemplazado.
  if current_status = 'needs_changes' then
    select r.documents into pending_replace from public.verification_reviews r
    where r.application_id = me order by r.created_at desc limit 1;
    if exists (
      select 1 from public.verification_documents d
      where d.application_id = me and not d.replaced and d.id = any (coalesce(pending_replace, '{}'))
    ) then
      raise exception 'Falta reemplazar un documento' using errcode = '22023';
    end if;
  end if;

  select count(*) into kept from public.verification_documents where application_id = me and not replaced;
  if kept not between 1 and 3 then
    raise exception 'Documentos' using errcode = '22023';
  end if;
end;
$$;

-- La decisión del administrador: queda en el historial y cambia el estado. La llama set-role, que al
-- aprobar también le da el rol en app_metadata. Repetir una aprobación solo vuelve a poner el rol.
create function public.review_application(
  p_admin uuid,
  p_application uuid,
  p_action text,
  p_reason text,
  p_documents uuid[] default '{}'
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_status text;
begin
  if not exists (select 1 from public.profiles where id = p_admin and role = 'admin') or p_admin = p_application then
    raise exception 'No es administrador' using errcode = '42501';
  end if;
  if p_action not in ('approved', 'needs_changes', 'rejected') then
    raise exception 'Acción desconocida' using errcode = '22023';
  end if;
  if p_action <> 'approved' and char_length(trim(coalesce(p_reason, ''))) not between 3 and 2000 then
    raise exception 'Falta el motivo' using errcode = '22023';
  end if;
  select status into current_status from public.psychologist_profiles where profile_id = p_application for update;
  if current_status is null then
    raise exception 'No existe' using errcode = 'P0002';
  end if;
  if current_status <> 'pending' then
    if current_status = 'approved' and p_action = 'approved' then
      return 'approved';
    end if;
    raise exception 'Ya está revisada' using errcode = '22023';
  end if;

  insert into public.verification_reviews (application_id, admin_id, action, reason, documents)
  values (
    p_application,
    p_admin,
    p_action,
    nullif(trim(coalesce(p_reason, '')), ''),
    case when p_action = 'needs_changes' then coalesce((
      select array_agg(d.id) from public.verification_documents d
      where d.application_id = p_application and not d.replaced and d.id = any (p_documents)
    ), '{}') else '{}' end
  );
  update public.psychologist_profiles
  set
    status = p_action,
    status_reason = case when p_action = 'approved' then null else trim(p_reason) end,
    verified_at = case when p_action = 'approved' then now() else verified_at end
  where profile_id = p_application;
  return p_action;
end;
$$;

-- Los PDF que subió y todavía no envió se pueden quitar. Los enviados quedan en el historial.
create policy credentials_own_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'credentials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.verification_documents d where d.path = storage.objects.name)
  );

-- Acompañamiento -----------------------------------------------------------------------------------

-- La persona no lee psychologist_profiles: esto le dice solo si alguien está aprobado.
create function public.is_approved_psychologist(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.psychologist_profiles where profile_id = p_id and status = 'approved');
$$;

-- Se pide a un psicólogo aprobado, sin tener otro activo. La pendiente única la cuida el índice.
create function public.care_request_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id = new.psychologist_id or not public.is_approved_psychologist(new.psychologist_id) then
    raise exception 'No disponible' using errcode = '22023';
  end if;
  if exists (select 1 from public.conversations c where c.user_id = new.user_id and c.ended_at is null) then
    raise exception 'Ya trabajas con un psicólogo' using errcode = '22023';
  end if;
  new.status := 'pending';
  new.created_at := now();
  new.responded_at := null;
  return new;
end;
$$;

create trigger care_request_insert
  before insert on public.care_requests
  for each row execute function public.care_request_before_insert();

create function public.care_request_answered_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.responded_at := now();
  return new;
end;
$$;

create trigger care_request_responded_at
  before update of status on public.care_requests
  for each row
  when (old.status is distinct from new.status)
  execute function public.care_request_answered_at();

-- Solo aceptar abre la conversación: la nueva, o la de antes con este mismo psicólogo.
create function public.care_request_accepted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  conversation uuid;
  first_name text;
begin
  insert into public.conversations (user_id, psychologist_id)
  values (new.user_id, new.psychologist_id)
  on conflict (user_id, psychologist_id) do update set ended_at = null, ended_by = null
  returning id into conversation;
  select split_part(trim(full_name), ' ', 1) into first_name
  from public.psychologist_profiles where profile_id = new.psychologist_id;
  insert into public.messages (conversation_id, sender, kind, event, body)
  values (conversation, 'system', 'event', 'accepted', coalesce(first_name, 'Tu psicólogo') || ' aceptó acompañarte.');
  return new;
end;
$$;

create trigger care_request_accept
  after update of status on public.care_requests
  for each row
  when (old.status = 'pending' and new.status = 'accepted')
  execute function public.care_request_accepted();

-- La persona la crea y la retira; el psicólogo la acepta o la declina. La fecha la pone el servidor.
revoke update on public.care_requests from authenticated;
grant update (status) on public.care_requests to authenticated;

-- El psicólogo ve el nombre de quien le pide acompañamiento, además del de sus pacientes.
drop policy profiles_patient_read on public.profiles;
create policy profiles_patient_read on public.profiles for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.user_id = profiles.id and c.psychologist_id = (select auth.uid())
    )
    or exists (
      select 1 from public.care_requests r
      where r.user_id = profiles.id and r.psychologist_id = (select auth.uid())
    )
  );

-- Conversaciones: ya no se abren ni se reabren desde el navegador. Se terminan y se marcan leídas con
-- sus funciones, cada lado lo suyo.
revoke insert, update on public.conversations from authenticated;
drop policy conversations_own_insert on public.conversations;
drop policy conversations_parties_update on public.conversations;

create function public.end_conversation(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  c public.conversations;
begin
  select * into c from public.conversations where id = p_id for update;
  if c.id is null or me is null or (c.user_id <> me and c.psychologist_id <> me) then
    raise exception 'No existe' using errcode = 'P0002';
  end if;
  if c.ended_at is not null then
    return;
  end if;
  update public.conversations
  set ended_at = now(), ended_by = case when c.user_id = me then 'user' else 'psychologist' end
  where id = p_id;
end;
$$;

create function public.mark_conversation_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  update public.conversations set last_read_at = now() where id = p_id and user_id = me;
  if not found then
    update public.conversations set psychologist_read_at = now() where id = p_id and psychologist_id = me;
  end if;
end;
$$;

-- Terminar el proceso apaga el permiso del diario y deja el aviso, venga de quien venga. El aviso va
-- antes de apagar el permiso: así ese cambio no deja un segundo aviso.
create or replace function public.conversation_ended()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  first_name text;
begin
  select split_part(trim(full_name), ' ', 1) into first_name
  from public.psychologist_profiles where profile_id = new.psychologist_id;
  first_name := coalesce(first_name, 'tu psicólogo');
  insert into public.messages (conversation_id, sender, kind, event, body)
  values (
    new.id,
    'system',
    'event',
    case when new.ended_by = 'psychologist' then 'ended_psychologist' else 'ended_user' end,
    case
      when new.ended_by = 'psychologist' then first_name || ' terminó el acompañamiento.'
      else 'Terminaste tu proceso con ' || first_name || '.'
    end
  );
  update public.diary_shares
  set active = false
  where user_id = new.user_id and psychologist_id = new.psychologist_id and active;
  return new;
end;
$$;

-- El aviso de compartir el diario, ahora con su tipo.
create or replace function public.diary_share_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  conversation uuid;
  first_name text;
begin
  if tg_op = 'UPDATE' and old.active = new.active then
    return new;
  end if;
  select id into conversation from public.conversations
  where user_id = new.user_id and psychologist_id = new.psychologist_id and ended_at is null;
  if conversation is null then
    return new;
  end if;
  select split_part(trim(full_name), ' ', 1) into first_name
  from public.psychologist_profiles where profile_id = new.psychologist_id;
  insert into public.messages (conversation_id, sender, kind, event, body)
  values (
    conversation,
    'system',
    'event',
    case when new.active then 'share_on' else 'share_off' end,
    case
      when new.active then 'Compartiste tu diario con ' || coalesce(first_name, 'tu psicólogo') || '.'
      else 'Dejaste de compartir tu diario con ' || coalesce(first_name, 'tu psicólogo') || '.'
    end
  );
  return new;
end;
$$;

-- Las sesiones llevan su duración, la de la agenda del psicólogo.
grant insert (duration_minutes) on public.appointments to authenticated;

-- Notas clínicas: solo su autor, y solo sobre alguien que es o fue su paciente. Se quedan con él
-- aunque el permiso del diario termine.
drop policy clinical_notes_author on public.clinical_notes;
create policy clinical_notes_author_read on public.clinical_notes for select to authenticated
  using (psychologist_id = (select auth.uid()));
create policy clinical_notes_author_insert on public.clinical_notes for insert to authenticated
  with check (
    psychologist_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.psychologist_id = (select auth.uid()) and c.user_id = patient_id
    )
  );
create policy clinical_notes_author_update on public.clinical_notes for update to authenticated
  using (psychologist_id = (select auth.uid())) with check (psychologist_id = (select auth.uid()));
create policy clinical_notes_author_delete on public.clinical_notes for delete to authenticated
  using (psychologist_id = (select auth.uid()));

-- Permisos de las funciones ------------------------------------------------------------------------

revoke execute on function public.submit_application(text, text, text, text, text[], text, integer, text, text, jsonb, uuid[]) from public, anon;
grant execute on function public.submit_application(text, text, text, text, text[], text, integer, text, text, jsonb, uuid[]) to authenticated;
revoke execute on function public.end_conversation(uuid) from public, anon;
grant execute on function public.end_conversation(uuid) to authenticated;
revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

revoke execute on function public.review_application(uuid, uuid, text, text, uuid[]) from public, anon, authenticated;
grant execute on function public.review_application(uuid, uuid, text, text, uuid[]) to service_role;
revoke execute on function public.is_approved_psychologist(uuid) from public, anon, authenticated;
revoke execute on function public.care_request_before_insert() from public, anon, authenticated;
revoke execute on function public.care_request_answered_at() from public, anon, authenticated;
revoke execute on function public.care_request_accepted() from public, anon, authenticated;

-- Tiempo real: a la persona le llega la respuesta a su solicitud, y al psicólogo la solicitud nueva.
alter publication supabase_realtime add table public.care_requests;
