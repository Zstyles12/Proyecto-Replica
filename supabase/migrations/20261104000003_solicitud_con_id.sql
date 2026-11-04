-- La web le pone el id a la solicitud de acompañamiento antes de enviarla (la muestra al momento y la
-- reconoce cuando vuelve), igual que con los mensajes. Sin este permiso, toda solicitud desde la web
-- fallaba con "permission denied for table care_requests".
grant insert (id) on public.care_requests to authenticated;
