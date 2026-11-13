# Revisión de requisitos — Fase 18

Los 61 requisitos funcionales y los 15 no funcionales de la especificación (`entrega-evaluacion-3/fuentes/datos.mjs`), uno por uno. Revisión del 4 de noviembre de 2026, con la evidencia de cada fase (`04-plan.md`) y lo medido ese día en la versión construida, en modo simulado y con la CSP de Vercel puesta (`npm run preview`).

**Resultados:**
- **Cumple:** funciona y se comprobó.
- **Cumple, con nota:** funciona, con un matiz que se dice.
- **Cumple en parte:** funciona, pero no llega a la meta que fija el requisito.
- **Falta comprobar:** está construido, pero falta una prueba que solo se hace en la dirección pública o en un dispositivo.

La última columna dice dónde se comprobó: "real" es contra el proyecto de Supabase (`npm run flujo`, `npm run accesos` o la persona responsable en la web); "simulado" es el navegador sin claves.

El recorrido completo en la dirección pública (Fase 18, bloque 5) todavía no se hizo: cuando se haga, se anota al final.

## Funcionales

### M1 y M2 — Acceso, consentimiento y configuración

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-01 | Cumple | Bienvenida de tres páginas con «Crear mi cuenta» y «Ya tengo cuenta» en todas (Fase 2; vista el 4-nov). |
| RF-02 | Cumple | 8 caracteres, «Faltan N» y botón para ver la contraseña (Fase 2; visto el 4-nov). Real: cuenta creada el 31-oct. |
| RF-03 | Cumple | Seis casillas, verificación al sexto dígito, reenviar a los 60 s y «Cambiar correo» (Fase 2). Real: el código llegó a un correo real el 31-oct. |
| RF-04 | Cumple | Entrar con contraseña; la equivocada se dice con amabilidad (Fase 2). Real: Fase 14. |
| RF-05 | Cumple, con nota | Google, comprobado en real el 2-nov. Apple salió del proyecto el 31-oct y Google lo reemplaza en este requisito (`04-plan.md`, decisiones del 31 de octubre). |
| RF-06 | Cumple | «¿Olvidaste tu contraseña?», código y contraseña nueva (Fase 2). Real: plantillas con `{{ .Token }}` (Fase 14). |
| RF-07 | Cumple | Etapas cuenta → consentimiento → configuración → app, con guardas por etapa y el paso guardado al recargar (Fase 2). El 4-nov, una cuenta nueva no pudo abrir `/profesional/dashboard` sin pasar por `/consentimiento`. |
| RF-08 | Cumple | Tres casillas (18 años, términos y privacidad, la IA lee las notas); `TERMS_VERSION` vuelve a pedirlo (Fases 2 y 16). |
| RF-09 | Cumple | `/legal/terminos` y `/legal/privacidad` con y sin sesión (Fase 2). |
| RF-10 | Cumple | Nombre, qué te trae (6, omitible), tono, hora de la réplica del día y «Todo listo» con «Escribir mi primera nota». Recorrido el 4-nov. |

### M3 — Diario (Inicio)

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-11 | Cumple | Nota de cualquier largo, `Ctrl/⌘ + Enter` (Fase 3). Real: Fase 14. |
| RF-12 | Cumple | Siete ánimos y un tema; si faltan, la pastilla late con la voz de Replica y la nota se guarda al completarse (Fase 3). |
| RF-13 | Falta comprobar | El micrófono aparece solo si existe `SpeechRecognition` (`useDictation.ts`). Falta el dictado con micrófono real en Chrome (Fase 9). |
| RF-14 | Cumple | Real: una nota privada se rechaza antes de Gemini y no aparece en los registros (Fase 14); no le llega a la psicóloga por consulta directa (Fase 16). |
| RF-15 | Cumple | «Escribir sobre esto» con el recuadro «Escribes sobre…» (Fase 3). |
| RF-16 | Cumple, con nota | Real: la primera nota recibe réplica y la segunda dice «Guardar»; seis notas a la vez, solo una pide réplica (Fase 14). La cuenta de demostración es la excepción documentada en `DESIGN.md`. |
| RF-17 | Cumple | Titular, análisis, preguntas y frase destilada, palabra por palabra; «Intentar de nuevo» si falla (Fase 3). Real con Gemini en unos 4 s (Fase 14). |
| RF-18 | Cumple | Real: `npm run programada` pasó dos veces; la réplica del día llegó sola y leyó sus dos notas (Fase 14). La línea bajo el saludo cambia de estado (Fase 3). |
| RF-19 | Cumple | Última réplica de medianoche solo con las notas posteriores, en `generate-day-reply` (Fase 14). |
| RF-20 | Cumple | `take_ai_call` deja tres llamadas por persona y día en el servidor; la web llama solo a las Edge Functions (`supabase/functions/generate-reply`). |
| RF-21 | Cumple | Racha con la planta, calculada de las notas en hora local (Fase 3). |
| RF-22 | Cumple | Dos frases del día con su autor; vistas el 4-nov («Cita del día», Epicteto). |

### M4 — Notas

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-23 | Cumple | Agrupadas por día en hora local, con la réplica del día arriba (Fases 1 y 4). |
| RF-24 | Cumple | Sin tildes ni mayúsculas; encuentra una palabra que solo está en la réplica (Fase 4). |
| RF-25 | Cumple | «Todas / Favoritas» sin número; el filtro ofrece solo ánimos y temas que existen (Fase 4). |
| RF-26 | Cumple | `/notas/:id` con enlace propio, contexto, entrada plegable y comentario de la réplica del día (Fase 4). |
| RF-27 | Cumple | Favorita en la cabecera del detalle (Fase 4). |
| RF-28 | Cumple | `/replica-dia/:dia` con la réplica del día, la última y las notas (Fases 4 y 11). |
| RF-29 | Cumple | PDF o texto, rango de fechas y privadas a elección, armado en el navegador con los datos propios (Fase 17). El 4-nov, jsPDF generó un PDF con la CSP puesta, sin violaciones. |

### M5 — Evolución

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-30 | Cumple | Curva y barras por semana, mes y año; cursor, toque y flechas (Fase 5). |
| RF-31 | Cumple | Temas frecuentes y patrones de las notas (Fase 5). |
| RF-32 | Cumple | Notas, palabras y la tela de 12 semanas (Fase 5). |
| RF-33 | Cumple | Métricas solo de lo escrito o elegido; las barras sin porcentajes (Fase 11); el panel profesional solo con números calculados (Fase 16). |

### M6 — Cofre

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-34 | Cumple | Guardar y quitar la frase destilada o la del día (Fase 7). |
| RF-35 | Cumple | «Guardadas» y «De tus réplicas», sin contadores (Fases 7 y 11). |
| RF-36 | Cumple | Imagen de 1080 × 1920 con cuatro fondos, Web Share o descarga (Fases 7 y 10). |

### M7 — Chat con psicólogos

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-37 | Cumple | Directorio con filtro por especialidad (Fase 6); solo verificados (Fase 16). |
| RF-38 | Cumple | Perfil con especialidades, enfoque, años, biografía y licencia; se escribe tras aceptar la solicitud (Fase 16). |
| RF-39 | Cumple | Un psicólogo activo a la vez y estado vacío amable (Fases 6 y 16). |
| RF-40 | Cumple | Hoja que explica antes de compartir y se retira cuando quieras (Fase 6). Real: al retirar el permiso las notas dejan de verse (Fase 16). |
| RF-41 | Cumple | Sesiones con «Unirse por Meet» (Fase 16). Meet es un enlace externo y la CSP no lo bloquea. |
| RF-42 | Cumple | Terminar con confirmación antes de cambiar, y deja de compartir (Fase 6). Real: Fase 16. |
| RF-43 | Cumple | Real: tiempo real con respaldo al reconectar; `flujo` pasó «Tiempo real» (Fase 16). |
| RF-44 | Cumple | Hoja desde `/chat` sin privadas y con «Ya la compartiste» (Fase 17, simulado). Real: `flujo` pasó con «Nota suelta en el chat» el 4-nov. |

### M8 — Usuario y ajustes

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-45 | Cumple | Ficha, métricas de 30 días y favoritas (Fases 7 y 11). |
| RF-46 | Cumple | Nombre, intención y foto con recorte cuadrado (Fase 7). Real: Storage con sus límites (Fase 14). |
| RF-47 | Cumple | Tono y hora de la réplica del día (Fase 7). |
| RF-48 | Cumple | Sistema, claro u oscuro; sonidos apagados que no se descargan hasta activarlos (Fase 8). |
| RF-49 | Cumple | Recorridos con «Saltar todo» y «Ver los tutoriales otra vez» (Fase 8), guardados en la cuenta (Fase 14). El 4-nov se corrigió el foco: ahora Tab recorre solo la tarjeta del recorrido. |
| RF-50 | Cumple | Real: cerrar sesión y entrar en otro navegador muestra el mismo diario (Fase 14). |
| RF-51 | Cumple | Real: eliminar la cuenta borra todo, archivos incluidos (Fase 14). |
| RF-52 | Cumple | PIN y llave de acceso, al abrir y tras 1, 5 o 15 minutos; nunca dice «cifrado» (Fase 17). La llave de acceso necesita HTTPS: falta probarla en la dirección pública. |
| RF-53 | Falta comprobar | Real: la suscripción se registra y `send-reminders` responde `sent:1`, pero el aviso no se vio en pantalla (Fase 17). En la web real solo aparece con `VITE_VAPID_PUBLIC_KEY`. |

### M9 — Atención profesional

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-54 | Cumple | Solicitud con sus campos, PDF y estados (Fase 16). Real: «Verificación» en `flujo`. |
| RF-55 | Cumple | Responder, agendar por Meet y leer los diarios compartidos solo con permiso activo (Fase 16). Real: «Acompañamiento» y «Visor y notas clínicas». |
| RF-56 | Cumple | Aprobar, pedir subsanación o rechazar; solo los aprobados en el directorio (Fase 16). |

### M10 — Chat con la IA

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-57 | Cumple | Real: respuesta palabra por palabra, historial, sin notas privadas y límite con 429 dicho con la voz de Replica (Fase 15). |
| RF-58 | Cumple | Lista, retomar y borrar con confirmación (Fase 15). |

### M11 — Ayuda en crisis

| RF | Resultado | Cómo se comprobó |
|---|---|---|
| RF-59 | Cumple | `CrisisButton` en toda pantalla con sesión y en el área profesional (Fase 15). |
| RF-60 | Cumple | Líneas con su fuente oficial y fecha, respiración y «Escribirle a» su psicólogo; un país sin línea comprobada no muestra ningún número (Fase 15). |
| RF-61 | Cumple | Real: la nota de riesgo llega marcada, sin consejos y con el enlace a `/ayuda`; el chat también marca el riesgo (Fase 15). |

## No funcionales

| RNF | Resultado | Cómo se comprobó |
|---|---|---|
| RNF-01 | Cumple | RLS en el 100 % de las tablas. Real: `npm run accesos`, con consultas directas de varias cuentas (Fases 14 y 16). |
| RNF-02 | Cumple | Réplicas y chat solo desde Edge Functions. La CSP de Vercel solo deja conectar con la propia web y con Supabase, así que el navegador no podría llamar a Gemini aunque quisiera. |
| RNF-03 | Cumple | Sin «cifrado» (Fase 17); el recordatorio no aparece sin su clave. |
| RNF-04 | Cumple | El 4-nov, en todas las pantallas de la persona y del área profesional: todo campo visible tiene su etiqueta, ninguno queda sin nombre. Foco visible y `inert` en lo plegado (Fase 8). `TourHost` ahora deja la página inerte. |
| RNF-05 | Cumple, con nota | El 4-nov: ningún texto por debajo de 4,5:1 (o 3:1 los grandes) en claro ni en oscuro, en 435 textos de la persona y en el área profesional; campos a 16 px. Áreas de 44 px en todo lo tocable a 375 px, salvo dos excepciones de WCAG 2.5.8: los enlaces de la fuente en `/ayuda`, que van dentro de una frase, y las celdas de la tela de Evolución, de 18 px a 24 px entre centros (12 semanas no caben a 44 px en un teléfono). |
| RNF-06 | Cumple | `prefers-reduced-motion` en toda animación (Fases 8 y 10). |
| RNF-07 | Cumple | El 4-nov, sin desborde horizontal a 320, 375, 767, 768, 769, 1023, 1024 y 1440, en las pantallas de la persona y del área profesional, con barra de desplazamiento clásica. |
| RNF-08 | Cumple | Revisión de textos de la Fase 8 y de cada fase después. |
| RNF-09 | Cumple | Sin insignias con número (Fases 4, 7 y 11). |
| RNF-10 | Cumple en parte | La descarga inicial del build real pesa 223 kB comprimidos (JS 211 kB y CSS 12 kB), un 49 % sobre los 150 kB. El cliente de Supabase pesa 55 kB y hace falta al entrar, para saber si hay sesión; en la Fase 8, sin él, eran de 135 a 145 kB. jsPDF, html2canvas y cada pantalla se cargan aparte. La primera pintura no depende de eso: el ícono de carga va en `index.html` y en 3G rápida se vio a 1,4 s (Fase 10). Falta medirla en la dirección pública. |
| RNF-11 | Falta comprobar | Chrome y Firefox de escritorio probados (Fase 9). Faltan Chrome Android y Safari (iOS y escritorio), que necesitan los dispositivos. |
| RNF-12 | Cumple | `dayKey` en hora local en todo el código; una nota de ayer a las 21:40 en Caracas cae en «Ayer» (Fase 1). |
| RNF-13 | Cumple | IndexedDB, bandeja de notas pendientes y copia del diario (Fase 17, simulado). |
| RNF-14 | Cumple | TypeScript estricto sin `any`, stores con `useSyncExternalStore`, colores con tokens y servicios con su versión real y simulada. `tsc` y `lint` pasan. |
| RNF-15 | Cumple | Las claves van en variables de entorno de Vercel y en secretos de Supabase; antes de subir se revisó que el repositorio no tenga ninguna. En https://proyecto-replica.vercel.app, `http` redirige a `https` (308), con HSTS de dos años y `upgrade-insecure-requests` (4-nov). |

## Recorrido en la dirección pública

Publicada el 4 de noviembre en https://proyecto-replica.vercel.app. Cabeceras, CSP, manifiesto y conexión con Supabase comprobados en vivo. El recorrido con las cuentas de prueba lo hace la persona responsable: pendiente de anotar aquí.

El 4 de noviembre, después de los cambios de esta fase, `npm run accesos` y `npm run flujo` pasaron completos contra el proyecto real.
