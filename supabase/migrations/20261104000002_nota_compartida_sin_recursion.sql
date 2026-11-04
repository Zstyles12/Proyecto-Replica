-- Fase 17: entries_message_read consultaba messages, y la regla de inserción de messages consulta
-- entries. Postgres ve el círculo y rechaza todo mensaje nuevo ("infinite recursion detected in
-- policy"). La consulta a messages pasa a una función que no vuelve a pasar por las reglas.

-- Si quien pregunta es el psicólogo de una conversación abierta en la que la persona le compartió esta
-- nota. Solo responde por quien la llama.
create function public.entry_shared_with_me(p_entry uuid, p_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.entry_id = p_entry
      and m.sender = 'user'
      and c.user_id = p_owner
      and c.psychologist_id = (select auth.uid())
      and c.ended_at is null
  );
$$;
revoke execute on function public.entry_shared_with_me(uuid, uuid) from public, anon;
grant execute on function public.entry_shared_with_me(uuid, uuid) to authenticated;

drop policy entries_message_read on public.entries;
create policy entries_message_read on public.entries for select to authenticated
  using (reply_mode <> 'private' and public.entry_shared_with_me(id, user_id));
