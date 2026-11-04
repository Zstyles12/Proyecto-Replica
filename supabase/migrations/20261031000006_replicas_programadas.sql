-- La réplica del día la genera el servidor aunque la persona no tenga la web abierta (RF-18, RF-19).
-- Cada 15 minutos se mira si a alguien le toca; si a nadie, no se llama a la función.
--
-- Necesita dos secretos en Vault, que pone la persona responsable (supabase/README.md):
-- project_url y cron_secret. Sin ellos no hace nada.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create function public.call_generate_day_reply()
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
  if not exists (select 1 from public.due_day_replies(1)) then
    return;
  end if;
  perform net.http_post(
    url := project_url || '/functions/v1/generate-day-reply',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', cron_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;
revoke execute on function public.call_generate_day_reply() from public, anon, authenticated;

select cron.schedule('replicas-del-dia', '*/15 * * * *', 'select public.call_generate_day_reply()');
