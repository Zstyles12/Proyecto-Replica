-- Esquema de Replica (docs/03-base-de-datos.md). Las columnas son las del diagrama entidad-relación
-- (entrega-evaluacion-3/fuentes/er.mjs) más las del área profesional. Lo que se agregó después del
-- diagrama está anotado en 03-base-de-datos.md, "Lo que se agregó al implementar".

-- Cuentas ------------------------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Refleja app_metadata para poder leerlo: lo cambia solo el servidor.
  role text not null default 'user' check (role in ('user', 'psychologist', 'admin')),
  name text not null default '' check (char_length(name) <= 80),
  intention text not null default '' check (char_length(intention) <= 200),
  avatar_url text,
  -- RF-08: qué versión de los términos aceptó y cuándo. Si cambia, se vuelve a pedir.
  terms_version text,
  terms_accepted_at timestamptz,
  -- Terminó la configuración inicial: al volver a entrar se la salta.
  setup_done_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  reply_tone text not null default 'suave' check (reply_tone in ('suave', 'profundo', 'directo')),
  day_reply_hour smallint not null default 22 check (day_reply_hour in (20, 22)),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  reminder_enabled boolean not null default false,
  reminder_time time,
  -- La zona horaria de la persona: el día de cada nota y la hora de su réplica se cuentan en ella.
  timezone text not null default 'UTC'
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  platform text not null default 'web',
  token text not null unique,
  created_at timestamptz not null default now()
);

-- Diario -------------------------------------------------------------------------------------------

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 20000),
  mood text not null check (mood in ('paz', 'alegria', 'gratitud', 'reflexion', 'cansancio', 'ansiedad', 'tristeza')),
  prompt text,
  -- Lo decide el servidor al guardar (entries_before_insert); el cliente solo dice si es privada.
  reply_mode text not null default 'day' check (reply_mode in ('instant', 'day', 'private')),
  is_favorite boolean not null default false,
  -- El día local de la persona al escribirla.
  day date not null,
  created_at timestamptz not null default now()
);
create index entries_user_created_idx on public.entries (user_id, created_at desc);
create index entries_user_day_idx on public.entries (user_id, day);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.entry_tags (
  entry_id uuid not null references public.entries (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (entry_id, tag_id)
);

create table public.ai_replies (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null unique references public.entries (id) on delete cascade,
  headline text not null,
  body text not null,
  questions jsonb not null default '[]',
  learning text not null,
  created_at timestamptz not null default now()
);

create table public.day_replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('day', 'late')),
  headline text not null,
  body text not null,
  questions jsonb not null default '[]',
  learning text not null,
  -- Qué notas leyó: la última réplica lee solo las que esta no leyó.
  entry_ids uuid[] not null,
  created_at timestamptz not null default now(),
  unique (user_id, day, kind)
);

create table public.day_reply_comments (
  id uuid primary key default gen_random_uuid(),
  day_reply_id uuid not null references public.day_replies (id) on delete cascade,
  entry_id uuid not null references public.entries (id) on delete cascade,
  comment text not null,
  unique (day_reply_id, entry_id)
);
create index day_reply_comments_entry_idx on public.day_reply_comments (entry_id);

-- RF-20: máximo tres llamadas a la IA por persona al día. Lo cuenta solo el servidor.
create table public.ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  calls smallint not null default 0,
  primary key (user_id, day)
);

-- Cofre --------------------------------------------------------------------------------------------

create table public.daily_phrases (
  -- El id de features/cofre/library.ts: no se reutiliza porque guarda favoritos.
  id text primary key,
  body text not null,
  author text,
  kind text not null check (kind in ('aliento', 'cita'))
);

create table public.saved_phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reply_id uuid references public.ai_replies (id) on delete cascade,
  daily_phrase_id text references public.daily_phrases (id) on delete cascade,
  saved_at timestamptz not null default now(),
  check (num_nonnulls(reply_id, daily_phrase_id) = 1),
  unique (user_id, reply_id),
  unique (user_id, daily_phrase_id)
);

-- Psicólogos ---------------------------------------------------------------------------------------

create table public.psychologist_profiles (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null,
  title text not null default '',
  license text not null,
  university text,
  specialties text[] not null default '{}',
  approach text not null default '',
  years_experience smallint not null default 0 check (years_experience >= 0),
  bio text not null default '',
  meet_link text,
  -- Días, franjas y duración de las sesiones.
  availability jsonb,
  -- Reemplaza a verification_status del diagrama: los cuatro estados de la solicitud.
  status text not null default 'pending' check (status in ('pending', 'needs_changes', 'approved', 'rejected')),
  status_reason text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  ethics_accepted_at timestamptz,
  ethics_version text
);
create index psychologist_profiles_status_idx on public.psychologist_profiles (status);

create table public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.psychologist_profiles (profile_id) on delete cascade,
  path text not null unique,
  name text not null,
  size_bytes bigint not null check (size_bytes > 0),
  mime_type text not null,
  replaced boolean not null default false,
  created_at timestamptz not null default now()
);
create index verification_documents_application_idx on public.verification_documents (application_id);

-- El historial de la auditoría: no se edita ni se borra.
create table public.verification_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.psychologist_profiles (profile_id) on delete cascade,
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in ('approved', 'needs_changes', 'rejected')),
  reason text,
  created_at timestamptz not null default now()
);
create index verification_reviews_application_idx on public.verification_reviews (application_id, created_at desc);

create table public.care_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  psychologist_id uuid not null references public.psychologist_profiles (profile_id) on delete cascade,
  message text not null default '' check (char_length(message) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
-- Una sola solicitud abierta por persona.
create unique index care_requests_one_open_idx on public.care_requests (user_id) where status = 'pending';
create index care_requests_psychologist_idx on public.care_requests (psychologist_id, status);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  psychologist_id uuid not null references public.psychologist_profiles (profile_id) on delete cascade,
  created_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  ended_at timestamptz,
  ended_by text check (ended_by in ('user', 'psychologist')),
  unique (user_id, psychologist_id)
);
-- Solo un psicólogo activo a la vez.
create unique index conversations_one_active_idx on public.conversations (user_id) where ended_at is null;
create index conversations_psychologist_idx on public.conversations (psychologist_id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  starts_at timestamptz not null,
  meet_link text not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);
create index appointments_conversation_idx on public.appointments (conversation_id, starts_at);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  entry_id uuid references public.entries (id) on delete set null,
  sender text not null check (sender in ('user', 'psychologist', 'system')),
  kind text not null default 'text' check (kind in ('text', 'session', 'event')),
  body text not null default '' check (char_length(body) <= 5000),
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create table public.diary_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  psychologist_id uuid not null references public.psychologist_profiles (profile_id) on delete cascade,
  active boolean not null default false,
  changed_at timestamptz not null default now(),
  unique (user_id, psychologist_id)
);
create index diary_shares_psychologist_idx on public.diary_shares (psychologist_id) where active;

create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null default auth.uid() references public.psychologist_profiles (profile_id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index clinical_notes_author_idx on public.clinical_notes (psychologist_id, patient_id, created_at desc);

-- Chat con la IA y ayuda en crisis (Fase 15) -------------------------------------------------------

create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null default '',
  created_at timestamptz not null default now()
);
create index ai_chats_user_idx on public.ai_chats (user_id, created_at desc);

create table public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.ai_chats (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  body text not null,
  created_at timestamptz not null default now()
);
create index ai_chat_messages_chat_idx on public.ai_chat_messages (chat_id, created_at);

create table public.help_resources (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  kind text not null,
  name text not null,
  contact text not null,
  description text not null default '',
  -- Cada línea lleva su fuente oficial y la fecha en que se comprobó (RF-60).
  source_url text not null,
  checked_at date not null,
  active boolean not null default true
);
create index help_resources_country_idx on public.help_resources (country) where active;
