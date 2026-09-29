# Estructura — Web

> Adaptado de la estructura de la app móvil. Cada decisión de producto (qué hace cada pantalla, qué reglas aplican) se mantiene idéntica; lo que cambia es la tecnología usada para lograrlo. Donde la app usa un módulo nativo sin equivalente directo en el navegador, se explica la alternativa y su limitación.

## Con qué se arma

| Parte | Tecnología (app, referencia) | Equivalente web |
|---|---|---|
| Framework | Expo Router | React + React Router |
| Estilos | NativeWind (Tailwind) | Tailwind CSS directo, con los tokens de color de `DESIGN.md` (sección 3.3, ya en variables CSS) |
| Componentes base | React Native Reusables | shadcn/ui (misma filosofía: código propio en `components/ui`, no una librería cerrada) |
| Animación | Reanimated + Gesture Handler | CSS transitions/keyframes + Framer Motion para lo que lo necesite (respetando los tokens de `theme/motion.ts` como referencia de duraciones) |
| Efectos y gráficas (aura, hilos, tela) | Skia + react-native-svg | SVG nativo del navegador + Canvas API para el aura que respira; sin librería adicional necesaria |
| Iconos | lucide-react-native | lucide-react |
| Sensación "nativa" (blur, bottom sheet) | expo-blur, @gorhom/bottom-sheet | `backdrop-filter: blur()` (CSS) y un componente de drawer/hoja inferior propio o `vaul` |
| Listas | FlatList / FlashList | Renderizado normal; virtualizar solo si una lista real supera cientos de elementos (`@tanstack/react-virtual`) |
| Base de datos y usuarios | Supabase | **Mismo proyecto de Supabase**, misma base de datos y mismas reglas de acceso — ver `03-base-de-datos.md` |
| Chat en tiempo real | Supabase Realtime | Igual, vía el cliente JS de Supabase |
| Archivos | Supabase Storage | Igual |
| Lógica del servidor | Supabase Edge Functions | Igual — las mismas funciones (`generate-reply`, `generate-day-reply`) las consume tanto la app como la web |
| Diario sin conexión | expo-sqlite + sync | IndexedDB (vía Dexie.js) + Service Worker, sincroniza al volver la conexión. Prioridad menor que en la app (la web se usa más con conexión estable), pero no se descarta para v1 si el tiempo alcanza |
| Dictado por voz | expo-speech-recognition | **Web Speech API** (`SpeechRecognition`) — soportada en Chrome/Edge; **no disponible en Safari/iOS**. Debe degradar a "sin dictado, solo texto" sin romper la pantalla cuando el navegador no lo soporte |
| Bloqueo de la app | expo-local-authentication (Face ID/huella) | **WebAuthn (Passkeys)** donde el dispositivo lo soporte; si no, un PIN simple guardado solo en el cliente. Es una paridad más débil que en la app — comunícalo con honestidad en el copy, nunca prometas "biometría" si en ese navegador cae a PIN |
| Notificaciones | expo-notifications | **Web Push API**, requiere HTTPS, permiso explícito del usuario y Service Worker registrado |
| Sesiones por video | Links de Google Meet | Igual, sin cambios |

## Autenticación (reemplaza por completo lo construido hasta ahora)

**Importante:** el flujo de Login/Registro con email + contraseña construido antes de este documento queda descartado. El flujo real, definido por el equipo de app, es:

1. **Bienvenida** — páginas cortas de introducción (equivalente web de las 3 páginas tejidas), con "Crear mi cuenta" y "Ya tengo cuenta" visibles en todas.
2. **Entrar/Crear cuenta** — mismo camino para ambos casos, sin contraseña:
   - Apple (si el navegador/dispositivo lo soporta vía Sign in with Apple for Web),
   - Google (OAuth),
   - Correo con código de 6 dígitos (Supabase Auth OTP por email). El código se verifica automáticamente al completar el sexto dígito; reenvío disponible a los 60 segundos.
3. **Consentimiento** — qué hace Replica con lo escrito, y tres casillas: 18+, términos y privacidad, y que una IA lee las notas para responder. Se vuelve a pedir si cambia `TERMS_VERSION`.
4. **Configuración** — nombre (obligatorio; Google/Apple lo traen prellenado), qué te trae a Replica, tono de la réplica, recordatorio, y bloqueo (WebAuthn/PIN) si el navegador lo soporta.
5. **Listo** — anima la marca y lleva a la primera nota.

Quien ya tiene cuenta configurada entra directo a la app. Hasta que Supabase Auth esté conectado, todo se simula igual que en la app: cualquier código de 6 dígitos entra, `000000` simula uno incorrecto.

## Diseño

**Ver `DESIGN.md` — es la fuente de verdad completa y no se duplica aquí.** Ese documento ya está escrito explícitamente para quien construye la web (incluida una IA como el agente de Antigravity). Antes de escribir un solo componente nuevo, léelo entero: dirección visual "Telar", los 20 tokens de color con sus dos temas, tipografía (Alegreya / Alegreya Sans), las 7 reglas de movimiento y el vocabulario obligatorio.

Los mockups de referencia visual de la app viven en `design-reference/` (nombre provisional "Serena") — se sigue su composición y jerarquía, no se copian funciones fuera de alcance.

## Navegación — 5 secciones

La app usa 5 pestañas nativas; en web, la forma natural de representarlas depende del ancho de pantalla:

- **Desktop/tablet ancho:** barra lateral o superior fija con las 5 secciones.
- **Mobile web:** barra inferior fija, visualmente equivalente a la tab bar de la app (mismo hilo indicador de pestaña activa que describe `DESIGN.md`).

Rutas sugeridas (React Router):

| Sección | Ruta | Pantalla nativa equivalente |
|---|---|---|
| Inicio | `/` | Inicio |
| Notas | `/notas`, `/notas/:day` | Notas, "Tu día" |
| Evolución | `/evolucion` | Evolución |
| Chat | `/chat` | Chat |
| Usuario | `/usuario` | Usuario |

## Pantallas (mismas reglas de producto que la app, ver `DESIGN.md` sección 10 y 11 para el detalle completo)

### 1. Inicio
Fecha y racha; saludo con acceso al cofre; ánimo y tema como pastillas obligatorias antes de pedir la réplica (con las mismas preguntas amables de Replica si faltan, nunca error); la hoja de escribir con dictado (si el navegador lo soporta) y botón Replica; al guardar, la nota se pliega y la réplica se escribe progresivamente (streaming); dos frases del cofre del día; notas recientes.

### 2. Notas
Lista agrupada por día, con la réplica del día como entrada propia arriba de las notas de ese día; búsqueda (sin tildes); filtros por ánimo y tema; favoritas. Detalle de nota con réplica, entrada plegable y comentario de la réplica del día si aplica. "Tu día" como vista propia.

### 3. Evolución
Curva de ánimo por semana/mes/año; temas y patrones calculados; cofre de aprendizajes completo; palabras y notas del mes; la "tela" de constancia (mismo concepto visual que en la app, adaptado a SVG/CSS en vez de Skia).

### 4. Chat
Un psicólogo a la vez; conversación en tiempo real vía Supabase Realtime; franja de próxima sesión con "Unirse por Meet"; compartir/retirar el diario con consentimiento explícito. Sin psicólogo asignado, muestra el directorio.

### 5. Usuario
Ficha con foto, nombre, frase propia y antigüedad; métricas de 30 días (todas calculables); ajustes en tarjetas plegables (Tu réplica, Tu espacio privado, Apariencia); apartado de registro profesional para psicólogos; cerrar sesión / eliminar cuenta.

## Recorridos (tutoriales)

Primera vez que se entra a cada pantalla, un recorrido corto explica lo esencial en una línea, con "Siguiente" y "Saltar todo". Equivalente web: una librería ligera de spotlight/tour (ej. `driver.js` o una implementación propia con un overlay + `position: fixed`), repetible desde Usuario → "Ver los tutoriales otra vez".

## Sonidos

Misma familia sonora generada por el equipo de app (`assets/sounds/`), reproducida con `<audio>` nativo del navegador. En web, **deben estar apagados por defecto** o con un interruptor visible antes de sonar — los navegadores además bloquean autoplay de audio sin interacción previa del usuario, así que el primer sonido debe dispararse solo tras una acción explícita (tocar Replica, enviar un mensaje).

## Consideraciones específicas de navegador (equivalente a la sección "Android" de la app)

- **Dictado por voz:** solo Chrome/Edge (Web Speech API). Detectar soporte y ocultar el botón de dictado con gracia si no está disponible, no mostrar un botón roto.
- **WebAuthn/Passkeys:** requiere HTTPS y soporte del dispositivo. Si falla, cae a PIN local — nunca a "sin bloqueo" silencioso.
- **Notificaciones push:** requieren HTTPS, Service Worker y permiso explícito; Safari en iOS solo las soporta si la web está instalada como PWA en pantalla de inicio — comunicarlo si es relevante para el público objetivo.
- **Offline:** IndexedDB + Service Worker para guardar notas sin conexión; sincronizar al reconectar, igual que expo-sqlite en la app.
- **Pruebas cruzadas obligatorias antes de cada entrega:** Chrome de escritorio, Safari de escritorio, Chrome Android, Safari iOS — en ese orden de prioridad según el público de Venezuela (mayoría Android).

## Estructura de carpetas (adaptada al patrón ya usado en `frontend/src/`)

```
frontend/src/
  pages/                 rutas (una por pantalla)
  components/
    ui/                  componentes base (shadcn/ui reestilizados con los tokens de DESIGN.md)
    motion/              primitivas de movimiento propias (equivalente a las de la app)
  features/              journal (diario/Inicio), notes, care (chat/psicólogos/sesiones), profile
  hooks/                 hooks compartidos (use-theme, etc.)
  lib/                   utilidades (sounds, session, keyboard)
  services/              servicios reemplazables — hoy con datos simulados (ai/, auth/)
  theme/                 colors.ts, fonts.ts, motion.ts — deben coincidir 1:1 con los tokens de DESIGN.md
  design-reference/      mockups de referencia de la app (solo consulta, no se implementan directo)
```

Cuando llegue el backend real se suman `lib/supabase/` y `lib/offline/`.

## Fuera de la v1

Igual que la app: sin chat con la IA, sin pantalla de ayuda en crisis dedicada (más allá de la derivación dentro de la réplica), sin exportar notas.
