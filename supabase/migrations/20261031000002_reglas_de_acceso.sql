-- Reglas de acceso (docs/03-base-de-datos.md): RLS en el 100 % de las tablas. Además, cada tabla dice
-- qué columnas puede tocar el cliente: lo que no aparece aquí solo lo escribe el servidor.

-- Supabase da permisos amplios por defecto: se quitan y se vuelve a dar solo lo necesario.
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.push_tokens enable row level security;
alter table public.entries enable row level security;
alter table public.tags enable row level security;
alter table public.entry_tags enable row level security;
alter table public.ai_replies enable row level security;
alter table public.day_replies enable row level security;
alter table public.day_reply_comments enable row level security;
alter table public.ai_usage enable row level security;
alter table public.daily_phrases enable row level security;
alter table public.saved_phrases enable row level security;
alter table public.psychologist_profiles enable row level security;
alter table public.verification_documents enable row level security;
alter table public.verification_reviews enable row level security;
alter table public.care_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.appointments enable row level security;
alter table public.messages enable row level security;
alter table public.diary_shares enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.ai_chats enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.help_resources enable row level security;

-- Se lee del perfil y no del token: quitarle el rol a alguien vale desde ese mismo momento.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Cuentas ------------------------------------------------------------------------------------------

grant select on public.profiles to authenticated;
grant update (name, intention, avatar_url, terms_version, terms_accepted_at, setup_done_at) on public.profiles to authenticated;

create policy profiles_own_read on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_own_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_admin_read on public.profiles for select to authenticated
  using ((select public.is_admin()));
-- El psicólogo ve el nombre de quien está en su consulta.
create policy profiles_patient_read on public.profiles for select to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.user_id = profiles.id and c.psychologist_id = (select auth.uid())
  ));

grant select on public.user_settings to authenticated;
grant update (reply_tone, day_reply_hour, theme, reminder_enabled, reminder_time, timezone) on public.user_settings to authenticated;

create policy user_settings_own_read on public.user_settings for select to authenticated
  using (user_id = (select auth.uid()));
create policy user_settings_own_update on public.user_settings for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, delete on public.push_tokens to authenticated;
grant insert (platform, token) on public.push_tokens to authenticated;

create policy push_tokens_own_read on public.push_tokens for select to authenticated
  using (user_id = (select auth.uid()));
create policy push_tokens_own_insert on public.push_tokens for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy push_tokens_own_delete on public.push_tokens for delete to authenticated
  using (user_id = (select auth.uid()));

-- Diario. Las notas se crean solo con create_entry (reglas de producto) y no se borran ni se editan:
-- del cliente solo cambia la marca de favorita. ----------------------------------------------------

grant select on public.entries to authenticated;
grant update (is_favorite) on public.entries to authenticated;

create policy entries_own_read on public.entries for select to authenticated
  using (user_id = (select auth.uid()));
create policy entries_own_favorite on public.entries for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- El psicólogo lee las no privadas, y solo con un permiso activo.
create policy entries_shared_read on public.entries for select to authenticated
  using (
    reply_mode <> 'private'
    and exists (
      select 1 from public.diary_shares s
      where s.user_id = entries.user_id and s.psychologist_id = (select auth.uid()) and s.active
    )
  );

grant select on public.tags to authenticated;
create policy tags_read on public.tags for select to authenticated using (true);

grant select on public.entry_tags to authenticated;
create policy entry_tags_read on public.entry_tags for select to authenticated
  using (exists (select 1 from public.entries e where e.id = entry_tags.entry_id));

-- Las réplicas las escribe solo el servidor. El psicólogo no las ve: son de la persona.
grant select on public.ai_replies to authenticated;
create policy ai_replies_own_read on public.ai_replies for select to authenticated
  using (exists (
    select 1 from public.entries e
    where e.id = ai_replies.entry_id and e.user_id = (select auth.uid())
  ));

grant select on public.day_replies to authenticated;
create policy day_replies_own_read on public.day_replies for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.day_reply_comments to authenticated;
create policy day_reply_comments_own_read on public.day_reply_comments for select to authenticated
  using (exists (
    select 1 from public.day_replies d
    where d.id = day_reply_comments.day_reply_id and d.user_id = (select auth.uid())
  ));

-- ai_usage: sin permisos ni reglas para el cliente. Solo el servidor.

-- Cofre --------------------------------------------------------------------------------------------

grant select on public.daily_phrases to authenticated;
create policy daily_phrases_read on public.daily_phrases for select to authenticated using (true);

grant select, delete on public.saved_phrases to authenticated;
grant insert (reply_id, daily_phrase_id, saved_at) on public.saved_phrases to authenticated;

create policy saved_phrases_own_read on public.saved_phrases for select to authenticated
  using (user_id = (select auth.uid()));
create policy saved_phrases_own_delete on public.saved_phrases for delete to authenticated
  using (user_id = (select auth.uid()));
-- Solo se guarda una frase de una réplica propia.
create policy saved_phrases_own_insert on public.saved_phrases for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (reply_id is null or exists (select 1 from public.ai_replies r where r.id = reply_id))
  );

-- Psicólogos ---------------------------------------------------------------------------------------

-- Sin status, verified_at ni status_reason: la verificación la cambia solo un administrador.
grant select on public.psychologist_profiles to authenticated;
grant insert (profile_id, full_name, title, license, university, specialties, approach, years_experience, bio, meet_link, availability, ethics_accepted_at, ethics_version)
  on public.psychologist_profiles to authenticated;
grant update (full_name, title, license, university, specialties, approach, years_experience, bio, meet_link, availability, ethics_accepted_at, ethics_version)
  on public.psychologist_profiles to authenticated;

create policy psychologist_profiles_own_read on public.psychologist_profiles for select to authenticated
  using (profile_id = (select auth.uid()));
create policy psychologist_profiles_admin_read on public.psychologist_profiles for select to authenticated
  using ((select public.is_admin()));
create policy psychologist_profiles_own_insert on public.psychologist_profiles for insert to authenticated
  with check (profile_id = (select auth.uid()));
create policy psychologist_profiles_own_update on public.psychologist_profiles for update to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- El directorio: lo público de los perfiles verificados, sin el link personal ni los datos de la
-- solicitud. Quien ya tiene una conversación sigue viendo a su psicólogo aunque deje de estar en él.
-- Corre con los permisos de su dueño a propósito: la tabla no se le abre a todos.
create view public.psychologist_directory
with (security_barrier = true)
as
  select
    p.profile_id as id,
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
revoke all on public.psychologist_directory from anon, authenticated;
grant select on public.psychologist_directory to authenticated;

grant select on public.verification_documents to authenticated;
grant insert (id, application_id, path, name, size_bytes, mime_type) on public.verification_documents to authenticated;

create policy verification_documents_read on public.verification_documents for select to authenticated
  using (application_id = (select auth.uid()) or (select public.is_admin()));
create policy verification_documents_own_insert on public.verification_documents for insert to authenticated
  with check (application_id = (select auth.uid()));

grant select on public.verification_reviews to authenticated;
grant insert (application_id, admin_id, action, reason) on public.verification_reviews to authenticated;

create policy verification_reviews_read on public.verification_reviews for select to authenticated
  using (application_id = (select auth.uid()) or (select public.is_admin()));
create policy verification_reviews_admin_insert on public.verification_reviews for insert to authenticated
  with check ((select public.is_admin()) and admin_id = (select auth.uid()));

grant select on public.care_requests to authenticated;
grant insert (psychologist_id, message) on public.care_requests to authenticated;
grant update (status, responded_at) on public.care_requests to authenticated;

create policy care_requests_parties_read on public.care_requests for select to authenticated
  using (user_id = (select auth.uid()) or psychologist_id = (select auth.uid()));
create policy care_requests_own_insert on public.care_requests for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy care_requests_withdraw on public.care_requests for update to authenticated
  using (user_id = (select auth.uid()) and status = 'pending')
  with check (user_id = (select auth.uid()) and status = 'withdrawn');
create policy care_requests_answer on public.care_requests for update to authenticated
  using (psychologist_id = (select auth.uid()) and status = 'pending')
  with check (psychologist_id = (select auth.uid()) and status in ('accepted', 'declined'));

grant select on public.conversations to authenticated;
grant insert (id, psychologist_id) on public.conversations to authenticated;
grant update (last_read_at, ended_at, ended_by) on public.conversations to authenticated;

create policy conversations_parties_read on public.conversations for select to authenticated
  using (user_id = (select auth.uid()) or psychologist_id = (select auth.uid()));
create policy conversations_own_insert on public.conversations for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.psychologist_directory d where d.id = psychologist_id
    )
  );
-- Cada parte firma solo su propia salida.
create policy conversations_parties_update on public.conversations for update to authenticated
  using (user_id = (select auth.uid()) or psychologist_id = (select auth.uid()))
  with check (
    (user_id = (select auth.uid()) or psychologist_id = (select auth.uid()))
    and (
      ended_by is null
      or (ended_by = 'user' and user_id = (select auth.uid()))
      or (ended_by = 'psychologist' and psychologist_id = (select auth.uid()))
    )
  );

grant select on public.appointments to authenticated;
grant insert (conversation_id, starts_at, meet_link) on public.appointments to authenticated;
grant update (starts_at, meet_link, cancelled_at) on public.appointments to authenticated;

create policy appointments_parties_read on public.appointments for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = appointments.conversation_id));
-- Las sesiones las agenda y las cancela el psicólogo.
create policy appointments_psychologist_insert on public.appointments for insert to authenticated
  with check (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.psychologist_id = (select auth.uid()) and c.ended_at is null
  ));
create policy appointments_psychologist_update on public.appointments for update to authenticated
  using (exists (
    select 1 from public.conversations c
    where c.id = appointments.conversation_id and c.psychologist_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.conversations c
    where c.id = appointments.conversation_id and c.psychologist_id = (select auth.uid())
  ));

grant select on public.messages to authenticated;
grant insert (id, conversation_id, entry_id, sender, body) on public.messages to authenticated;

create policy messages_parties_read on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = messages.conversation_id));
-- Se escribe solo en una conversación abierta y en nombre propio. Los mensajes de sistema (sesiones y
-- eventos) los genera el servidor. Una nota compartida es propia y nunca privada.
create policy messages_parties_insert on public.messages for insert to authenticated
  with check (
    kind = 'text'
    and appointment_id is null
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.ended_at is null
        and (
          (sender = 'user' and c.user_id = (select auth.uid()))
          or (sender = 'psychologist' and c.psychologist_id = (select auth.uid()))
        )
    )
    and (
      entry_id is null
      or exists (
        select 1 from public.entries e
        where e.id = entry_id and e.user_id = (select auth.uid()) and e.reply_mode <> 'private'
      )
    )
  );

grant select on public.diary_shares to authenticated;
grant insert (psychologist_id, active) on public.diary_shares to authenticated;
grant update (active) on public.diary_shares to authenticated;

create policy diary_shares_parties_read on public.diary_shares for select to authenticated
  using (user_id = (select auth.uid()) or psychologist_id = (select auth.uid()));
-- Compartir es explícito y solo con el psicólogo actual. Retirarlo se puede siempre.
create policy diary_shares_own_insert on public.diary_shares for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      not active
      or exists (
        select 1 from public.conversations c
        where c.user_id = (select auth.uid()) and c.psychologist_id = diary_shares.psychologist_id and c.ended_at is null
      )
    )
  );
create policy diary_shares_own_update on public.diary_shares for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      not active
      or exists (
        select 1 from public.conversations c
        where c.user_id = (select auth.uid()) and c.psychologist_id = diary_shares.psychologist_id and c.ended_at is null
      )
    )
  );

-- Solo su autor, y nunca la persona.
grant select, delete on public.clinical_notes to authenticated;
grant insert (patient_id, body) on public.clinical_notes to authenticated;
grant update (body) on public.clinical_notes to authenticated;

create policy clinical_notes_author on public.clinical_notes for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()));

-- Chat con la IA. Las respuestas las escribe solo el servidor. ---------------------------------------

grant select, delete on public.ai_chats to authenticated;
grant insert (id, title) on public.ai_chats to authenticated;
grant update (title) on public.ai_chats to authenticated;

create policy ai_chats_own on public.ai_chats for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select on public.ai_chat_messages to authenticated;
grant insert (id, chat_id, role, body) on public.ai_chat_messages to authenticated;

create policy ai_chat_messages_own_read on public.ai_chat_messages for select to authenticated
  using (exists (select 1 from public.ai_chats c where c.id = ai_chat_messages.chat_id));
create policy ai_chat_messages_own_insert on public.ai_chat_messages for insert to authenticated
  with check (role = 'user' and exists (select 1 from public.ai_chats c where c.id = chat_id));

-- Líneas de atención: las lee cualquiera, incluso sin sesión; solo un administrador las cambia.
grant select on public.help_resources to anon, authenticated;
grant insert, update, delete on public.help_resources to authenticated;

create policy help_resources_public_read on public.help_resources for select to anon
  using (active);
create policy help_resources_read on public.help_resources for select to authenticated
  using (active or (select public.is_admin()));
create policy help_resources_admin_insert on public.help_resources for insert to authenticated
  with check ((select public.is_admin()));
create policy help_resources_admin_update on public.help_resources for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy help_resources_admin_delete on public.help_resources for delete to authenticated
  using ((select public.is_admin()));
