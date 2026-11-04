-- La cuenta de demostración (DESIGN.md, reglas de producto): el administrador recibe una réplica al
-- momento en cada nota que no es privada y no tiene límite diario de llamadas a la IA ni de mensajes en
-- el chat con Replica, para mostrar el sistema en vivo. El rol sale de profiles, que refleja
-- app_metadata y solo cambia el servidor. Para las demás cuentas nada cambia.

create function public.is_demo_account(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = p_user and role = 'admin');
$$;
revoke execute on function public.is_demo_account(uuid) from public, anon, authenticated;
grant execute on function public.is_demo_account(uuid) to service_role;

create or replace function public.entries_before_insert()
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
      when public.is_demo_account(new.user_id) then 'instant'
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

create or replace function public.take_ai_call(p_user uuid, p_day date)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  demo boolean := public.is_demo_account(p_user);
begin
  insert into public.ai_usage as u (user_id, day, calls)
  values (p_user, p_day, 1)
  on conflict (user_id, day) do update set calls = least(u.calls + 1, 32767) where demo or u.calls < 3;
  return found;
end;
$$;

create or replace function public.take_chat_message(p_user uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date;
  demo boolean := public.is_demo_account(p_user);
begin
  select (now() at time zone coalesce(s.timezone, 'UTC'))::date into today
  from public.user_settings s where s.user_id = p_user;
  today := coalesce(today, (now() at time zone 'UTC')::date);

  insert into public.ai_usage as u (user_id, day, calls, chat_messages)
  values (p_user, today, 0, 1)
  on conflict (user_id, day) do update set chat_messages = least(u.chat_messages + 1, 32767) where demo or u.chat_messages < p_limit;
  return found;
end;
$$;
