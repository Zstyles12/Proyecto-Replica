# Plan de trabajo — Web

> Adaptado del plan de la app. Misma estructura de etapas, pantallas equivalentes. Se agrega una Fase 0 para reflejar honestamente el punto de partida real del proyecto web al momento de este documento.

## Fase 0 — Descarte y realineación (punto de partida real)

Antes de este plan, se construyó una primera versión de Login/Registro con un sistema de diseño distinto ("Santuario Emocional": lavanda/verde salvia, Material Design 3, autenticación con contraseña) que **no coincide** con `DESIGN.md` ("Telar") ni con el flujo de autenticación real del producto (sin contraseña, código de 6 dígitos + Apple/Google).

- [ ] Archivar o eliminar los componentes de la versión anterior (`Login.tsx`, `Registro.tsx` y sus componentes asociados en `components/login/`) — no se adaptan, se reconstruyen.
- [ ] Configurar `tailwind.config.js` y las variables CSS del proyecto con los tokens exactos de `DESIGN.md` (sección 3.3 ya trae el CSS listo para copiar).
- [ ] Reemplazar el `GEMINI.md` anterior por uno nuevo que apunte a estos 5 documentos (`01-resumen.md`, `02-estructura.md`, `03-base-de-datos.md`, `04-plan.md`, `DESIGN.md`) como fuente de verdad.
- [ ] Desconectar o archivar los proyectos de Stitch con la identidad "Santuario Emocional" — los mockups de referencia ahora son los de `design-reference/` ("Serena") que ya existen para la app.

## Etapa A — Web con datos simulados

### Fase 1 — Dirección visual y base
- [ ] Confirmar stack: React + Vite + TypeScript + Tailwind + shadcn/ui (ver `02-estructura.md`)
- [ ] Tokens de color claro/oscuro, tipografía (Alegreya / Alegreya Sans) y movimiento, copiados literalmente de `DESIGN.md`
- [ ] Componentes base y primitivas de movimiento en una ruta de desarrollo tipo `/playground` (equivalente web del playground de la app)
- [ ] Probar en Chrome y Safari de escritorio

### Fase 2 — Navegación y estructura de secciones
- [ ] Layout de navegación de 5 secciones (Inicio, Notas, Evolución, Chat, Usuario), responsive: barra lateral/superior en desktop, barra inferior en mobile web
- [ ] Splash/landing con el logo definitivo (pendiente, ver sección de pendientes) y onboarding corto
- [ ] Tema (claro/oscuro/sistema) guardado entre sesiones (`localStorage` mientras no hay cuenta; `user_settings` después)
- [ ] Probar en mobile web (Chrome Android, Safari iOS)

### Fase 3 — Autenticación y onboarding
- [ ] Bienvenida (páginas cortas de introducción) → Entrar/Crear cuenta (Google, Apple si aplica, correo con código de 6 dígitos — sin contraseña) → Consentimiento (18+, términos, IA lee las notas) → Configuración (nombre, tono, recordatorio, bloqueo) → Listo
- [ ] Todo simulado (`services/auth`) hasta conectar Supabase: cualquier código de 6 dígitos entra, `000000` simula error
- [ ] Probar el flujo completo en mobile web

### Fase 4 — Inicio (escribir)
- [ ] Saludo, racha visual ("tela"), pastillas de ánimo y tema (obligatorias, con las preguntas amables de Replica si faltan), la hoja de escribir
- [ ] Dictado por voz vía Web Speech API con degradación elegante si el navegador no lo soporta
- [ ] Animación de guardado (pasada del hilo) y réplica en streaming
- [ ] Notas guardadas localmente (datos simulados, 3 notas de ejemplo)
- [ ] Probar en Chrome (con dictado) y Safari (sin dictado, verificar que no rompe)

### Fase 5 — Notas y Chat
- [ ] Notas: lista por día, búsqueda (sin tildes), filtros por ánimo/tema, detalle con réplica y comentario de la réplica del día
- [ ] "Tu día": réplica del día, última réplica si la hubo, notas del día
- [ ] Chat: lista de conversaciones, directorio de psicólogos con filtro por especialidad, perfil de psicólogo
- [ ] Conversación simulada con "escribiendo…"; agendar sesión (modal/hoja) con tarjeta de "Unirse por Meet"
- [ ] Compartir/retirar el diario con consentimiento explícito
- [ ] Probar en mobile web

### Fase 6 — Evolución y Usuario
- [ ] Evolución: curva de ánimo (semana/mes/año), temas y patrones, cofre de aprendizajes, tela de constancia
- [ ] Usuario: ficha, métricas de 30 días, ajustes en tarjetas plegables (Tu réplica, Tu espacio privado, Apariencia), apartado de psicólogo (registro y verificación)
- [ ] Bloqueo con WebAuthn/PIN donde el navegador lo soporte
- [ ] Probar interruptores y notificación de recordatorio (Web Push) real

### Fase 7 — Pulido y accesibilidad
- [ ] Auditoría de animaciones contra los tokens de `DESIGN.md` (duraciones, sin rebotes, `prefers-reduced-motion` respetado)
- [ ] Revisión visual completa en claro y oscuro
- [ ] Un solo origen para el tema (colores de Tailwind y CSS siempre coinciden con `DESIGN.md`)
- [ ] Estados vacíos y de error en Notas, Chat, réplica, dictado, bloqueo y recordatorio
- [ ] Accesibilidad: contraste verificado (no solo calculado), áreas táctiles ≥44px, foco visible con teclado, `aria-label` en todos los íconos-botón
- [ ] Rendimiento: medir carga inicial y cambio de tema en una conexión simulada 3G (dado el contexto de Venezuela)

### Fase 8 — Pruebas cruzadas de navegador
- [ ] Chrome de escritorio y Android (prioridad alta — mayoría del público)
- [ ] Safari de escritorio e iOS (verificar degradación de dictado y notificaciones)
- [ ] Firefox de escritorio (soporte básico)
- [ ] Confirmar que el flujo completo (registro → primera nota → réplica → chat) funciona de punta a punta en cada navegador

## Etapa B — Backend (compartida con el equipo de app)

- [ ] Confirmar acceso al proyecto de Supabase compartido; acordar el proceso de migraciones (ver `03-base-de-datos.md` sección 0)
- [ ] Conectar Supabase Auth (Google, Apple si aplica, OTP por email) reemplazando el simulado
- [ ] Conectar tablas y RLS reales (ya definidas, no se rediseñan desde la web)
- [ ] Consumir `generate-reply` y `generate-day-reply` desde la web — no duplicar lógica de IA en el frontend
- [ ] Reemplazar `services/ai` y `services/auth` simulados por los servicios reales
- [ ] Guardado sin conexión (IndexedDB) y sincronización
- [ ] Chat en tiempo real (Supabase Realtime) y Web Push

## Etapa C — Prueba cerrada

- [ ] Desplegar en un hosting con HTTPS (requisito para WebAuthn y Web Push) — ej. Vercel o Netlify
- [ ] Evaluar si conviene empaquetar como PWA instalable (mejora notificaciones en iOS)
- [ ] Sumar psicólogos reales al piloto (coordinado con el equipo de app, mismo directorio)
- [ ] Medir: notas por usuario por semana, cuántos vuelven, uso del chat — mismas métricas que la app, mismo dashboard si es posible

## Pendiente de decidir (compartido con el equipo de app, no se decide solo desde la web)

- Cómo encuentra el usuario a su psicólogo (lista en Chat vs. invitación del psicólogo).
- Quién verifica a los psicólogos y desde dónde (panel de administración — candidato natural para vivir en la web, a definir).
- Logo definitivo y set final de ánimos.
- Si la web soporta biometría/PIN con la misma seriedad que la app, o se comunica como una función "mejor en la app".

## Pausado (igual que la app)

Planes y suscripciones, pagos, videollamadas propias, chat con la IA, pantalla de ayuda en crisis dedicada, exportar notas.
