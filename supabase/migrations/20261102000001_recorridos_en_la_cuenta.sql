-- Los recorridos vistos son de la cuenta: en otro navegador no se repiten. Van en user_settings y no en
-- profiles porque el psicólogo puede leer el perfil de quien está en su consulta.

alter table public.user_settings
  add column tutorials_seen text[] not null default '{}' check (cardinality(tutorials_seen) <= 20),
  add column tutorials_skipped boolean not null default false;

grant update (tutorials_seen, tutorials_skipped) on public.user_settings to authenticated;
