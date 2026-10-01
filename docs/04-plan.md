# Plan de trabajo — Web

> La web se construye primero completa con datos simulados, igual que la app, y después se conecta al backend compartido. La referencia de cada pantalla es la app (`../replica mobile/zairo`), que **solo se lee**. Cada fase termina con la verificación de `AGENTS.md` ("Antes de dar algo por terminado") y un commit.

## Dónde estamos (30 de septiembre de 2026)

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

- [ ] **Tokens con opacidad.** En `tailwind.config.js`, cada color se define con una función que devuelve `var(--x)` sin opacidad y `color-mix(in srgb, var(--x) calc(<alpha> * 100%), transparent)` con opacidad. Ya está probado que así Tailwind genera `border-border/40`, `bg-reply-soft/25` y las demás. Las variables CSS no cambian.
  - Agregar la escala de la tela (`DESIGN.md` §3.2) como variables y tokens.
  - Que `dark:` funcione también en el modo "Sistema" (estrategia `variant` de Tailwind 3.4 con `[data-theme=dark]` y `prefers-color-scheme`).
  - Quitar las clases que no existen: `bg-voice-hover`, `duration-250`, `rounded-DEFAULT`.
- [ ] **Ventanas.**
  - Arreglar la animación de entrada de sección para que no deje un `transform` aplicado (que termine en `transform: none` o sin `forwards`).
  - Crear `components/ui/Dialog.tsx` según `DESIGN-WEB.md` §5: portal, `Escape`, foco atrapado, scroll bloqueado, hoja inferior en móvil y ventana centrada en escritorio.
  - Usarlo en todas las ventanas que queden y reemplazar los `window.confirm`.
- [ ] **TypeScript estricto.** `"strict": true` en `tsconfig.app.json`; corregir lo que aparezca (los `any` del dictado, por ejemplo).
- [ ] **Un solo tema.** `useTheme` pasa a ser un store compartido (la barra lateral y Usuario siempre de acuerdo). El tema guardado se aplica antes del primer render (script corto en `index.html`) para que no parpadee, también en el registro. Las fuentes se cargan una sola vez (quitar el `@import` duplicado de `index.css`).
- **Listo cuando:**
  - en el CSS generado aparecen las clases con opacidad;
  - en modo oscuro los bordes son finos y oscuros;
  - una ventana abierta al final de una lista larga queda centrada en la pantalla;
  - pasan los tipos, el lint y el build.

### Fase 1 — Datos y sesión (el modelo de la app)

Traducir la lógica de la app (TypeScript puro) y dejar de usar los servicios actuales de la web:

- [ ] `lib/dates.ts`: `dayKey` en hora local y `dayLabel` ("Hoy", "Ayer", "lunes 28 de septiembre"). Viene de `features/journal/store.ts` y `lib/format.ts` de la app.
- [ ] `lib/session.ts`: etapas `auth → consent → setup → app`, `TERMS_VERSION`, cuentas conocidas, `signOut` y `deleteAccount`. Viene de `lib/session.ts`.
- [ ] `services/auth`: el contrato y la simulación de la app (`signUp`, `signInWithPassword`, `sendCode`, `verifyCode`, `updatePassword`, `signInWithProvider`). Viene de `services/auth/`.
- [ ] `features/profile/store.ts`: **un solo perfil** con los campos de la app (nombre, intención, foto, desde cuándo, tono `suave | profundo | directo`, hora de la réplica del día `20 | 22`, sonidos). Reemplaza `services/profile.ts` y los datos de perfil de `services/auth.ts`.
- [ ] `features/journal/`:
  - el tipo `Note` (texto, ánimo, un tema, `replyMode`, réplica con `headline`, `body`, `questions` y `learning`, `replyStatus`);
  - el store con `nextReplyMode`, `requestReply` y `streakDays`;
  - `day-replies.ts`, con el comentario por nota, la última réplica y `catchUp`;
  - las notas de ejemplo.
  - Viene de `features/journal/`.
- [ ] `services/ai`: la réplica simulada con streaming, la réplica del día y su comentario por nota. Viene de `services/ai/mock-reply-service.ts`.
- [ ] `features/notes/favorites.ts`, `features/cofre/` (store y `library.ts` con `phrasesForDay`) y `features/care/store.ts` (v2: un psicólogo activo, terminar el proceso, permisos del diario).
- [ ] Métricas: comparar `services/metrics.ts` con `features/profile/metrics.ts` de la app y quedarse con una sola versión, en hora local.
- [ ] Claves de `localStorage` con versión nueva; al arrancar se borran una vez las de la versión anterior.
- [ ] Adaptar las pantallas actuales lo mínimo para que compilen con el modelo nuevo. El rediseño de cada una va en su fase.
- **Listo cuando:**
  - `services/journal.ts`, `services/profile.ts` y `services/care.ts` ya no existen;
  - una nota de ayer a las 21:40 aparece en "Ayer" con la zona horaria de Caracas;
  - solo la primera nota no privada del día pide réplica.

### Fase 2 — Registro

- [ ] Rutas por paso y guardas por etapa (`02-estructura.md`, "Antes de la app"). `AuthFlow.tsx` se divide en pantallas.
- [ ] La pieza común de esos pasos: título, explicación, acción abajo, "atrás", "Omitir" y el hilo de progreso. Viene de `features/auth/components/auth-scaffold.tsx`.
- [ ] Entrar, correo, contraseña (8 caracteres, "Faltan N", ver la contraseña, "¿Olvidaste tu contraseña?") y código de 6 casillas (verificación sola, tiemblan si no coincide, reenviar a los 60 s, "Cambiar correo").
- [ ] Consentimiento con las cuatro promesas y los textos de la app; enlaces a `/legal/terminos` y `/legal/privacidad` (los resúmenes de `app/legal/[doc].tsx`).
- [ ] Configuración en pasos: nombre → qué te trae (6 con ícono, se puede omitir) → tono (3) → réplica del día. Sin paso de bloqueo.
- [ ] Listo: "Todo listo, {nombre}", la marca que se teje, la campanita y "Escribir mi primera nota".
- **Listo cuando:**
  - no hay manera de llegar a la app sin pasar por el consentimiento;
  - recargar a mitad del registro deja a la persona en el mismo paso;
  - los textos son los de la app.

### Fase 3 — Inicio

- [ ] Racha con la planta (`GrowthStreak` y `growth-icon.tsx` de la app), calculada de verdad.
- [ ] Línea de la réplica del día bajo el saludo, con los estados de `features/journal/components/day-status.tsx`.
- [ ] Botón "Replica" o "Guardar" según `nextReplyMode`. Pregunta amable si falta ánimo o tema (textos de `context-bar.tsx`): la pastilla late y la nota se guarda sola al completarse.
- [ ] El texto de ejemplo de la hoja cambia según la hora y las notas de hoy; recuadro "Escribes sobre…" al venir de "Escribir sobre esto".
- [ ] Dictado arreglado: resultados parciales aparte, sin duplicar texto, y que se detenga de verdad.
- [ ] Después de guardar: la nota tejida (réplica arriba, tu entrada plegada), la frase destilada y la tarjeta de cierre con sus tres textos. La réplica escribe "Leyendo tu nota…" y, si falla, "Intentar de nuevo".
- [ ] Escritorio: panel derecho solo con las dos frases del día (ver "Pendiente de decidir"). Sin notas recientes. `Ctrl/⌘ + Enter` guarda.
- **Listo cuando:** la segunda nota del día dice "Guardar", y la línea bajo el saludo cambia a "Tu réplica del día llega a las 22:00".

### Fase 4 — Notas, detalle y "Tu día"

- [ ] Tarjeta de nota con el formato de la app (una línea de contexto arriba y la réplica en un recuadro malva sin rótulo).
- [ ] Búsqueda que también mira la réplica y la frase destilada. "Todas / Favoritas" sin número; "Filtrar" solo con ánimos y temas que existen.
- [ ] `/notas/:id`: la nota tejida, el contexto ("Escribiste hoy a las 7:16 · 42 palabras"), tu entrada plegable, el comentario de la réplica del día (o cuándo llega) y la favorita en la cabecera.
- [ ] `/replica-dia/:dia`: la réplica del día, la última réplica si la hubo y "Notas de tu día".
- [ ] Panel derecho en escritorio sin contadores, y quitar "cifradas" y el filtro roto de privadas.
- **Listo cuando:**
  - se puede abrir una nota, volver con el botón atrás y compartir su enlace;
  - la búsqueda encuentra una palabra que solo está en la réplica.

### Fase 5 — Evolución

- [ ] Quitar el cofre de aprendizajes y la etiqueta "Paso 7".
- [ ] La tela con la escala de la app.
- [ ] La curva que responde al cursor, al toque y a las flechas del teclado.
- [ ] Comparar los textos con `app/(tabs)/evolucion/index.tsx`.

### Fase 6 — Chat

- [ ] Estado vacío sin psicólogo y directorio con filtro por especialidad (`/chat/directorio`).
- [ ] Perfil del psicólogo (`/psicologo/:id`): "Escribirle a {nombre}" y "Terminar" con confirmación.
- [ ] Compartir el diario con la hoja que explica qué significa; mensajes de evento en la conversación.
- [ ] En menos de 1024 px, conversación a pantalla completa sin barra de navegación. Sin "En línea".
- [ ] Quitar "compartir una nota en el chat". Arreglar el scroll que mueve toda la página.
- **Listo cuando:** cambiar de psicólogo obliga a terminar el proceso y deja de compartir el diario.

### Fase 7 — Usuario, cofre y lo que falta

- [ ] Usuario sin título grande ni "Paso 7"; "Tus favoritas" con las frases guardadas de verdad.
- [ ] Ajustes plegables con los textos de la app y sin bloqueo. Recordatorio fuera hasta que exista Web Push. Sonidos: "Suaves…", sin números.
- [ ] Tu cuenta: "Entraste con…", cerrar sesión y eliminar cuenta (con confirmación). Sin exportar.
- [ ] "Soy psicólogo o psicóloga" (`/usuario/psicologo`), "Ver los tutoriales otra vez", Términos y Privacidad.
- [ ] Mi cofre (`/cofre`), con favoritas y destiladas.
- [ ] Compartir una frase como imagen (canvas 1080 × 1920, cuatro fondos, Web Share o descarga).
- [ ] Editar perfil con foto (recorte cuadrado).

### Fase 8 — Recorridos, sonidos y pulido

- [ ] Recorridos con los pasos y textos de `lib/tutorials.ts` de la app.
- [ ] Sonidos: no se descargan hasta activarlos; una sola descarga por sonido.
- [ ] `prefers-reduced-motion` en todas las animaciones (aura, pasada del hilo, corazón, texto palabra por palabra).
- [ ] Revisión de accesibilidad (`AGENTS.md`): etiquetas, foco, `inert` en lo plegado, contraste en claro y oscuro.
- [ ] Limpieza de textos:
  - sin emojis, mayúsculas de énfasis ni texto técnico;
  - textos de la app en todas las pantallas;
  - los ánimos siempre con su nombre bien escrito.
- [ ] Playground solo en desarrollo. Cambiar los comentarios que dicen `zairo-main/` a `replica mobile/zairo/`. Reemplazar el `frontend/README.md` de la plantilla de Vite.
- [ ] Medir la carga en 3G simulado.

### Fase 9 — Pruebas cruzadas

- [ ] Chrome Android y Chrome de escritorio.
- [ ] Safari iOS y Safari de escritorio: sin dictado, y que no se rompa nada.
- [ ] Firefox de escritorio.
- [ ] El recorrido completo (registro → primera nota → réplica → segunda nota → Notas → Chat) en cada navegador.

---

## Etapa B — Backend (compartido con el equipo de la app)

- [ ] Acceso al proyecto de Supabase compartido y acuerdo de migraciones (`03-base-de-datos.md` §0).
- [ ] Supabase Auth: Google, Apple si aplica, y correo con contraseña y código.
- [ ] Tablas y reglas de acceso reales (ya definidas: no se rediseñan desde la web).
- [ ] Consumir `generate-reply` y `generate-day-reply`: la web nunca llama a Gemini directamente.
- [ ] Reemplazar `services/ai` y `services/auth` simulados.
- [ ] Guardado sin conexión (IndexedDB) y sincronización.
- [ ] Chat en tiempo real (Supabase Realtime) y Web Push (con eso vuelve el recordatorio).

## Etapa C — Prueba cerrada

- [ ] Desplegar con HTTPS (Vercel o Netlify).
- [ ] Evaluar si conviene una PWA instalable (notificaciones en iOS).
- [ ] Sumar psicólogos reales al piloto, con el mismo directorio que la app.
- [ ] Medir lo mismo que la app: notas por usuario por semana, cuántos vuelven y uso del chat.

## Pendiente de decidir

**Solo en la web:**
- **Panel derecho de Inicio en escritorio.** Propuesta: solo las dos frases del día. Alternativas: dejar las notas recientes, o una sola columna.
- **Recordatorio diario.** Propuesta: no ofrecerlo hasta que Web Push funcione.

**Compartido con el equipo de la app** (no se decide solo desde la web):
- Cómo encuentra el usuario a su psicólogo.
- Quién verifica a los psicólogos y desde dónde (un panel de administración en la web es candidato).
- Logo definitivo y set final de ánimos.

## Pausado (igual que la app)

Planes y suscripciones, pagos, videollamadas propias, chat con la IA, pantalla de ayuda en crisis y exportar notas.
