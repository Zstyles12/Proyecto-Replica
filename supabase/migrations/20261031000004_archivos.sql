-- Storage (docs/03-base-de-datos.md). Cada archivo vive dentro de una carpeta con el id de su dueño:
-- avatars/<id>/foto.jpg, credentials/<id>/titulo.pdf.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('credentials', 'credentials', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Público de lectura: Storage sirve estas fotos sin pasar por las reglas de acceso. Para escribir,
-- solo en la carpeta propia.
create policy avatars_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_own_read on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Privado: el dueño y el administrador, con URL firmadas. Reemplazar un documento sube uno nuevo; el
-- anterior queda en el historial de la solicitud, así que aquí no se edita ni se borra.
create policy credentials_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'credentials' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy credentials_read on storage.objects for select to authenticated
  using (
    bucket_id = 'credentials'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );
