-- Dos piezas del área profesional (DESIGN-WEB.md §10, 6 de noviembre):
-- 1. El psicólogo verificado edita lo que cuenta de sí mismo. Lo que verificó el administrador (nombre,
--    título, licencia y universidad) no cambia.
-- 2. El administrador retira la verificación de un psicólogo aprobado: sale del directorio, sus
--    acompañamientos terminan con su aviso, se apagan los diarios compartidos y se cancelan sus sesiones.

-- 1. El perfil público ---------------------------------------------------------------------------------

create function public.update_public_profile(
  p_specialties text[],
  p_approach text,
  p_years integer,
  p_bio text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Sin sesión' using errcode = '28000';
  end if;
  if coalesce(cardinality(p_specialties), 0) not between 1 and 12
    or exists (select 1 from unnest(p_specialties) s where char_length(trim(s)) not between 2 and 60)
    or char_length(coalesce(p_approach, '')) > 120
    or p_years is null or p_years not between 0 and 70
    or char_length(coalesce(p_bio, '')) > 280 then
    raise exception 'Faltan datos' using errcode = '22023';
  end if;
  update public.psychologist_profiles
  set
    specialties = p_specialties,
    approach = trim(coalesce(p_approach, '')),
    years_experience = p_years,
    bio = trim(coalesce(p_bio, ''))
  where profile_id = me and status = 'approved';
  if not found then
    raise exception 'No verificado' using errcode = '42501';
  end if;
end;
$$;
revoke execute on function public.update_public_profile(text[], text, integer, text) from public, anon;
grant execute on function public.update_public_profile(text[], text, integer, text) to authenticated;

-- 2. Retirar la verificación ---------------------------------------------------------------------------

alter table public.psychologist_profiles drop constraint psychologist_profiles_status_check;
alter table public.psychologist_profiles add constraint psychologist_profiles_status_check
  check (status in ('pending', 'needs_changes', 'approved', 'rejected', 'revoked'));

alter table public.verification_reviews drop constraint verification_reviews_action_check;
alter table public.verification_reviews add constraint verification_reviews_action_check
  check (action in ('approved', 'needs_changes', 'rejected', 'revoked'));

alter table public.conversations drop constraint conversations_ended_by_check;
alter table public.conversations add constraint conversations_ended_by_check
  check (ended_by in ('user', 'psychologist', 'replica'));

alter table public.messages drop constraint messages_event_check;
alter table public.messages add constraint messages_event_check
  check (event in ('accepted', 'share_on', 'share_off', 'ended_user', 'ended_psychologist', 'ended_replica'));

-- El aviso al terminar, ahora también cuando Replica retira la verificación.
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
    case new.ended_by when 'psychologist' then 'ended_psychologist' when 'replica' then 'ended_replica' else 'ended_user' end,
    case new.ended_by
      when 'psychologist' then first_name || ' terminó el acompañamiento.'
      when 'replica' then 'El acompañamiento con ' || first_name || ' terminó: su perfil ya no está verificado en Replica.'
      else 'Terminaste tu proceso con ' || first_name || '.'
    end
  );
  update public.diary_shares
  set active = false
  where user_id = new.user_id and psychologist_id = new.psychologist_id and active;
  return new;
end;
$$;

-- La llama set-role, que después le quita el rol de psicólogo en app_metadata.
create function public.revoke_verification(p_admin uuid, p_application uuid, p_reason text)
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
  if char_length(trim(coalesce(p_reason, ''))) not between 3 and 2000 then
    raise exception 'Falta el motivo' using errcode = '22023';
  end if;
  select status into current_status from public.psychologist_profiles where profile_id = p_application for update;
  if current_status is null then
    raise exception 'No existe' using errcode = 'P0002';
  end if;
  if current_status = 'revoked' then
    return 'revoked';
  end if;
  if current_status <> 'approved' then
    raise exception 'No está aprobado' using errcode = '22023';
  end if;

  insert into public.verification_reviews (application_id, admin_id, action, reason)
  values (p_application, p_admin, 'revoked', trim(p_reason));
  update public.psychologist_profiles
  set status = 'revoked', status_reason = trim(p_reason)
  where profile_id = p_application;
  -- Como después de un rechazo: una solicitud nueva lleva sus documentos de nuevo. Estos quedan en el
  -- historial.
  update public.verification_documents set replaced = true where application_id = p_application and not replaced;

  -- Las sesiones que no pasaron se cancelan; las conversaciones terminan con su aviso, y eso apaga el
  -- diario compartido (conversation_ended). Las solicitudes que esperaban respuesta quedan en "Ahora no".
  update public.appointments a
  set cancelled_at = now()
  from public.conversations c
  where a.conversation_id = c.id and c.psychologist_id = p_application
    and a.cancelled_at is null and a.starts_at > now();
  update public.conversations
  set ended_at = now(), ended_by = 'replica'
  where psychologist_id = p_application and ended_at is null;
  update public.diary_shares
  set active = false
  where psychologist_id = p_application and active;
  update public.care_requests
  set status = 'declined'
  where psychologist_id = p_application and status = 'pending';
  return 'revoked';
end;
$$;
revoke execute on function public.revoke_verification(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.revoke_verification(uuid, uuid, text) to service_role;
