-- Borrar una nota (docs/DESIGN-WEB.md §11): cada persona borra solo las suyas. Su tema, su réplica (y con
-- ella su lugar en el cofre) y el comentario de la réplica del día se van en cascada; el mensaje del chat
-- que la compartió se queda con su texto, sin el enlace.
grant delete on public.entries to authenticated;

create policy entries_own_delete on public.entries for delete to authenticated
  using (user_id = (select auth.uid()));
