-- Alertas del asesor de seguridad de Supabase (Security Advisor), 3 de noviembre.

-- 1. "Security Definer View": el directorio corría con los permisos de su dueño para no abrirle a todos
-- la tabla psychologist_profiles. Lo mismo se logra con una función que entrega solo las columnas
-- públicas, y la vista pasa a correr con los permisos de quien consulta (security_invoker). La web la
-- sigue leyendo igual.
create function public.directory_entries()
returns table (
  id uuid,
  full_name text,
  title text,
  license text,
  specialties text[],
  approach text,
  years_experience smallint,
  bio text,
  availability jsonb,
  avatar_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  -- Lo público de los perfiles verificados, sin el link personal ni los datos de la solicitud. Quien ya
  -- tiene una conversación sigue viendo a su psicólogo aunque deje de estar en el directorio.
  select
    p.profile_id,
    p.full_name,
    p.title,
    p.license,
    p.specialties,
    p.approach,
    p.years_experience,
    p.bio,
    p.availability,
    u.avatar_url
  from public.psychologist_profiles p
  join public.profiles u on u.id = p.profile_id
  where p.status = 'approved'
    or exists (
      select 1 from public.conversations c
      where c.psychologist_id = p.profile_id and c.user_id = (select auth.uid())
    );
$$;
revoke execute on function public.directory_entries() from public, anon;
grant execute on function public.directory_entries() to authenticated;

create or replace view public.psychologist_directory
with (security_barrier = true, security_invoker = true)
as
  select id, full_name, title, license, specialties, approach, years_experience, bio, availability, avatar_url
  from public.directory_entries();

-- 2. "Public Can Execute SECURITY DEFINER Function: rls_auto_enable": la crea Supabase para activar RLS
-- en cada tabla nueva. Es de un disparador de eventos, que no necesita que nadie la pueda llamar.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

-- El resto de "Signed-In Users Can Execute SECURITY DEFINER Function" es a propósito: create_entry,
-- submit_application, end_conversation, mark_conversation_read, register_push y las demás son la única
-- puerta para esas escrituras y revisan dentro quién llama. is_admin, entry_shared_with_me y
-- directory_entries las usan las reglas de acceso y solo responden por quien consulta.
