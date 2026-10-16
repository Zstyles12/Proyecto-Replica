# Estructura — Web

> La web es la misma Replica que la app, adaptada a escritorio. Las reglas de producto y de diseño son las de la app (`DESIGN.md` y `PRODUCT.md`, copias exactas). Lo que la web hace distinto a propósito está en `DESIGN-WEB.md`. Aquí va **con qué se arma la web y cómo se organiza**.
>
> La app de referencia vive en `../replica mobile/zairo` (repo `ManuelGoncalvesR/zairo`). **Solo se lee, nunca se modifica.** Su `docs/02-estructura.md` describe cada pantalla con detalle: ante una duda de comportamiento, manda la app.

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
| Marca | `components/brand/logo.tsx` y `logo-motion.tsx` (Skia), geometría generada por el kit (`docs/marca`) | `components/brand/Logo.tsx` y `LogoMotion.tsx` (SVG); la geometría y las líneas de tiempo se copian del kit de la app con `npm run marca` |
| Fuentes | expo-font | `@fontsource` (Alegreya y Alegreya Sans alojadas en la web, sin Google Fonts) |
| Estado | Stores propios con `useSyncExternalStore` | Lo mismo: stores pequeños en TypeScript puro, con `useSyncExternalStore` |
| Guardado local | expo-sqlite (kv-store) | `localStorage` mientras todo es simulado; IndexedDB cuando llegue el guardado sin conexión |
| Base de datos y usuarios | Supabase | **El mismo proyecto de Supabase**, mismas tablas y reglas (`03-base-de-datos.md`) |
| Lógica del servidor e IA | Edge Functions `generate-reply` y `generate-day-reply` | Las mismas; la web nunca llama a Gemini directamente |
| Dictado | expo-speech-recognition | Web Speech API (Chrome y Edge); sin soporte, no hay micrófono |
| Bloqueo | Face ID o huella | Fuera de la v1 web |
| Notificaciones | expo-notifications | Web Push (Etapa B); antes, el recordatorio no se ofrece |
| Sesiones por video | Links de Google Meet | Igual |

## Antes de la app: bienvenida, cuenta y configuración

Cada etapa solo ve sus pantallas. Igual que `lib/session.ts` de la app: la sesión guarda la cuenta, el consentimiento (con su `TERMS_VERSION`) y si terminó la configuración, y de eso sale la etapa: `auth` → `consent` → `setup` → `app`. Las rutas de una etapa que no corresponde redirigen a la que sí.

1. **Bienvenida** (`/bienvenida`): tres páginas con la planta que crece. "Crear mi cuenta" y "Ya tengo cuenta" en todas.
2. **Cuenta**: Apple, Google o correo y contraseña (mínimo **8** caracteres, con botón para verla).
   - **Crear:** `/entrar` → `/correo` → `/contrasena` (crea una) → `/codigo` (6 dígitos que confirman el correo).
   - **Entrar:** `/entrar?modo=entrar` → `/correo` → `/contrasena`.
   - **¿Olvidaste tu contraseña?:** código al correo → contraseña nueva → adentro.
   - El código se verifica solo al escribir el sexto dígito, se puede reenviar a los 60 s y "Cambiar correo" vuelve atrás.
3. **Consentimiento** (`/consentimiento`): las cuatro promesas de la app y tres casillas (18 años o más; términos y privacidad, con enlaces a `/legal/terminos` y `/legal/privacidad`; una IA lee las notas). Si cambia `TERMS_VERSION`, se vuelve a pedir.
4. **Configuración** (`/configurar`): un paso por pantalla. Nombre (obligatorio; Apple o Google lo traen), qué te trae (6 opciones con ícono, se puede omitir), tono (suave, profundo o directo) y hora de la réplica del día (20:00 o 22:00).
5. **Listo** (`/listo`): "Todo listo, {nombre}", la firma «Se escribe y florece» y lleva a la primera nota.

Quien entra con una cuenta que ya existía va directo a la app. Hasta que exista Supabase todo es simulado (`services/auth`), con el mismo contrato que la app (`services/auth/types.ts`): cualquier código de 6 dígitos entra y `000000` simula uno equivocado; cualquier contraseña de 8 o más entra y `equivocada` simula una incorrecta.

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
| `/chat/directorio` | Directorio de psicólogos | `app/(tabs)/chat/directorio.tsx` |
| `/psicologo/:id` | Perfil de un psicólogo | `app/psicologo/[id].tsx` |
| `/usuario` | Usuario | `app/(tabs)/usuario/index.tsx` |
| `/usuario/psicologo` | Soy psicólogo o psicóloga | `app/(tabs)/usuario/psicologo.tsx` |
| `/cofre` | Mi cofre | `app/cofre.tsx` |
| `/legal/:doc` | Términos o Privacidad | `app/legal/[doc].tsx` |
| `/playground` | Componentes base (solo en desarrollo) | `app/playground.tsx` |

Compartir el diario, compartir una frase como imagen y editar el perfil son hojas o ventanas (`DESIGN-WEB.md` §5), no rutas.

## Pantallas

Hacen lo mismo que en la app: el detalle está en `DESIGN.md` §10 y §11 y en `docs/02-estructura.md` de la app. Lo esencial que la web tiene que respetar:

- **Inicio:** se escribe sin límite; **solo la primera nota no privada del día recibe su réplica al momento** (botón "Replica"); las demás se guardan ("Guardar") y las lee la réplica del día a la hora elegida, que les deja un comentario a cada una. Si se escribe después de esa, a medianoche llega una última réplica. Bajo el saludo, una sola línea dice cuándo llega, que se está leyendo o que llegó. Ánimo y un tema son necesarios: si faltan, Replica los pregunta con su voz y sigue sola al tenerlos. Cada réplica deja una frase destilada que se puede guardar en el cofre.
- **Notas:** lista por día con la réplica de cada día arriba; búsqueda sin tildes (también en el texto de la réplica); "Todas / Favoritas" y "Filtrar" por ánimo y tema (solo los que existen en tus notas). Detalle y "Tu día" como páginas.
- **Evolución:** curva y barras por semana, mes o año; temas y patrones; tu escritura en números; tu tela.
- **Chat:** un psicólogo a la vez; las sesiones las agenda el psicólogo; compartir el diario con una hoja que explica qué significa; para cambiar de psicólogo, primero se termina el proceso (con confirmación), lo que deja de compartir el diario.
- **Usuario:** ficha, métricas de 30 días, tus favoritas, ajustes plegables (Tu réplica, Tu espacio privado, Apariencia), tu cuenta (cerrar sesión, eliminar cuenta), "Soy psicólogo o psicóloga", "Ver los tutoriales otra vez", Términos y Privacidad.

## Datos mientras no hay backend

- Los datos simulados siguen **el modelo de la app** (`features/*/store.ts`, `features/journal/types.ts`, `services/ai`), que es el que ya está probado y se va a mapear a las tablas de `03-base-de-datos.md` en la Etapa B.
- **Los días se cuentan en hora local** (`dayKey`), nunca con `toISOString().slice(0, 10)`: en Venezuela (UTC−4) eso mueve al día siguiente todo lo escrito después de las 20:00.
- Cada servicio simulado tiene el mismo contrato que tendrá con Supabase, para reemplazarlo sin tocar las pantallas.
- Cerrar sesión no borra el diario; eliminar la cuenta borra todo (notas, réplicas, frases, conversaciones y perfil).

## Recorridos (tutoriales)

Los mismos pasos y textos que la app (`lib/tutorials.ts` de la app): Inicio, racha, primera réplica, Notas, Evolución, Chat y Usuario. Pantalla oscurecida con el elemento recortado, una línea de texto, "Saltar todo", "1 de 5" y "Siguiente". `Escape` lo cierra. Se repiten desde Usuario → "Ver los tutoriales otra vez".

## Sonidos

La misma familia que la app, en `public/sounds/`. **Apagados por defecto** en la web; se activan en Usuario → Apariencia o con el botón de la bienvenida. No se descargan hasta que se activan (pesan 1,2 MB). Suenan y callan en los mismos momentos que en la app (`DESIGN.md` §8).

## Navegadores

- Prioridad de pruebas (público mayormente con Android): Chrome Android, Chrome de escritorio, Safari iOS, Safari de escritorio y Firefox.
- Dictado: solo Chrome y Edge. Sin soporte, no se muestra el micrófono.
- Web Push y passkeys necesitan HTTPS; Safari en iOS solo tiene notificaciones si la web está instalada como PWA.

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
  services/              servicios reemplazables, hoy simulados (auth, ai)
frontend/scripts/marca.mjs   copia del kit de marca de la app lo que usa la web (npm run marca)
```

Cuando llegue el backend se suman `lib/supabase/` y `lib/offline/`.

## Fuera de la v1

Lo mismo que la app (chat con la IA, pantalla de crisis, exportar notas, pagos, planes, videollamadas propias) y, solo en la web: el bloqueo del diario y compartir una nota suelta en el chat.
