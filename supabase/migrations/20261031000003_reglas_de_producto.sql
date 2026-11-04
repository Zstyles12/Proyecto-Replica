-- Las reglas de producto que no pueden depender del navegador.

-- Cada cuenta nace con su perfil y sus ajustes. El nombre viene de Google, si lo entregó.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_role text := coalesce(new.raw_app_meta_data ->> 'role', 'user');
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    case when account_role in ('user', 'psychologist', 'admin') then account_role else 'user' end,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80)
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- El rol vive en app_metadata; profiles solo lo refleja.
create function public.sync_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_role text := coalesce(new.raw_app_meta_data ->> 'role', 'user');
begin
  update public.profiles
  set role = case when account_role in ('user', 'psychologist', 'admin') then account_role else 'user' end
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_role_changed
  after update of raw_app_meta_data on auth.users
  for each row execute function public.sync_role();

-- Una zona horaria inválida rompería el cálculo del día de esa persona y la consulta de todas.
create function public.user_settings_valid_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    new.timezone := 'UTC';
  end if;
  return new;
end;
$$;

create trigger user_settings_timezone
  before insert or update of timezone on public.user_settings
  for each row execute function public.user_settings_valid_timezone();

-- RN: una réplica al momento por día. El día se cuenta en la zona de la persona, y solo la primera
-- nota no privada recibe réplica. El cliente puede adelantarlo para la interfaz, pero decide esto.
create function public.entries_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  tz text;
begin
  -- Dos notas al mismo tiempo no pueden ser las dos "la primera".
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text, 0));
  select timezone into tz from public.user_settings where user_id = new.user_id;
  new.day := (new.created_at at time zone coalesce(tz, 'UTC'))::date;
  if new.reply_mode <> 'private' then
    new.reply_mode := case
      when exists (
        select 1 from public.entries e
        where e.user_id = new.user_id and e.day = new.day and e.reply_mode <> 'private'
      ) then 'day'
      else 'instant'
    end;
  end if;
  return new;
end;
$$;

create trigger entries_reply_mode
  before insert on public.entries
  for each row execute function public.entries_before_insert();

-- La única puerta para crear una nota: ánimo y tema son necesarios, y va todo junto o no va.
-- Repetir la misma nota (mismo id, por un reintento) la devuelve sin duplicarla.
create function public.create_entry(
  p_id uuid,
  p_body text,
  p_mood text,
  p_tag text,
  p_prompt text default null,
  p_private boolean default false
)
returns public.entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  entry public.entries;
  tag uuid;
begin
  if me is null then
    raise exception 'Sin sesión' using errcode = '28000';
  end if;
  select id into tag from public.tags where name = p_tag;
  if tag is null then
    raise exception 'Tema desconocido' using errcode = '22023';
  end if;
  insert into public.entries (id, user_id, body, mood, prompt, reply_mode)
  values (p_id, me, p_body, p_mood, p_prompt, case when p_private then 'private' else 'day' end)
  on conflict (id) do nothing
  returning * into entry;
  if not found then
    select * into entry from public.entries where id = p_id and user_id = me;
    if not found then
      raise exception 'Nota inválida' using errcode = '22023';
    end if;
    return entry;
  end if;
  insert into public.entry_tags (entry_id, tag_id) values (entry.id, tag);
  return entry;
end;
$$;
revoke execute on function public.create_entry(uuid, text, text, text, text, boolean) from public, anon;
grant execute on function public.create_entry(uuid, text, text, text, text, boolean) to authenticated;

-- Terminar el proceso apaga el permiso sobre el diario, venga de quien venga (RN: revocable siempre).
create function public.conversation_ended()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.diary_shares
  set active = false
  where user_id = new.user_id and psychologist_id = new.psychologist_id and active;
  return new;
end;
$$;

create trigger conversation_end_share
  after update of ended_at on public.conversations
  for each row
  when (old.ended_at is null and new.ended_at is not null)
  execute function public.conversation_ended();

-- changed_at y el aviso en el chat salen del servidor: nadie puede escribir un evento falso.
create function public.diary_share_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.changed_at := now();
  return new;
end;
$$;

create trigger diary_share_changed_at
  before update of active on public.diary_shares
  for each row execute function public.diary_share_touch();

create function public.diary_share_event()
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
  insert into public.messages (conversation_id, sender, kind, body)
  values (
    conversation,
    'system',
    'event',
    case
      when new.active then 'Compartiste tu diario con ' || coalesce(first_name, 'tu psicólogo') || '.'
      else 'Dejaste de compartir tu diario con ' || coalesce(first_name, 'tu psicólogo') || '.'
    end
  );
  return new;
end;
$$;

create trigger diary_share_message
  after insert or update of active on public.diary_shares
  for each row execute function public.diary_share_event();

-- Cada sesión agendada aparece en el chat.
create function public.appointment_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.messages (conversation_id, appointment_id, sender, kind)
  values (new.conversation_id, new.id, 'system', 'session');
  return new;
end;
$$;

create trigger appointment_created
  after insert on public.appointments
  for each row execute function public.appointment_message();

create function public.clinical_note_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger clinical_note_updated_at
  before update on public.clinical_notes
  for each row execute function public.clinical_note_touch();

-- RF-20: máximo tres llamadas a la IA por persona y día. Si Gemini falla, la llamada se devuelve, para
-- que un error no le quite a nadie la réplica de la noche.
create function public.take_ai_call(p_user uuid, p_day date)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.ai_usage as u (user_id, day, calls)
  values (p_user, p_day, 1)
  on conflict (user_id, day) do update set calls = u.calls + 1 where u.calls < 3;
  return found;
end;
$$;

create function public.give_back_ai_call(p_user uuid, p_day date)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.ai_usage set calls = greatest(calls - 1, 0) where user_id = p_user and day = p_day;
$$;

-- Las réplicas del día que tocan ahora, en la zona de cada persona. Hoy, si ya pasó su hora y hay al
-- menos dos notas no privadas; los días ya terminados, si alguna nota se quedó esperando (la del día
-- que no se generó) o si se escribió después de la réplica de la noche (la última réplica, RF-19).
-- Mira solo unos días atrás: un error que se repite no vuelve a recorrer toda la historia.
create function public.due_day_replies(p_limit integer default 10)
returns table (user_id uuid, day date, kind text)
language sql
stable
security definer
set search_path = ''
as $$
  with people as (
    select s.user_id, s.day_reply_hour, (now() at time zone s.timezone) as local_now
    from public.user_settings s
  ),
  days as (
    select
      p.user_id,
      e.day,
      p.local_now::date as today,
      extract(hour from p.local_now) >= p.day_reply_hour as past_hour,
      count(*) as notes,
      array_agg(e.id) as ids
    from people p
    join public.entries e on e.user_id = p.user_id and e.reply_mode <> 'private'
    where e.day >= p.local_now::date - 3
    group by p.user_id, e.day, p.local_now, p.day_reply_hour
  ),
  night as (
    select
      d.user_id,
      d.day,
      'day'::text as kind
    from days d
    where d.notes >= 2
      and (d.day < d.today or d.past_hour)
      and not exists (
        select 1 from public.day_replies r
        where r.user_id = d.user_id and r.day = d.day and r.kind = 'day'
      )
  ),
  late as (
    select
      d.user_id,
      d.day,
      'late'::text as kind
    from days d
    join public.day_replies r on r.user_id = d.user_id and r.day = d.day and r.kind = 'day'
    where d.day < d.today
      and not (d.ids <@ r.entry_ids)
      and not exists (
        select 1 from public.day_replies l
        where l.user_id = d.user_id and l.day = d.day and l.kind = 'late'
      )
  )
  select * from night
  union all
  select * from late
  order by day desc
  limit p_limit;
$$;

-- Guarda la réplica y sus comentarios juntos. Si otra ejecución llegó primero, devuelve false.
create function public.save_day_reply(
  p_user uuid,
  p_day date,
  p_kind text,
  p_headline text,
  p_body text,
  p_questions jsonb,
  p_learning text,
  p_entry_ids uuid[],
  p_comments jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  reply uuid;
begin
  insert into public.day_replies (user_id, day, kind, headline, body, questions, learning, entry_ids)
  values (p_user, p_day, p_kind, p_headline, p_body, p_questions, p_learning, p_entry_ids)
  on conflict (user_id, day, kind) do nothing
  returning id into reply;
  if reply is null then
    return false;
  end if;
  insert into public.day_reply_comments (day_reply_id, entry_id, comment)
  select reply, c.entry_id, c.comment
  from jsonb_to_recordset(p_comments) as c (entry_id uuid, comment text)
  where c.entry_id = any (p_entry_ids)
  on conflict do nothing;
  return true;
end;
$$;

-- Solo el servidor.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_role() from public, anon, authenticated;
revoke execute on function public.take_ai_call(uuid, date) from public, anon, authenticated;
revoke execute on function public.give_back_ai_call(uuid, date) from public, anon, authenticated;
revoke execute on function public.due_day_replies(integer) from public, anon, authenticated;
revoke execute on function public.save_day_reply(uuid, date, text, text, text, jsonb, text, uuid[], jsonb) from public, anon, authenticated;
grant execute on function public.take_ai_call(uuid, date) to service_role;
grant execute on function public.give_back_ai_call(uuid, date) to service_role;
grant execute on function public.due_day_replies(integer) to service_role;
grant execute on function public.save_day_reply(uuid, date, text, text, text, jsonb, text, uuid[], jsonb) to service_role;

-- Las funciones de trigger no se llaman a mano.
revoke execute on function public.user_settings_valid_timezone() from public, anon, authenticated;
revoke execute on function public.entries_before_insert() from public, anon, authenticated;
revoke execute on function public.conversation_ended() from public, anon, authenticated;
revoke execute on function public.diary_share_touch() from public, anon, authenticated;
revoke execute on function public.diary_share_event() from public, anon, authenticated;
revoke execute on function public.appointment_message() from public, anon, authenticated;
revoke execute on function public.clinical_note_touch() from public, anon, authenticated;

-- Tiempo real (RF-43): el chat y la réplica del día, que llega sola. Realtime respeta las reglas de
-- acceso.
alter publication supabase_realtime add table
  public.messages,
  public.conversations,
  public.appointments,
  public.day_replies;
