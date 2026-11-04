# Estructura — Web

> Las reglas de producto y de diseño están en `DESIGN.md`, `PRODUCT.md` y `DESIGN-WEB.md`. Aquí va **con qué se arma la web y cómo se organiza**.
>
> La app móvil se descontinuó el 31 de octubre de 2026. Las columnas "En la app" quedan como registro de dónde salió cada pieza.

## Con qué se arma

| Parte | En la app (referencia) | En la web |
|---|---|---|
| Framework | Expo Router | React 19 + Vite + React Router 7 |
| Lenguaje | TypeScript estricto | TypeScript estricto (`"strict": true`) |
| Estilos | NativeWind (Tailwind 3), colores en `theme/colors.ts` | Tailwind 3, colores como variables CSS en `src/index.css` con los valores de `DESIGN.md` §3.3; el config debe aceptar opacidad sobre los tokens (`DESIGN-WEB.md` §7) |
| Componentes base | React Native Reusables | Componentes propios en `components/ui` (sin librería de componentes) |
| Animación | Reanimated 4 | Transiciones y `@keyframes` de CSS con los tokens de `DESIGN.md` §7; `requestAnimationFrame` solo donde haga falta (la planta de la bienvenida y la firma que se arma, con las líneas de tiempo del kit de marca) |
| Efectos y gráficas | Skia y react-native-svg | SVG del navegador |
| Iconos | lucide-react-native | lucide-react |
| Marca | `components/brand/logo.tsx` y `logo-motion.tsx` (Skia), geometría generada por el kit (`docs/marca`) | `components/brand/Logo.tsx` y `LogoMotion.tsx` (SVG), con la geometría y las líneas de tiempo en `logoGeometry.ts` y `logoTimelines.ts` |
| Fuentes | expo-font | `@fontsource` (Alegreya y Alegreya Sans alojadas en la web, sin Google Fonts) |
| Estado | Stores propios con `useSyncExternalStore` | Lo mismo: stores pequeños en TypeScript puro, con `useSyncExternalStore` |
| Guardado local | expo-sqlite (kv-store) | `localStorage` para preferencias y el modo simulado; IndexedDB (`replica-offline`) para la copia del diario y las notas que esperan conexión |
| Base de datos y usuarios | Supabase | Proyecto propio de Supabase en São Paulo (`03-base-de-datos.md`) |
| Lógica del servidor e IA | Edge Functions `generate-reply` y `generate-day-reply` | Edge Functions propias, en `supabase/functions/`; la web nunca llama a Gemini directamente |
| Dictado | expo-speech-recognition | Web Speech API (Chrome y Edge); sin soporte, no hay micrófono |
| Bloqueo | Face ID o huella | PIN (PBKDF2 con sal) y llave de acceso (WebAuthn) de ese navegador, en `lib/lock.ts`. Protege el acceso, no cifra |
| Notificaciones | expo-notifications | Web Push con VAPID: el service worker (`public/sw.js`) muestra el aviso y `send-reminders` lo manda. Sin `VITE_VAPID_PUBLIC_KEY`, el recordatorio no se ofrece |
| Sin conexión | — | El mismo service worker guarda la web ya construida (`precache.json`, solo en producción) |
| Publicación | Tiendas | Vercel, con HTTPS (Fase 18) |
| Sesiones por video | Links de Google Meet | Igual |

## Antes de la app: bienvenida, cuenta y configuración

Cada etapa solo ve sus pantallas. Igual que `lib/session.ts` de la app: la sesión guarda la cuenta, el consentimiento (con su `TERMS_VERSION`) y si terminó la configuración, y de eso sale la etapa: `auth` → `consent` → `setup` → `app`. Las rutas de una etapa que no corresponde redirigen a la que sí.

1. **Bienvenida** (`/bienvenida`): tres páginas con la planta que crece. "Crear mi cuenta" y "Ya tengo cuenta" en todas.
2. **Cuenta**: Google o correo y contraseña (mínimo **8** caracteres, con botón para verla).
   - **Crear:** `/entrar` → `/correo` → `/contrasena` (crea una) → `/codigo` (6 dígitos que confirman el correo).
   - **Entrar:** `/entrar?modo=entrar` → `/correo` → `/contrasena`.
   - **¿Olvidaste tu contraseña?:** código al correo → contraseña nueva → adentro.
   - El código se verifica solo al escribir el sexto dígito, se puede reenviar a los 60 s y "Cambiar correo" vuelve atrás.
3. **Consentimiento** (`/consentimiento`): las cuatro promesas de la app y tres casillas (18 años o más; términos y privacidad, con enlaces a `/legal/terminos` y `/legal/privacidad`; una IA lee las notas). Si cambia `TERMS_VERSION`, se vuelve a pedir.
4. **Configuración** (`/configurar`): un paso por pantalla. Nombre (obligatorio; Google lo trae), qué te trae (6 opciones con ícono, se puede omitir), tono (suave, profundo o directo) y hora de la réplica del día (20:00 o 22:00).
5. **Listo** (`/listo`): "Todo listo, {nombre}", la firma «Se escribe y florece» y lleva a la primera nota.

Quien entra con una cuenta que ya existía va directo a la app. Sin variables de entorno, la cuenta es simulada (`services/auth`, contrato en `services/auth/types.ts`): cualquier código de 6 dígitos entra y `000000` simula uno equivocado; cualquier contraseña de 8 o más entra y `equivocada` simula una incorrecta.

## Rutas

| Ruta | Pantalla | En la app |
|---|---|---|
| `/bienvenida`, `/entrar`, `/correo`, `/contrasena`, `/codigo` | Registro y cuenta | `app/(auth)/*` |
| `/consentimiento`, `/configurar`, `/listo` | Primera configuración | `app/(setup)/*` |
| `/` | Inicio | `app/(tabs)/index.tsx` |
| `/notas` | Notas | `app/(tabs)/notas/index.tsx` |
| `/notas/:id` | Detalle de una nota | `app/(tabs)/notas/[id].tsx` |
| `/replica-dia/:dia` | Tu día | `app/replica-dia/[day].tsx` |
| `/evolucion` | Evolución | `app/(tabs)/evolucion/index.tsx` |
| `/chat` | Conversación (o el estado vacío si no hay psicólogo) | `app/(tabs)/chat`, `app/conversacion.tsx` |
| `/chat/conversacion/:id` | Una conversación terminada, solo para leerla | No existe en la app |
| `/chat/directorio` | Directorio de psicólogos | `app/(tabs)/chat/directorio.tsx` |
| `/psicologo/:id` | Perfil de un psicólogo | `app/psicologo/[id].tsx` |
| `/usuario` | Usuario | `app/(tabs)/usuario/index.tsx` |
| `/usuario/psicologo` | Soy psicólogo o psicóloga | `app/(tabs)/usuario/psicologo.tsx` |
| `/cofre` | Mi cofre | `app/cofre.tsx` |
| `/legal/:doc` | Términos o Privacidad | `app/legal/[doc].tsx` |
| `/playground` | Componentes base (solo en desarrollo) | `app/playground.tsx` |
| `/profesional/dashboard` | Panel del psicólogo verificado | No existe en la app |
| `/profesional/pacientes/:id` | Diario consentido y notas clínicas | No existe en la app |
| `/profesional/mensajes`, `/profesional/mensajes/:id` | Conversaciones del psicólogo (sin lámina) y la elegida | No existe en la app |
| `/profesional/admin` | Auditoría de solicitudes de verificación | No existe en la app |
| `/ayuda` | Ayuda en crisis | No existe en la app. Con `CrisisButton` en toda pantalla con sesión |
| `/chat/ia`, `/chat/ia/:id` | Chat con Replica | No existe en la app. `/chat/ia/nueva` empieza una conversación |
| `/bloqueado` | Diario bloqueado | No existe en la app |

Las rutas `/profesional/*` y el rediseño de `/usuario/psicologo` están en `DESIGN-WEB.md` §10, y las tres últimas en su §11. Las profesionales dependen del rol (`user`, `psychologist` o `admin`): una ruta de un rol que no corresponde lleva a `/`.

Compartir el diario, compartir una frase como imagen y editar el perfil son hojas o ventanas (`DESIGN-WEB.md` §5), no rutas.

## Pantallas

Hacen lo mismo que en la app: el detalle está en `DESIGN.md` §10 y §11 y en `docs/02-estructura.md` de la app. Lo esencial que la web tiene que respetar:

- **Inicio:** se escribe sin límite; **solo la primera nota no privada del día recibe su réplica al momento** (botón "Replica"); las demás se guardan ("Guardar") y las lee la réplica del día a la hora elegida, que les deja un comentario a cada una. Si se escribe después de esa, a medianoche llega una última réplica. Bajo el saludo, una sola línea dice cuándo llega, que se está leyendo o que llegó. Ánimo y un tema son necesarios: si faltan, Replica los pregunta con su voz y sigue sola al tenerlos. Cada réplica deja una frase destilada que se puede guardar en el cofre.
- **Notas:** lista por día con la réplica de cada día arriba; búsqueda sin tildes (también en el texto de la réplica); "Todas / Favoritas" y "Filtrar" por ánimo y tema (solo los que existen en tus notas). Detalle y "Tu día" como páginas.
- **Evolución:** curva y barras por semana, mes o año; temas y patrones; tu escritura en números; tu tela.
- **Chat:** un psicólogo a la vez; las sesiones las agenda el psicólogo; compartir el diario con una hoja que explica qué significa; para cambiar de psicólogo, primero se termina el proceso (con confirmación), lo que deja de compartir el diario.
- **Usuario:** ficha, métricas de 30 días, tus favoritas, ajustes plegables (Tu réplica, Tu espacio privado, Apariencia), tu cuenta (cerrar sesión, eliminar cuenta), "Soy psicólogo o psicóloga", "Ver los tutoriales otra vez", Términos y Privacidad.

## Datos

- **Los días se cuentan en hora local** (`dayKey`), nunca con `toISOString().slice(0, 10)`: en Venezuela (UTC−4) eso mueve al día siguiente todo lo escrito después de las 20:00.
- Las pantallas usan los stores y `services/`. Con `VITE_SUPABASE_URL` definida va la versión real; sin ella, la simulada, que queda como respaldo. `authService` y `replyService` tienen el mismo contrato en las dos. El resto lo cubre `services/data`: sin Supabase es `null`, y cada store guarda en el navegador como siempre.
- **Con Supabase, los stores son una caché en memoria.** `lib/session.ts` trae toda la cuenta al entrar y mientras tanto la etapa es `loading`; si no se puede, `unreachable` ofrece volver a intentarlo. Al cerrar sesión se vacían, para que la próxima cuenta no vea nada de esta. Del diario, en el navegador solo queda lo que no se pudo enviar, por cuenta, en `replica.outbox.<id>`. La solicitud de psicólogo, la revisión y el área profesional hablan con Supabase desde `services/professional`.
- **Lo que no llega al servidor no se muestra como hecho.** Las favoritas y los ajustes vuelven atrás, un mensaje no enviado regresa al campo con su aviso, y una nota queda en la bandeja y se reintenta al volver la conexión.
- **Réplicas.** La primera del día sale de `generate-reply` y se muestra palabra por palabra con el mismo ritmo de siempre (`services/ai/pace.ts`). Las del día las genera el servidor a su hora y llegan en tiempo real.
- Cerrar sesión no borra el diario; eliminar la cuenta borra todo (notas, réplicas, frases, conversaciones, chats con la IA y perfil).

### Roles

- **De dónde sale.** El rol llega en la cuenta (`AuthAccount.role`). En Supabase vive en `app_metadata`, y solo el servidor lo cambia.
- **Quién protege qué.** Las guardas de rol ordenan la interfaz; el permiso real lo da RLS. Lo que la persona no autorizó se filtra en el servidor: el visor recibe solo las notas no privadas, sin réplicas.
- **Con Supabase.** Las cuentas de prueba las crea `npm run cuentas` (`supabase/README.md`), y el rol que cuenta es el del perfil, leído al entrar.
- **Sin Supabase.** Con correo y cualquier contraseña válida, `admin@replica.test` entra como administrador y `valeria@replica.test` como la psicóloga `psi-valeria`. Cualquier otra cuenta es `user`.

### Documentos de verificación

Van al bucket privado `credentials` y se abren con URL firmadas. En la versión simulada, la solicitud y su revisión viven en `replica.profesional.v1` y los PDF en IndexedDB (`replica-profesional`), así que siguen ahí después de recargar. Una solicitud aprobada entra al directorio.

### Honestidad

La interfaz no menciona la doble verificación (MFA) ni el cifrado hasta que existan de verdad.

## Recorridos (tutoriales)

Los mismos pasos y textos que la app (`lib/tutorials.ts` de la app): Inicio, racha, primera réplica, Notas, Evolución, Chat y Usuario. Pantalla oscurecida con el elemento recortado, una línea de texto, "Saltar todo", "1 de 5" y "Siguiente". `Escape` lo cierra. Se repiten desde Usuario → "Ver los tutoriales otra vez". Lo visto es de la cuenta: en otro navegador no se repiten. Sin Supabase, se guarda en el navegador.

## Sonidos

La misma familia que la app, en `public/sounds/`. **Apagados por defecto** en la web; se activan en Usuario → Apariencia o con el botón de la bienvenida. No se descargan hasta que se activan (pesan 1,2 MB). Suenan y callan en los mismos momentos que en la app (`DESIGN.md` §8).

## Navegadores

- Prioridad de pruebas (público mayormente con Android): Chrome Android, Chrome de escritorio, Safari iOS, Safari de escritorio y Firefox.
- Dictado: solo Chrome y Edge. Sin soporte, no se muestra el micrófono.
- Web Push y passkeys necesitan HTTPS; Safari en iOS solo tiene notificaciones si la web está instalada como PWA.

## Publicación

- Vercel, con el repositorio conectado y **Root Directory `frontend`**. La configuración está en `frontend/vercel.json`: el build de Vite, todas las rutas a `index.html` y las cabeceras de seguridad.
- **CSP:** scripts, estilos, fuentes, sonidos y el Service Worker solo de la propia web (las fuentes van alojadas, sin Google Fonts); conexiones a la propia web y a Supabase (`https://*.supabase.co` y `wss://*.supabase.co`, para REST, Auth, Storage, Edge Functions y Realtime); imágenes de la web, de Storage y `data:`/`blob:` (la foto mientras se recorta); el PDF de verificación en `object` desde Storage o `blob:`. Estilos en línea permitidos, porque React los usa en `style`. Ningún script en línea ni `eval`. Google Meet y las fuentes de `/ayuda` son enlaces externos: la CSP no limita adónde se navega.
- **Otras cabeceras:** HSTS de dos años, `X-Content-Type-Options`, `X-Frame-Options: DENY` con `frame-ancestors 'none'`, `Referrer-Policy`, `Cross-Origin-Opener-Policy` y `Permissions-Policy` sin cámara, ubicación ni pagos, con llaves de acceso solo para la propia web. El micrófono queda permitido por el dictado.
- `npm run preview` sirve las mismas cabeceras (las lee de `vercel.json`), así la CSP se prueba antes de publicar.
- Variables de entorno en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_VAPID_PUBLIC_KEY`. La dirección pública va también en Supabase (Authentication → URL Configuration) y en el cliente OAuth de Google.

## Estructura de carpetas

```
frontend/src/
  pages/                 una carpeta o archivo por ruta
  components/
    ui/                  piezas base (botón, tarjeta, pastilla, ventana, segmentado…)
    motion/              primitivas de movimiento (corazón, entrada, texto palabra por palabra…)
    layout/              barra lateral, barra inferior y layout principal
    brand/               marca (logo, firma animada, geometría del kit), cofre, planta de la racha, bienvenida
  features/              por función: auth, journal (Inicio), notes, care (chat), cofre, profile, evolution
  data/                  textos de cada pantalla (*Content.ts): fuente del copy
  hooks/                 hooks compartidos (tema, movimiento reducido…)
  lib/                   utilidades (sesión, fechas, sonidos, almacenamiento, recorridos)
  services/              servicios con versión real y simulada (auth, ai y los que se sumen)
  lib/supabase/          cliente de Supabase
  lib/offline/           guardado sin conexión (IndexedDB)
frontend/scripts/        cuentas de prueba y comprobación de accesos contra el proyecto real
supabase/
  README.md              los pasos con claves, para la persona responsable
  migrations/            esquema, reglas de acceso y datos iniciales
  functions/             funciones de servidor (Deno)
```

## Fuera del proyecto

Pagos, planes y videollamadas propias.
