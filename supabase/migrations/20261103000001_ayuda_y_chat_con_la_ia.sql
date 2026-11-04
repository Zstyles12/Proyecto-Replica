-- Fase 15: señales de riesgo, el chat con Replica y las líneas de ayuda en crisis.

-- Señales de riesgo (RF-61): las marca el servidor, nunca el cliente. Con risk, la web enlaza a /ayuda.
alter table public.ai_replies add column risk boolean not null default false;
alter table public.day_replies add column risk boolean not null default false;
alter table public.ai_chat_messages add column risk boolean not null default false;

-- La réplica del día guarda su riesgo en la misma inserción, para que nunca llegue sin él.
drop function public.save_day_reply(uuid, date, text, text, text, jsonb, text, uuid[], jsonb);

create function public.save_day_reply(
  p_user uuid,
  p_day date,
  p_kind text,
  p_headline text,
  p_body text,
  p_questions jsonb,
  p_learning text,
  p_entry_ids uuid[],
  p_comments jsonb,
  p_risk boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  reply uuid;
begin
  insert into public.day_replies (user_id, day, kind, headline, body, questions, learning, entry_ids, risk)
  values (p_user, p_day, p_kind, p_headline, p_body, p_questions, p_learning, p_entry_ids, p_risk)
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

revoke execute on function public.save_day_reply(uuid, date, text, text, text, jsonb, text, uuid[], jsonb, boolean) from public, anon, authenticated;
grant execute on function public.save_day_reply(uuid, date, text, text, text, jsonb, text, uuid[], jsonb, boolean) to service_role;

-- El chat con Replica tiene su propio límite diario (RN-04), en el día local de la persona.
alter table public.ai_usage add column chat_messages smallint not null default 0;

create function public.take_chat_message(p_user uuid, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date;
begin
  select (now() at time zone coalesce(s.timezone, 'UTC'))::date into today
  from public.user_settings s where s.user_id = p_user;
  today := coalesce(today, (now() at time zone 'UTC')::date);

  insert into public.ai_usage as u (user_id, day, calls, chat_messages)
  values (p_user, today, 0, 1)
  on conflict (user_id, day) do update set chat_messages = u.chat_messages + 1 where u.chat_messages < p_limit;
  return found;
end;
$$;

create function public.give_back_chat_message(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  today date;
begin
  select (now() at time zone coalesce(s.timezone, 'UTC'))::date into today
  from public.user_settings s where s.user_id = p_user;
  update public.ai_usage set chat_messages = greatest(chat_messages - 1, 0)
  where user_id = p_user and day = coalesce(today, (now() at time zone 'UTC')::date);
end;
$$;

revoke execute on function public.take_chat_message(uuid, integer) from public, anon, authenticated;
revoke execute on function public.give_back_chat_message(uuid) from public, anon, authenticated;
grant execute on function public.take_chat_message(uuid, integer) to service_role;
grant execute on function public.give_back_chat_message(uuid) to service_role;

-- Los mensajes del chat los escribe chat-with-ai. El cliente lee y borra sus conversaciones, y ya no
-- las crea por su cuenta: así cada mensaje pasa por el límite.
revoke insert on public.ai_chats from authenticated;
revoke insert on public.ai_chat_messages from authenticated;
drop policy ai_chat_messages_own_insert on public.ai_chat_messages;

-- Líneas de ayuda (RF-60). Cada una con su página oficial y la fecha en que se comprobó; la lista la
-- aprueba la persona responsable antes de aplicarla. Por ahora solo Venezuela, el país donde se pueden
-- comprobar; uno que no está aquí no muestra ningún número.
insert into public.help_resources (country, kind, name, contact, description, source_url, checked_at) values
  ('VE', 'line', 'Línea de orientación psicológica', '0800-29832-01',
   '0800-AYUDA-01, del Ministerio de Salud. Gratuita, de lunes a viernes de 8:00 a 20:00.',
   'https://mpps.gob.ve/salud-mental-post-sismo-un-esfuerzo-colectivo-para-una-buena-recuperacion-emocional/', '2026-11-03'),
  ('VE', 'line', 'Línea de Atención Psicológica (LAPSI)', '0424-2907338',
   'De la Federación de Psicólogos de Venezuela. Primeros auxilios psicológicos e intervención en crisis.',
   'https://www.instagram.com/p/DaK-Eovpdo2/', '2026-11-03');
