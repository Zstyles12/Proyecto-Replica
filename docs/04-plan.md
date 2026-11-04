# Plan de trabajo — Web

> **Lo que sigue está en "Recta final".** Las Fases 0 a 12 son el registro de lo construido, cuando la web todavía seguía a la app móvil. Cada fase termina con la verificación de `AGENTS.md` ("Antes de dar algo por terminado").

## Dónde estamos (31 de octubre de 2026)

**Fases 0 a 8 hechas** (commit "etapa 1", 12 de octubre), con el contraste y la carga en 3G ya medidos. **Fase 9 a medias:** Chrome y Firefox de escritorio probados. Faltan Chrome Android, Safari (iOS y escritorio) y el dictado con micrófono real en Chrome.

**16 de octubre:** la app adoptó su marca nueva (manual y kit en su `docs/marca`). Se volvió a copiar `DESIGN.md` y se acordó que la web tiene interfaces propias cuando le hacen falta (`AGENTS.md`, `DESIGN-WEB.md` §1). **Fases 10 y 11 hechas:** la marca en la web y las correcciones y mejoras propias del navegador (commit `f6746b6`).

**31 de octubre, cambio de rumbo:** la app se descontinuó. La web sigue sola y se entrega **completa el jueves 5 de noviembre de 2026**, con backend real y publicada con HTTPS. El alcance es el de la especificación: 11 módulos y 61 requisitos (`AGENTS.md`, "Fuentes de verdad").

**Fases 13, 14 y 15 hechas:** la web corre contra Supabase real en São Paulo, con réplicas de Gemini, ayuda en crisis y chat con Replica. **Fase 16 hecha** (área profesional, 3 de noviembre). Sigue la Fase 17.

### Punto de partida (30 de septiembre de 2026)

Ya existe una primera versión de las cinco secciones, la navegación responsive, los tokens de color, la bienvenida con la planta y un registro simulado. Una revisión comparándola con la app encontró:

- **Dos bugs que afectan a toda la interfaz:**
  - Tailwind no genera ninguna clase con opacidad sobre los tokens (unas 256 en el código). Los bordes salen gris claro en modo oscuro y los fondos de la réplica, de las ventanas y de la barra inferior quedan transparentes.
  - Las ventanas (modales) se acomodan según la página y no según la pantalla, por la animación de entrada de sección, y quedan fuera de vista.
- **Lógica distinta a la de la app:**
  - las notas se agrupan por día en UTC;
  - todas las notas reciben réplica;
  - el consentimiento se puede saltar;
  - hay dos perfiles que no se sincronizan;
  - el dictado repite texto;
  - la racha está fija.
- **Textos que rompen los principios:** "cifradas", "Toca el corazón", contadores, "Paso 7", texto técnico visible, emojis.
- **Partes de la app que faltan:** registro con contraseña y código, "Tu día", detalle como página, frase destilada, Mi cofre, perfil del psicólogo, "Terminar" el proceso, "Soy psicólogo", eliminar cuenta, Términos y Privacidad, recorridos.

Decisiones tomadas (detalle en `DESIGN-WEB.md`):
- el detalle de nota y "Tu día" pasan a ser páginas;
- se quitan "compartir una nota en el chat" y "exportar el diario";
- el bloqueo queda fuera de la v1 web.

---

## Etapa A — Web con datos simulados, alineada con la app

### Fase 0 — Cimientos (arregla lo que afecta a todas las pantallas)

- [x] **Tokens con opacidad.** En `tailwind.config.js`, cada color se define con una función que devuelve `var(--x)` sin opacidad y `color-mix(in srgb, var(--x) calc(<alpha> * 100%), transparent)` con opacidad. Ya está probado que así Tailwind genera `border-border/40`, `bg-reply-soft/25` y las demás. Las variables CSS no cambian.
  - Agregar la escala de la tela (`DESIGN.md` §3.2) como variables y tokens.
  - Que `dark:` funcione también en el modo "Sistema" (estrategia `variant` de Tailwind 3.4 con `[data-theme=dark]` y `prefers-color-scheme`).
  - Quitar las clases que no existen: `bg-voice-hover`, `duration-250`, `rounded-DEFAULT`.
- [x] **Ventanas.**
  - Arreglar la animación de entrada de sección para que no deje un `transform` aplicado (que termine en `transform: none` o sin `forwards`).
  - Crear `components/ui/Dialog.tsx` según `DESIGN-WEB.md` §5: portal, `Escape`, foco atrapado, scroll bloqueado, hoja inferior en móvil y ventana centrada en escritorio.
  - Usarlo en todas las ventanas que queden y reemplazar los `window.confirm`.
- [x] **TypeScript estricto.** `"strict": true` en `tsconfig.app.json`; corregir lo que aparezca (los `any` del dictado, por ejemplo).
- [x] **Un solo tema.** `useTheme` pasa a ser un store compartido (la barra lateral y Usuario siempre de acuerdo). El tema guardado se aplica antes del primer render (script corto en `index.html`) para que no parpadee, también en el registro. Las fuentes se cargan una sola vez (quitar el `@import` duplicado de `index.css`).
- [x] Adelantado de otras fases: dictado reescrito con tipos y sin texto repetido (`features/journal/hooks/useDictation.ts`); se quitaron "compartir una nota en el chat" y "exportar el diario".
- **Listo cuando:**
  - en el CSS generado aparecen las clases con opacidad;
  - en modo oscuro los bordes son finos y oscuros;
  - una ventana abierta al final de una lista larga queda centrada en la pantalla;
  - pasan los tipos, el lint y el build.

### Fase 1 — Datos y sesión (el modelo de la app)

Traducir la lógica de la app (TypeScript puro) y dejar de usar los servicios actuales de la web:

- [x] `lib/dates.ts`: `dayKey` en hora local y `dayLabel` ("Hoy", "Ayer", "lunes 28 de septiembre"). Viene de `features/journal/store.ts` y `lib/format.ts` de la app.
- [x] `lib/session.ts`: etapas `auth → consent → setup → app`, `TERMS_VERSION`, cuentas conocidas, `signOut` y `deleteAccount`. Viene de `lib/session.ts`.
- [x] `services/auth`: el contrato y la simulación de la app (`signUp`, `signInWithPassword`, `sendCode`, `verifyCode`, `updatePassword`, `signInWithProvider`). Viene de `services/auth/`.
- [x] `features/profile/store.ts`: **un solo perfil** con los campos de la app (nombre, intención, foto, desde cuándo, tono `suave | profundo | directo`, hora de la réplica del día `20 | 22`, sonidos). Reemplaza `services/profile.ts` y los datos de perfil de `services/auth.ts`.
- [x] `features/journal/`:
  - el tipo `Note` (texto, ánimo, un tema, `replyMode`, réplica con `headline`, `body`, `questions` y `learning`, `replyStatus`);
  - el store con `nextReplyMode`, `requestReply` y `streakDays`;
  - `day-replies.ts`, con el comentario por nota, la última réplica y `catchUp`;
  - las notas de ejemplo.
  - Viene de `features/journal/`.
- [x] `services/ai`: la réplica simulada con streaming, la réplica del día y su comentario por nota. Viene de `services/ai/mock-reply-service.ts`.
- [x] `features/notes/favorites.ts`, `features/cofre/` (store y `library.ts` con `phrasesForDay`) y `features/care/store.ts` (v2: un psicólogo activo, terminar el proceso, permisos del diario).
- [x] Métricas: comparar `services/metrics.ts` con `features/profile/metrics.ts` de la app y quedarse con una sola versión, en hora local.
- [x] Claves de `localStorage` con versión nueva; al arrancar se borran una vez las de la versión anterior.
- [x] Adaptar las pantallas actuales lo mínimo para que compilen con el modelo nuevo. El rediseño de cada una va en su fase.
- **Listo cuando:**
  - `services/journal.ts`, `services/profile.ts` y `services/care.ts` ya no existen;
  - una nota de ayer a las 21:40 aparece en "Ayer" con la zona horaria de Caracas;
  - solo la primera nota no privada del día pide réplica.

### Fase 2 — Registro

- [x] Rutas por paso y guardas por etapa (`02-estructura.md`, "Antes de la app"). `AuthFlow.tsx` se divide en pantallas.
- [x] La pieza común de esos pasos: título, explicación, acción abajo, "atrás", "Omitir" y el hilo de progreso. Viene de `features/auth/components/auth-scaffold.tsx`.
- [x] Entrar, correo, contraseña (8 caracteres, "Faltan N", ver la contraseña, "¿Olvidaste tu contraseña?") y código de 6 casillas (verificación sola, tiemblan si no coincide, reenviar a los 60 s, "Cambiar correo").
- [x] Consentimiento con las cuatro promesas y los textos de la app; enlaces a `/legal/terminos` y `/legal/privacidad` (los resúmenes de `app/legal/[doc].tsx`).
- [x] Configuración en pasos: nombre → qué te trae (6 con ícono, se puede omitir) → tono (3) → réplica del día. Sin paso de bloqueo.
- [x] Listo: "Todo listo, {nombre}", la marca que se teje, la campanita y "Escribir mi primera nota".
- **Listo cuando:**
  - no hay manera de llegar a la app sin pasar por el consentimiento;
  - recargar a mitad del registro deja a la persona en el mismo paso;
  - los textos son los de la app.

### Fase 3 — Inicio

- [x] Racha con la planta (`GrowthStreak` y `growth-icon.tsx` de la app), calculada de verdad.
- [x] Línea de la réplica del día bajo el saludo, con los estados de `features/journal/components/day-status.tsx`.
- [x] Botón "Replica" o "Guardar" según `nextReplyMode`. Pregunta amable si falta ánimo o tema (textos de `context-bar.tsx`): la pastilla late y la nota se guarda sola al completarse.
- [x] El texto de ejemplo de la hoja cambia según la hora y las notas de hoy; recuadro "Escribes sobre…" al venir de "Escribir sobre esto".
- [x] Dictado arreglado: resultados parciales aparte, sin duplicar texto, y que se detenga de verdad (hecho en la Fase 0).
- [x] Después de guardar: la nota tejida (réplica arriba, tu entrada plegada), la frase destilada y la tarjeta de cierre con sus tres textos. La réplica escribe "Leyendo tu nota…" y, si falla, "Intentar de nuevo".
- [x] Escritorio: panel derecho solo con las dos frases del día (la propuesta; ver "Pendiente de decidir"). Sin notas recientes. `Ctrl/⌘ + Enter` guarda.
- **Listo cuando:** la segunda nota del día dice "Guardar", y la línea bajo el saludo cambia a "Tu réplica del día llega a las 22:00".

### Fase 4 — Notas, detalle y "Tu día"

- [x] Tarjeta de nota con el formato de la app (una línea de contexto arriba y la réplica en un recuadro malva sin rótulo).
- [x] Búsqueda que también mira la réplica y la frase destilada. "Todas / Favoritas" sin número; "Filtrar" solo con ánimos y temas que existen.
- [x] `/notas/:id`: la nota tejida, el contexto ("Escribiste hoy a las 7:16 · 42 palabras"), tu entrada plegable, el comentario de la réplica del día (o cuándo llega) y la favorita en la cabecera.
- [x] `/replica-dia/:dia`: la réplica del día, la última réplica si la hubo y "Notas de tu día".
- [x] Panel derecho en escritorio sin contadores, y quitar "cifradas" y el filtro roto de privadas.
- **Listo cuando:**
  - se puede abrir una nota, volver con el botón atrás y compartir su enlace;
  - la búsqueda encuentra una palabra que solo está en la réplica.

### Fase 5 — Evolución

- [x] Quitar el cofre de aprendizajes y la etiqueta "Paso 7".
- [x] La tela con la escala de la app.
- [x] La curva que responde al cursor, al toque y a las flechas del teclado.
- [x] Comparar los textos con `app/(tabs)/evolucion/index.tsx`.

### Fase 6 — Chat

- [x] Estado vacío sin psicólogo y directorio con filtro por especialidad (`/chat/directorio`).
- [x] Perfil del psicólogo (`/psicologo/:id`): "Escribirle a {nombre}" y "Terminar" con confirmación.
- [x] Compartir el diario con la hoja que explica qué significa; mensajes de evento en la conversación.
- [x] En menos de 1024 px, conversación a pantalla completa sin barra de navegación. Sin "En línea".
- [x] Quitar "compartir una nota en el chat". Arreglar el scroll que mueve toda la página.
- **Listo cuando:** cambiar de psicólogo obliga a terminar el proceso y deja de compartir el diario.

### Fase 7 — Usuario, cofre y lo que falta

- [x] Usuario sin título grande ni "Paso 7"; "Tus favoritas" con las frases guardadas de verdad.
- [x] Ajustes plegables con los textos de la app y sin bloqueo. Recordatorio fuera hasta que exista Web Push (la propuesta; ver "Pendiente de decidir"). Sonidos sin números.
- [x] Tu cuenta: "Entraste con…", cerrar sesión y eliminar cuenta (con confirmación). Sin exportar.
- [x] "Soy psicólogo o psicóloga" (`/usuario/psicologo`), "Ver los tutoriales otra vez", Términos y Privacidad.
- [x] Mi cofre (`/cofre`), con favoritas y destiladas.
- [x] Compartir una frase como imagen (canvas 1080 × 1920, cuatro fondos, Web Share o descarga).
- [x] Editar perfil con foto (recorte cuadrado).

### Fase 8 — Recorridos, sonidos y pulido

- [x] Recorridos con los pasos y textos de `lib/tutorials.ts` de la app.
- [x] Sonidos: no se descargan hasta activarlos; una sola descarga por sonido.
- [x] `prefers-reduced-motion` en todas las animaciones (aura, pasada del hilo, corazón, texto palabra por palabra).
- [x] Revisión de accesibilidad (`AGENTS.md`): etiquetas, foco, `inert` en lo plegado.
- [x] Contraste comprobado con axe-core (el motor de Lighthouse) en claro y en oscuro, el 1 de octubre: registro completo, Inicio con réplica, Notas, detalle, "Tu día", Evolución, Chat, directorio, perfil del psicólogo, Usuario con los ajustes abiertos, "Soy psicólogo", Mi cofre, Términos, Privacidad y las ventanas (terminar el proceso, compartir el diario, perfil, eliminar cuenta, compartir frase, filtro), a 800 y a 375 px. Ningún texto por debajo de 4.5:1. Los textos de ejemplo de los campos (`subtle`) dan 4.55:1 o más. Los colores de ánimo no llegan a 4.5:1, pero solo se usan como puntos y fondos junto al nombre, nunca como texto.
- [x] Limpieza de textos:
  - sin emojis, mayúsculas de énfasis ni texto técnico;
  - textos de la app en todas las pantallas;
  - los ánimos siempre con su nombre bien escrito.
- [x] Playground solo en desarrollo. Cambiar los comentarios que dicen `zairo-main/` a `replica mobile/zairo/`. Reemplazar el `frontend/README.md` de la plantilla de Vite.
- [x] Carga medida en 3G simulada el 1 de octubre (build de producción, gzip, caché vacía, 375 px, CPU 4 veces más lenta). Primera pintura / contenido principal:
  - 3G rápida (562 ms de latencia, 1.44 Mbps): bienvenida 3.0 / 3.2 s; Inicio con sesión 2.6 / 3.0 s.
  - 3G lenta (2 s de latencia, 400 kbps): bienvenida 9.4 / 9.7 s; Inicio con sesión 7.3 / 7.7 s.
  - Se transfieren unos 135 a 145 kB. Las fuentes de Google no retrasan la primera pintura (con ellas bloqueadas da lo mismo). El peso es React y React Router (unos 118 kB comprimidos). La bienvenida tarda más por una ida y vuelta extra: su archivo se pide recién cuando llega el principal.

### Fase 9 — Pruebas cruzadas

- [x] Chrome de escritorio (154): recorrido completo automatizado a 1280 y a 390 px (con toque emulado), sin errores en la consola y sin desborde horizontal (1 de octubre).
- [ ] Chrome Android en un teléfono real.
- [ ] Safari iOS y Safari de escritorio: sin dictado, y que no se rompa nada. No se puede probar desde Windows; hace falta un iPhone o una Mac.
- [x] Firefox de escritorio (157): el mismo recorrido a 1280 y a 390 px, sin errores ni desborde. Se ve igual que en Chrome (1 de octubre).
- [ ] El recorrido completo (registro → primera nota → réplica → segunda nota → Notas → Chat) en cada navegador. Hecho en Chrome y Firefox de escritorio; faltan los teléfonos y Safari.

### Fase 10 — La marca en la web (`DESIGN-WEB.md` §9)

- [x] `npm run marca` copia del kit de la app la geometría, las líneas de tiempo, los íconos web, el ícono de carga y la firma sonora.
- [x] Piezas del logo (ícono, flor, logotipo y firmas) en SVG con los tokens; se borró `LogoMark`.
- [x] Movimiento: «Ola» en la bienvenida y «Se escribe y florece» en "Todo listo", con el evaluador de la app y "reducir movimiento" (aparece completa, y el texto y el botón sin espera).
- [x] Barra lateral con el logotipo y el anillado del cuaderno en el borde (`DESIGN-WEB.md` §3); pasos del registro con el ícono.
- [x] Pestaña: la flor como favicon (reemplaza al de la plantilla de Vite, que se borró junto con `icons.svg`) y un título por sección.
- [x] Ícono quieto en `index.html` mientras carga la app. En 3G se ve desde la primera pintura (1,4 s en 3G rápida, 4,7 s en 3G lenta) en vez de pantalla en blanco hasta que llega la app (2,1 y 7 s).
- [x] Imagen para compartir como la nueva de la app: renglones, sin halos, solo el logotipo (`features/cofre/shareImage.ts`).
- [x] Alegreya y Alegreya Sans alojadas en la web (`@fontsource`, solo caracteres latinos), sin Google Fonts.
- [x] Verificación: tipos, lint y build; capturas a 375, 767, 768, 1023, 1024 y 1440 px en claro y oscuro sin desborde; Chrome y Firefox; "reducir movimiento"; carga en 3G. No hay controles nuevos para el teclado ni texto nuevo para el contraste.
- [ ] Pendiente: los sonidos siguen en WAV (la firma pesa 345 kB). Comprimirlos necesita `ffmpeg`, que no está instalado. Solo se descargan si se activan los sonidos.

### Fase 11 — Interfaces propias para el navegador

- [x] Revisión pantalla por pantalla de qué se ve o se usa mejor distinto en el navegador (teléfono y computadora), con capturas.
- [x] Un plan por pantalla, aprobado antes de implementar; cada decisión se anota en `DESIGN-WEB.md`.
- [x] Correcciones de paridad y escritorio: Mi cofre sin contadores (`Cofre.tsx`); barras de ánimo proporcionales al total de días con ánimo y sin porcentajes (`MoodBars.tsx`); curva sin globo flotante repetido y con textos de al menos 12 px (`MoodCurve.tsx`); métricas de Usuario en cuadrícula 2×2 sin truncado (`Usuario.tsx`, `MetricTile.tsx`); títulos de pestaña `"Soy psicólogo · Replica"` y `"Psicólogo · Replica"` (`DocumentTitle.tsx`); cabecera del Chat oculta desde 1024 px con nombre accesible (`Chat.tsx`); mismo borde izquierdo desde 1024 px (`lg:mx-0`) en todas las pantallas con sesión iniciada.
- [x] Revisión de Claude sobre lo implementado con Gemini (16 de octubre): contraste del calendario (los días con 2 notas tenían 2,97:1 y 1,99:1), celdas de 44 px, fechas fijas de nuevo a 13 px, texto "Distribución de ánimos" recuperado, "Tu día" de hoy con la línea "Tu réplica del día llega a las…" y la luna en malva, barras con token de movimiento y sin animación con "reducir movimiento".
- [x] Propuestas aprobadas: escribir sobre los renglones de 24 px dentro de la hoja de Inicio (`WriterSheet.tsx`, `index.css`); calendario mensual tejido (`MonthCalendar.tsx`) en el panel derecho de Notas y encabezados de fecha fijos al bajar (`Notas.tsx`); "Tu día" (`/replica-dia/:dia`) muestra las notas del día y el aviso de cuándo llega la réplica cuando aún no se ha generado (`TuDia.tsx`).

### Fase 12 — Bocetos del área profesional (Evaluación 4)

Pedido del curso: los wireframes de cuatro interfaces a tres anchos, con notas al margen y una lista de verificación WCAG y responsive, en PNG horizontales dentro de un .zip. Las decisiones están en `DESIGN-WEB.md` §10; la propuesta de datos, en `03-base-de-datos.md`.

- [x] Decisiones aprobadas (22 de octubre): la solicitud de acompañamiento antes del chat; el psicólogo puede dejar de atender a un paciente; el visor muestra solo las notas no privadas; la ayuda en crisis, solo en el boceto.
- [x] Documentación: `DESIGN-WEB.md` §10, rutas en `02-estructura.md`, propuesta de datos en `03-base-de-datos.md` y reglas en `AGENTS.md`.
- [x] Cinco láminas PNG horizontales en `entrega-evaluacion-4/salida/` (las 4 interfaces a 375, 768 y 1440 px, con estados y notas, más la lista de verificación con el contraste calculado), comprimidas en `Replica-Evaluacion-4-Bocetos.zip`. Se generan con `node entrega-evaluacion-4/fuentes/todo.mjs` (22 de octubre).
- [ ] Entrega del .zip (23 de octubre de 2026). La lista de verificación va sin firma: el profesor no la exige.
- [ ] Aprobación del profesor.

---

## Recta final: hasta el jueves 5 de noviembre

Reemplaza a las antiguas Etapas B y C. Lo nuevo se construye directo sobre Supabase, para no hacerlo dos veces, y el orden sigue la prioridad de la especificación. La web no tiene ejecutor de pruebas: se verifica con tipos, lint, build y el navegador. Toda fase termina sin errores en esas comprobaciones.

### Lo que solo puede hacer la persona responsable

Las cuentas y las claves son suyas y nunca pasan por el chat. La Fase 14 las necesita desde el sábado 31.

Los pasos exactos de Supabase, Gemini, Google y el correo están en `supabase/README.md`.

- [x] **Supabase:** crear el proyecto en São Paulo (`sa-east-1`), iniciar sesión en la terminal con `npx supabase login`, subir las migraciones y las funciones, y poner la dirección y la clave pública en `frontend/.env.local` (`.env.example` trae los nombres).
- [x] **Gemini:** crear la clave en Google AI Studio y guardarla como secreto en Supabase, en la terminal: `npx supabase secrets set GEMINI_API_KEY=...`.
- [x] **Réplica del día:** guardar `CRON_SECRET` como secreto y en Vault, con `project_url`. Sin esto, la réplica del día no se genera.
- [ ] **Recorridos:** pegar `supabase/.temp/recorridos.sql` en el SQL Editor del proyecto. Hasta entonces, la web con Supabase muestra "No pudimos traer tu diario".
- [x] **Google:** crear el cliente OAuth en Google Cloud para "Entrar con Google". Comprobado el 2 de noviembre en `localhost:5173`; falta agregar la dirección de Vercel en Google Cloud y en Supabase.
- [ ] **Vercel:** crear la cuenta y conectarla al repositorio `Zstyles12/Proyecto-Replica` (Fase 18).
- [x] **Correo (obligatorio):** conectar un SMTP propio y, después, cambiar las plantillas de confirmación y recuperación para que traigan el código (`{{ .Token }}`), con 6 dígitos. En un proyecto gratuito nuevo, sin SMTP propio las plantillas no se pueden editar y el código no llega: nadie podría crear su cuenta con correo. Resend necesita un dominio verificado; sin dominio sirve Gmail con una contraseña de aplicación.
- [ ] **Dispositivos:** probar en un Android real y en un iPhone o una Mac (Fase 18).

**Decisiones del 31 de octubre:** el proyecto es universitario y usa solo datos de prueba, con el plan gratuito de Supabase. El plan gratuito pausa los proyectos sin uso y no trae respaldos automáticos: hay que abrir el proyecto antes de la defensa. Los registros duran un día: lo que se compruebe en ellos (que una nota privada no llamó a Gemini) se mira el mismo día. El pago de Gemini está por decidir; en su nivel gratuito, Google puede usar lo que recibe para entrenar sus modelos. "Entrar con Apple" sale del proyecto: queda solo "Entrar con Google", que reemplaza a Apple en RF-05.

### Fase 13 — Estructura por roles (sábado 31)

No necesita claves. `AuthAccount.role`, la guarda por rol, el layout profesional en los tres anchos (`DESIGN-WEB.md` §10, "Anchos") con el lugar de `CrisisButton` reservado, y las entradas desde Usuario y la navegación.

- [x] **Listo cuando:** cada cuenta de prueba (`02-estructura.md`, "Roles") ve su navegación a 375, 768 y 1440 px; una ruta de otro rol lleva a `/`; una cuenta normal no nota ningún cambio. Comprobado el 31 de octubre, también a 320 px con seis ítems y con una sesión guardada sin rol. Panel, Mensajes y Solicitudes tienen solo su título hasta la Fase 16.

### Fase 14 — Backend y cuentas (sábado 31 a lunes 2)

- [x] `supabase/migrations/`: las tablas y las columnas de `03-base-de-datos.md`, RLS en el 100 %, buckets `avatars` y `credentials`, y datos iniciales.
- [x] Funciones `generate-reply`, `generate-day-reply` (programada) y `delete-account`.
- [x] Supabase Auth: correo con contraseña y código, y Google. El rol llega de `app_metadata`.
- [x] Servicios reales para cuenta, perfil, diario, réplicas, cofre, favoritas, Evolución y chat con psicólogos, este en tiempo real (RF-43). Lo simulado queda detrás del mismo contrato.

Escrito el 31 de octubre y comprobado sin claves: las migraciones y las reglas en Postgres, 119 comprobaciones con varias cuentas; el manejo de las respuestas de Gemini con respuestas imitadas; y la web, en el navegador, contra una imitación local de Supabase. Nada de esto reemplaza la lista de abajo, que necesita el proyecto real.

Contra el proyecto real, en São Paulo, el 31 de octubre: `npm run accesos` pasa completo (24 comprobaciones) y `npm run flujo` también: réplica de Gemini en unos 4 s, Storage con sus límites, tiempo real y eliminar una cuenta con sus archivos. La capa de datos de la web pasó entera con cuentas de persona y de psicóloga. Una nota privada se rechaza antes de Gemini y no gasta ninguna llamada. `npm run programada` también pasa: la réplica del día llegó sola, leyendo sus dos notas.

La persona responsable comprobó el resto en la web, el mismo día: el código llegó a un correo real, la primera nota recibió su réplica y la segunda dijo "Guardar", los registros muestran solo la llamada de la primera, otro navegador ve las mismas notas y una cuenta eliminada ya no entra. Repetida el 2 de noviembre con el `CRON_SECRET` nuevo, `npm run programada` volvió a pasar: la réplica del día llegó a los 10,3 min y leyó sus dos notas.

Los recorridos vistos pasaron a la cuenta el 2 de noviembre (`20261102000001_recorridos_en_la_cuenta.sql`). Pasaron en Postgres, con sus reglas de acceso, y en el navegador contra una imitación local: quedan en el servidor, vuelven al recargar y la cuenta siguiente no hereda nada. Contra el proyecto real falta aplicar la migración y repetir `npm run flujo` y la capa de datos. `npm run flujo` ahora envía seis notas a la vez: pasó contra el proyecto real, y solo una pide réplica al momento.

`gemini-3.8-flash` pasó de los 30 s de límite: el modelo es `gemini-3.5-flash-lite`. Desde la red de la persona responsable, `db push` no llega al puerto 5432: las migraciones se subieron por SQL Editor (`supabase/README.md`).

- [x] **Listo cuando:**
  - con dos cuentas reales, A no puede leer ni escribir nada de B, comprobado con consultas directas a la base de datos;
  - la primera nota del día recibe una réplica real, y la segunda dice "Guardar";
  - una nota privada no llega a Gemini, y esa llamada no existe en los registros;
  - eliminar la cuenta borra todo lo suyo, archivos incluidos;
  - cerrar sesión y entrar en otro navegador muestra el mismo diario.

### Fase 15 — Ayuda en crisis y chat con la IA (lunes 2)

Se diseñan primero en `DESIGN-WEB.md` §11. Son los requisitos de prioridad Alta que faltan.

- [x] `/ayuda`, `CrisisButton` en toda pantalla con sesión y `help_resources`. Cada línea lleva su fuente oficial y la fecha en que se comprobó; la persona responsable aprueba la lista antes de publicarla (RF-59, RF-60).
- [x] Señales de riesgo en notas y mensajes (RF-61, RN-10).
- [x] `/chat/ia` y `chat-with-ai`: respuesta palabra por palabra, historial, retomar, borrar con confirmación y límite diario (RF-57, RF-58).
- [x] **Listo cuando:** una nota de riesgo de prueba recibe una respuesta sin consejos, con calidez y con el enlace a `/ayuda`; pasar el límite diario lo dice con la voz de Replica; un país sin línea comprobada no muestra ningún número inventado.

Escrito el 3 de noviembre: diseño en `DESIGN-WEB.md` §11, migración `20261103000001_ayuda_y_chat_con_la_ia.sql` (`risk`, límite del chat y por ahora solo Venezuela, donde la persona responsable puede comprobarlas: la línea del Ministerio de Salud y la LAPSI de la Federación de Psicólogos (0424-2907338, de su publicación oficial del 29 de junio), cada una comprobada en su fuente ese día), la función `chat-with-ai` y las pantallas. En modo simulado pasa el "Listo cuando" completo, a 375, 767, 768, 1023, 1024 y 1440, en claro y en oscuro. Contra el proyecto real, el 3 de noviembre: la persona responsable aprobó las líneas, confirmó por teléfono que la LAPSI contesta y aplicó la migración. Con `chat-with-ai`, `generate-reply` y `generate-day-reply` publicadas, `npm run flujo` pasa completo, ahora con "Ayuda en crisis" y "Chat con Replica": la nota de riesgo de Gemini llega marcada, sin consejos y con preguntas de cuidado; el chat responde, marca el riesgo, guarda el historial, no deja escribir a otra cuenta ni al navegador, dice el límite con 429 sin guardar el mensaje y borra con sus mensajes.

### Fase 16 — Área profesional (lunes 2 a martes 3)

Sobre las tablas reales. El diseño está en `DESIGN-WEB.md` §10 y las láminas en `entrega-evaluacion-4/salida/`. Las piezas nuevas se construyen junto con la primera pantalla que las usa.

- [x] **Solicitud de verificación** (`/usuario/psicologo`), con `FileDropzone` y `StatusPill`.
  - **Listo cuando:** los cinco estados se recorren en el navegador; enviar incompleto marca cada campo junto a él, sin desactivar el botón; con teclado se agrega y se quita un PDF; los PDF siguen disponibles después de recargar.
- [x] **Panel de administración** (`/profesional/admin`), con `DataTable`, `Skeleton`, `EmptyState`, `DateRangeFilter`, `PdfPreview`, el panel lateral como variante de `Dialog`, y `set-role`.
  - **Listo cuando:** aprobar, pedir subsanación y rechazar cambian lo que ve la persona y dejan su fila en el historial; aprobar la vuelve psicóloga y la pone en el directorio; `?solicitud=:id` abre el expediente con enlace directo y el atrás del navegador lo cierra; la tabla pasa a tarjetas sin desborde a 375 px.
- [x] **Acompañamiento y panel del psicólogo** (`/psicologo/:id`, `/chat`, `/profesional/dashboard`, `/profesional/mensajes`), con `care_requests`, agenda y sesiones. Mensajes se diseña antes en `DESIGN-WEB.md` §10.
  - **Queda de la Fase 14:** hoy la persona abre y reabre su conversación directo, incluso una que el psicólogo terminó; con `care_requests`, solo aceptar debe abrirla. El aviso de compartir el diario está escrito para la persona ("Compartiste…"): el psicólogo necesita el suyo. Un perfil aprobado todavía puede cambiar su licencia. `last_read_at` es solo de la persona.
  - **Tiempo real sin respaldo:** `subscribe` no mira su estado ni vuelve a traer los mensajes al conectarse o reconectarse, así que un evento perdido no aparece hasta recargar. El 2 de noviembre `npm run flujo` perdió una vez un mensaje hacia la psicóloga; no se repitió en 15 vueltas medidas después y la causa no se determinó.
  - **Listo cuando:** la persona pide acompañamiento, ve "Esperando respuesta de {nombre}" y puede retirarlo; no puede pedírselo a un segundo psicólogo; al aceptar, el chat se abre en los dos lados; "Ahora no" llega con calma y sin `destructive`; el resumen solo muestra números calculados.
- [x] **Visor y notas clínicas** (`/profesional/pacientes/:id`), con "Dejar de atender" y `ended_by`. Privacidad cuenta quién ve los documentos y las notas clínicas; si cambia lo aceptado, sube `TERMS_VERSION`.
  - **Listo cuando:** una nota privada no sale de la base de datos hacia el psicólogo, comprobado con una consulta directa; la pantalla no tiene réplicas ni malva; al retirar el permiso las notas dejan de verse y las clínicas se quedan; "Dejar de atender" termina el proceso y el permiso, y la persona ve el evento.

Hecho el 3 de noviembre: migración `20261103000002_area_profesional.sql` (solo aceptar abre la conversación, `ended_by`, lectura de cada lado, aviso con su tipo, licencia fija al aprobar, notas clínicas), la función `set-role`, `services/professional` con su versión simulada, las piezas `DataTable`, `DateRangeFilter`, `PdfPreview` y `Menu`, y las pantallas. El tiempo real vuelve a traer el estado al suscribirse y al reconectarse. En modo simulado se recorrió en 375, 767, 768, 1023, 1024 y 1440, y con teclado. Privacidad cuenta quién ve los documentos y las notas clínicas, y `TERMS_VERSION` pasó a `2026-11`. Contra el proyecto real, con la migración aplicada y `set-role` publicada por la persona responsable: `npm run accesos` pasa con la sección "Área profesional", y `npm run flujo` pasa con "Acompañamiento", "Tiempo real", "Visor y notas clínicas" (la nota privada no le llega a la psicóloga por consulta directa) y "Verificación". De cuatro vueltas de `flujo`, la primera tuvo una comprobación fallida que no quedó registrada; las tres siguientes pasaron completas.

### Fase 17 — Funciones restantes (miércoles 4)

Se diseñan primero en `DESIGN-WEB.md` §11.

- [x] Exportar notas en PDF o texto (RF-29) y compartir una nota suelta en el chat (RF-44).
- [x] Bloqueo con PIN y llave de acceso (RF-52).
- [x] Recordatorio diario con Web Push (RF-53). Contra el proyecto real, el 3 de noviembre: la suscripción se registra, la tarea programada encuentra a la cuenta a su hora y `send-reminders` responde `{"due":1,"sent":1}` (el servicio de avisos lo aceptó). El aviso no apareció en la pantalla de la persona responsable y no se averiguó si lo ocultó el navegador o Windows. En un navegador sin servicio de avisos (por ejemplo, Brave sin activarlo) la suscripción falla y la web dice "Revisa tu conexión", que no es el motivo.
- [x] Sin conexión: guardado en IndexedDB y sincronización (RNF-13).
- [x] **Si el tiempo aprieta**, se corta en este orden y se oculta lo que no llegue: recordatorio (RF-53, prioridad Baja), llave de acceso (queda el PIN) y guardado sin conexión. No hizo falta cortar nada.
- [x] **Listo cuando:** cada función hace lo que dice su requisito en el navegador, o está oculta y anotada aquí.

Hecho el 3 de noviembre, en modo simulado: exportar arma el archivo en el navegador (PDF con jsPDF y las fuentes estándar, o texto) con el rango y, si se pide, las notas privadas; la nota suelta se elige en una hoja desde el chat y nunca ofrece una privada; el bloqueo pide el PIN al abrir y tras 1, 5 o 15 minutos sin uso, con espera de 30 segundos tras cinco intentos, y la llave de acceso se ofrece solo si el dispositivo tiene su propio bloqueo; el recordatorio se activa con el permiso del navegador; sin conexión, Replica abre con la copia de IndexedDB y las notas esperan con "Se envía cuando vuelva la conexión.". Tipos, lint y build sin errores. Revisado en 375, 767, 768, 1023, 1024 y 1440, en claro y en oscuro, y con teclado. Las comprobaciones nuevas están en `npm run accesos` ("Sin conexión y recordatorio") y `npm run flujo` ("Nota suelta en el chat").

**Falta con el proyecto real** (solo la persona responsable):
- [ ] Pegar `supabase/.temp/funciones-restantes.sql` en el SQL Editor.
- [ ] Crear las claves VAPID y guardarlas (`supabase/README.md`, paso 3), con la pública también en `frontend/.env.local`. Sin ella, el recordatorio no aparece en la web.
- [ ] Publicar `send-reminders`: `npx -y supabase functions deploy send-reminders --yes`.
- [x] Correr `npm run accesos` y `npm run flujo`. Pasaron completos el 4 de noviembre, con "Sin conexión y recordatorio" y "Nota suelta en el chat".
- [ ] Ver llegar un aviso real: en el panel del navegador de desarrollo las notificaciones están denegadas, así que el aviso mismo no se vio.

### Fase 18 — Publicación y verificación (miércoles 4 a jueves 5)

- [ ] Publicar en Vercel con HTTPS, cabeceras de seguridad y CSP. La configuración está lista y probada en local (`frontend/vercel.json`, `02-estructura.md`, "Publicación"); falta que la persona responsable cree el proyecto en Vercel.
- [x] Enlace compartido y manifiesto: `og-claro-1200x630.png`, descripción, `theme-color`, `icon-192`, `icon-512` e `icon-maskable-512` (`DESIGN-WEB.md` §9).
- [x] Revisar los 61 requisitos y los 15 no funcionales uno por uno, con su resultado: [`05-requisitos.md`](05-requisitos.md).
- [x] La lista WCAG y responsive de la lámina 5, con el contraste medido en claro y en oscuro.
  - **Hallazgos del 2 de noviembre:** `TourHost` declara `aria-modal`, pero el foco se queda en la página y Tab recorre la pantalla de atrás. Por debajo de 44 px: chips de ánimo y tema, filtros de Notas y del Directorio, pestañas de Evolución y botones de Meet (36), el campo de `/chat` (40), filas de Notas (24) y días de Evolución (16). En `/evolucion`, con barra de desplazamiento clásica, una tarjeta se recorta 3 px a 768 y 769.
  - **Corregido el 4 de noviembre**, en la versión construida (modo simulado, con la CSP de Vercel):
    - `TourHost` va en un portal y deja la página inerte: Tab recorre solo "Saltar todo" y "Siguiente", y Escape devuelve la página.
    - Lo que se dibuja a 36 px o menos se toca en 44 px con `tap-area` (`DESIGN-WEB.md` §2), también `Button` `sm` del área profesional. El campo de `/chat` y el pie de las frases del cofre pasan a 44 px. Las filas de Notas ya se tocaban en toda la tarjeta.
    - La tela de Evolución pasa a celdas de 18 px a 24 px entre centros (WCAG 2.5.8), y sin el ancho mínimo de 320 px, que la hacía desplazarse 11 px a 375. A 768 y 769, con barra clásica de 15 px, nada se recorta ni desborda.
  - **Lámina 5, medido el mismo día** en las pantallas de la persona y del área profesional (Panel, Mensajes, paciente y Solicitudes):
    - Contraste: ningún texto bajo 4,5:1 (3:1 los grandes), en claro y en oscuro (435 textos de la persona).
    - Tamaño del objetivo: 44 px en todo lo tocable a 375, con las dos excepciones de `DESIGN-WEB.md` §2.
    - Reflow: sin desborde a 320, 375, 767, 768, 769, 1023, 1024 y 1440.
    - Campos: todos con etiqueta y a 16 px.
    - Tabla: `caption`, `th scope` y `aria-sort` en la fecha de Solicitudes.
    - Foco atrapado en ventanas y recorridos.
- [ ] Recorrido completo en la dirección pública, con Chrome Android y Safari si hay dispositivos (Fase 9).
- [ ] **Listo cuando:** la dirección pública pasa el recorrido completo con cuentas reales, y cada requisito tiene su resultado anotado.

## Pendiente de decidir

- **Panel derecho de Inicio en escritorio.** Propuesta: solo las dos frases del día. Alternativas: dejar las notas recientes, o una sola columna.
- Set final de ánimos.

## Fuera del proyecto

Planes y suscripciones, pagos y videollamadas propias.
