-- Fase 17: funciones restantes (docs/DESIGN-WEB.md §11).
--   1. Compartir una nota suelta en el chat (RF-44).
--   2. Notas escritas sin conexión: llegan con la hora en que se escribieron (RNF-13).
--   3. Recordatorio diario con Web Push (RF-53).

-- 1. Nota suelta en el chat ------------------------------------------------------------------------

-- Solo la persona comparte, solo una nota suya y nunca privada (lo dice la regla de inserción), y el
-- texto lo copia la base de datos de la nota misma: el navegador no puede mostrar otra cosa.
create function public.messages_shared_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  shared public.entries;
begin
  if new.entry_id is null then
    return new;
  end if;
  if new.sender <> 'user' then
    raise exception 'Solo la persona comparte sus notas' using errcode = '42501';
  end if;
  select e.* into shared
  from public.entries e
  join public.conversations c on c.id = new.conversation_id
  where e.id = new.entry_id and e.user_id = c.user_id and e.reply_mode <> 'private';
  if not found then
    raise exception 'Nota inválida' using errcode = '22023';
  end if;
  new.body := left(shared.body, 5000);
  return new;
end;
$$;
revoke execute on function public.messages_shared_entry() from public, anon, authenticated;

create trigger messages_shared_entry
  before insert on public.messages
  for each row execute function public.messages_shared_entry();

-- El psicólogo de la conversación lee la nota que le compartieron (su ánimo, su tema y su fecha), aunque
-- no tenga el diario compartido. Nunca una privada, nunca su réplica, y solo mientras la atiende: al
-- terminar el proceso le queda el texto del mensaje, nada más.
create policy entries_message_read on public.entries for select to authenticated
  using (
    reply_mode <> 'private'
    and exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.entry_id = entries.id
        and m.sender = 'user'
        and c.user_id = entries.user_id
        and c.psychologist_id = (select auth.uid())
        and c.ended_at is null
    )
  );

-- 2. La hora en que se escribió ---------------------------------------------------------------------

-- Una nota que esperó en la bandeja del navegador dice cuándo se escribió. Se acepta hasta tres días
-- atrás (lo mismo que reintenta la réplica del día) y nunca en el futuro: fuera de eso, ahora.
drop function public.create_entry(uuid, text, text, text, text, boolean);

create function public.create_entry(
  p_id uuid,
  p_body text,
  p_mood text,
  p_tag text,
  p_prompt text default null,
  p_private boolean default false,
  p_written_at timestamptz default null
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
  written timestamptz := now();
begin
  if me is null then
    raise exception 'Sin sesión' using errcode = '28000';
  end if;
  select id into tag from public.tags where name = p_tag;
  if tag is null then
    raise exception 'Tema desconocido' using errcode = '22023';
  end if;
  if p_written_at is not null and p_written_at <= now() and p_written_at >= now() - interval '3 days' then
    written := p_written_at;
  end if;
  insert into public.entries (id, user_id, body, mood, prompt, reply_mode, created_at)
  values (p_id, me, p_body, p_mood, p_prompt, case when p_private then 'private' else 'day' end, written)
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
revoke execute on function public.create_entry(uuid, text, text, text, text, boolean, timestamptz) from public, anon;
grant execute on function public.create_entry(uuid, text, text, text, text, boolean, timestamptz) to authenticated;

-- 3. Recordatorio diario ----------------------------------------------------------------------------

-- El día local en que ya se mandó el recordatorio: uno por día, como mucho.
alter table public.user_settings add column reminder_sent_on date;

-- La suscripción de este navegador. Si el mismo navegador la tenía otra cuenta (se cerró sesión sin
-- conexión, por ejemplo), pasa a la cuenta que la registra ahora: los avisos son de quien está aquí.
create function public.register_push(p_token text)
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
  if p_token is null or char_length(p_token) > 4000 or (p_token::jsonb ->> 'endpoint') not like 'https://%' then
    raise exception 'Suscripción inválida' using errcode = '22023';
  end if;
  delete from public.push_tokens where token = p_token and user_id <> me;
  insert into public.push_tokens (user_id, platform, token) values (me, 'web', p_token)
  on conflict (token) do nothing;
end;
$$;
revoke execute on function public.register_push(text) from public, anon;
grant execute on function public.register_push(text) to authenticated;

-- A quién le toca ahora: tiene el recordatorio puesto, ya pasó su hora (hace menos de una hora, en su
-- zona), hoy no escribió, no lo recibió hoy y tiene al menos un navegador suscrito.
create function public.due_reminders(p_limit integer default 200)
returns table (user_id uuid, day date)
language sql
stable
security definer
set search_path = ''
as $$
  select s.user_id, (now() at time zone s.timezone)::date
  from public.user_settings s
  where s.reminder_enabled
    and s.reminder_time is not null
    and (now() at time zone s.timezone)::time - s.reminder_time >= interval '0'
    and (now() at time zone s.timezone)::time - s.reminder_time < interval '1 hour'
    and s.reminder_sent_on is distinct from (now() at time zone s.timezone)::date
    and not exists (
      select 1 from public.entries e
      where e.user_id = s.user_id and e.day = (now() at time zone s.timezone)::date
    )
    and exists (select 1 from public.push_tokens t where t.user_id = s.user_id)
  limit p_limit;
$$;
revoke execute on function public.due_reminders(integer) from public, anon, authenticated;

create function public.call_send_reminders()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  project_url text;
  cron_secret text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into cron_secret from vault.decrypted_secrets where name = 'cron_secret';
  if project_url is null or cron_secret is null then
    return;
  end if;
  if not exists (select 1 from public.due_reminders(1)) then
    return;
  end if;
  perform net.http_post(
    url := project_url || '/functions/v1/send-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', cron_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
end;
$$;
revoke execute on function public.call_send_reminders() from public, anon, authenticated;

select cron.schedule('recordatorios', '*/15 * * * *', 'select public.call_send_reminders()');
