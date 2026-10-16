# Plan de trabajo — Web

> La web se construye primero completa con datos simulados, igual que la app, y después se conecta al backend compartido. La referencia de cada pantalla es la app (`../replica mobile/zairo`), que **solo se lee**. Cada fase termina con la verificación de `AGENTS.md` ("Antes de dar algo por terminado") y un commit.

## Dónde estamos (16 de octubre de 2026)

**Fases 0 a 8 hechas** (commit "etapa 1", 12 de octubre), con el contraste y la carga en 3G ya medidos. **Fase 9 a medias:** Chrome y Firefox de escritorio probados. Faltan Chrome Android, Safari (iOS y escritorio) y el dictado con micrófono real en Chrome.

**16 de octubre:** la app adoptó su marca nueva (manual y kit en su `docs/marca`). Se volvió a copiar `DESIGN.md` y se acordó que la web tiene interfaces propias cuando le hacen falta (`AGENTS.md`, `DESIGN-WEB.md` §1). **Fases 10 y 11 hechas:** la marca en la web y las correcciones y mejoras propias del navegador (sin commit, a la espera de revisión).

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
- [ ] Evaluar si conviene una PWA instalable (notificaciones en iOS). Si sí, el manifiesto con los íconos del kit (`icon-192`, `icon-512`, `icon-maskable-512`).
- [ ] Enlace compartido: `og-claro-1200x630.png`, descripción y `theme-color` en `index.html` (necesitan la dirección final).
- [ ] Sumar psicólogos reales al piloto, con el mismo directorio que la app.
- [ ] Medir lo mismo que la app: notas por usuario por semana, cuántos vuelven y uso del chat.

## Pendiente de decidir

**Solo en la web:**
- **Panel derecho de Inicio en escritorio.** Propuesta: solo las dos frases del día. Alternativas: dejar las notas recientes, o una sola columna.
- **Recordatorio diario.** Propuesta: no ofrecerlo hasta que Web Push funcione.

**Compartido con el equipo de la app** (no se decide solo desde la web):
- Cómo encuentra el usuario a su psicólogo.
- Quién verifica a los psicólogos y desde dónde (un panel de administración en la web es candidato).
- Set final de ánimos. (El logo ya está definido: manual y kit en `docs/marca` de la app.)

## Pausado (igual que la app)

Planes y suscripciones, pagos, videollamadas propias, chat con la IA, pantalla de ayuda en crisis y exportar notas.
