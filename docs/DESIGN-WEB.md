# Replica web — Diseño de las interfaces

> **Cómo se usa este archivo.** `DESIGN.md` manda en las reglas de producto, la voz, los colores, la tipografía, la marca y los sonidos. Este archivo es **el diseño de las interfaces de la web**: cómo se organiza cada pantalla, la navegación, los anchos, el ratón y el teclado, y cómo se aplica la marca en el navegador. Si algo no está aquí, se parte de lo que dice `DESIGN.md`.
>
> La app móvil se descontinuó el 31 de octubre de 2026. Las menciones a ella describen de dónde salió cada decisión, y esas decisiones siguen vigentes.

---

## 1. Principio

Replica se diseña para el navegador, en el teléfono y en la computadora. Cada interfaz nueva se anota aquí antes de construirla, con la voz, los colores y la marca de siempre.

## 2. Anchos y estructura

| Ancho | Navegación | Contenido |
|---|---|---|
| Menos de 768 px | Barra inferior flotante, igual que la app (`DESIGN.md` §6) | Una columna, como la app |
| 768–1023 px | Barra lateral fija de 240 px | Una columna de lectura centrada (640–720 px) |
| 1024 px o más | Barra lateral fija de 240 px | Columna principal alineada al mismo borde izquierdo (`lg:mx-0`) + panel derecho donde la pantalla lo define (sección 4) |

- Los renglones del fondo (`warp`) ocupan todo el ancho de la ventana.
- Desde 1024 px, todas las pantallas con sesión iniciada empiezan en el mismo borde izquierdo (`lg:mx-0`, columna de 680 px cuando no es de dos columnas) para que el contenido no salte al cambiar de sección. Por debajo de 1024 px la columna va centrada (`mx-auto`).
- Probar siempre en anchos exactos: 375, 767, 768, 1023, 1024 y 1440.
- **Áreas táctiles de 44 px.** Lo que se dibuja más chico (pastillas, filtros, segmentados, `Button` `sm`, enlaces del pie) se toca en 44 × 44 con la utilidad `tap-area` (`index.css`): un `::after` invisible centrado, sin mover el diseño. La pieza necesita `relative` o `absolute` y no recortar con `overflow`. Dos excepciones de WCAG 2.5.8: los enlaces de la fuente en `/ayuda`, que van dentro de una frase, y la tela de Evolución, con celdas de 18 px a 24 px entre centros, porque 12 semanas no caben a 44 px en un teléfono. La curva de ánimo se recorre tocando cualquier punto del gráfico.
- La pantalla de bienvenida usa su propio corte a 1100 px (ilustración a un lado del texto).

## 3. Navegación en escritorio

- **Barra lateral:** las mismas cinco secciones, con el mismo ícono y nombre que la app. La activa se marca con **el hilo salvia de 2,5 px**, vertical, a la izquierda del ícono.
- Arriba, el logotipo de Replica (sección 9), nunca un emoji.
- **El anillado:** la barra lateral es el lomo del cuaderno y el contenido, la hoja. En el borde entre las dos van los anillos del ícono de la marca (la misma curva y el mismo agujero, de la geometría del kit), uno cada dos renglones, con el agujero entre dos líneas. Van pegados a la hoja, no a la barra: se mueven con los renglones al hacer scroll y siempre quedan alineados. Anillos en `subtle` y agujeros en `border`, en claro y en oscuro. Decorativos (`aria-hidden`, sin foco ni toques), sin animación y por debajo de ventanas y recorridos. Entran 17 px en la hoja: el contenido empieza al menos 24 px después del borde. Solo desde 768 px (`components/layout/SpiralBinding.tsx`). Aprobado con la app el 16 de octubre.
- Abajo, el selector de tema (claro, oscuro, sistema) como atajo; es el mismo ajuste de Usuario → Apariencia y tiene que estar siempre sincronizado con él.
- El enlace al Playground solo aparece en desarrollo (`import.meta.env.DEV`).
- `aria-current="page"` en la sección activa.

## 4. Cada pantalla en escritorio

### Registro
- Bienvenida: a partir de 1100 px, la planta a un lado y el texto al otro; "Crear mi cuenta" y "Ya tengo cuenta" visibles en las tres páginas.
- Cuenta y configuración: **un paso por pantalla**, igual que la app (entrar → correo → contraseña → código; consentimiento; nombre → qué te trae → tono → réplica del día → listo), cada uno en una tarjeta centrada de 440–480 px con la acción principal abajo y el hilo de progreso arriba. En escritorio, `Enter` avanza.
- Sin paso de bloqueo (ver sección 6).

### Inicio
- Columna principal: fecha y racha (la planta), saludo con el cofre a la derecha, la línea de la réplica del día bajo el saludo, las pastillas y la hoja. Después de guardar: la nota tejida, la frase destilada y la tarjeta de cierre.
- **Escribir sobre los renglones:** dentro de la hoja (`WriterSheet`), el texto usa Alegreya Sans a 17 px con interlineado exacto de 24 px (`leading-[24px]`) y renglones finos cada 24 px (`color-mix` con `--voice` al 18 %, `background-attachment: local`) que se desplazan con el texto al escribir y al hacer scroll.
- **Panel derecho (1024 px o más):** solo las **dos frases del día**, sin título. Es lo mismo que la app pone debajo de la hoja; en escritorio va al lado.
- **No hay** notas recientes ni tarjetas que repitan el estado de la réplica del día: nada compite con la hoja (decisión de la app).
- En la hoja, `Ctrl/⌘ + Enter` equivale a tocar "Replica" o "Guardar".

### Notas
- Columna principal: título, búsqueda, "Todas / Favoritas" y "Filtrar", y la lista por día con la réplica de cada día arriba de sus notas. El encabezado de cada día (`h2` en mayúsculas) queda fijo arriba al bajar (`sticky top-0 bg-background`).
- **Panel derecho (1024 px o más):** "Últimos 30 días" con notas y palabras (datos reales, sin insignias), el botón "Escribir" y debajo un **calendario mensual tejido** (`MonthCalendar`, en hora local con `dayKey`) donde cada día con notas se rellena con la escala de la tela (`cloth-1` a `cloth-3`; los días sin notas quedan como celda vacía con borde y sin interacción). Los días con notas son botones que desplazan al grupo de ese día en la lista (a la vista solo muestran el número del día; el `aria-label` indica fecha y cantidad de notas). Cada celda ocupa su columna y 44 px de alto para tocar, con el día dibujado en un cuadro de 32 px; el número va en `foreground` sobre `cloth-1`, en `background` sobre `cloth-2` y en `voice-foreground` sobre `cloth-3`, siempre por encima de 4,5:1 en claro y en oscuro.
- **El detalle de una nota y "Tu día" son páginas con su ruta**, no ventanas: `/notas/:id` y `/replica-dia/:dia`. Funcionan el botón atrás y los enlaces directos. En escritorio usan la columna de lectura alineada a la izquierda (`lg:mx-0`).
- **"Tu día" sin réplica todavía (`/replica-dia/:dia`):** cuando todavía no hay réplica del día, arriba explica cuándo llega (hoy, con dos o más notas: "Tu réplica del día llega a las 22:00", la misma línea que bajo el saludo; o por qué no hubo réplica del día si solo hubo una nota o notas privadas) y debajo muestra igualmente todas las notas de ese día con `NoteCard`.

### Evolución
- 1024 px o más: a la izquierda "Cómo te sentiste" (curva y barras) y "Tu tela"; a la derecha "Temas y patrones" y "Tu escritura en números". Sin cofre (vive en Usuario y junto al saludo de Inicio).
- La curva se recorre con el cursor, con el dedo y con las flechas del teclado, mostrando el detalle solo en la línea de estado superior (sin globo flotante sobre la curva) y sin ningún texto por debajo de 12 px. Las barras de ánimo (`MoodBars`) escalan cada barra como su fracción del total de días con ánimo (`min-w-[8px]`), con `"1 día"` o `"N días"` sin porcentaje y el mismo estado vacío de la app.

### Chat
- **1024 px o más:** a la izquierda (320 px) la ficha del psicólogo y el estado del diario compartido; a la derecha la conversación, a la altura de la ventana, sin repetir la cabecera con el nombre del psicólogo ni el estado del diario (`lg:hidden`, conservando nombre accesible `Conversación con {nombre}`) y manteniendo el aviso "Próxima sesión" fijo fuera del scroll.
- **Menos de 1024 px:** la conversación ocupa toda la columna, con su cabecera (volver, el psicólogo y el diario compartido); la ficha se abre desde la cabecera (`/psicologo/:id`). En el teléfono (menos de 768 px) va a pantalla completa y sin barra inferior, como en la app; entre 768 y 1023 px la barra lateral sigue a la vista.
- Sin psicólogo: el estado vacío de la app ("Aquí hablarás con tu psicólogo") y el directorio (`/chat/directorio`), con filtro por especialidad.

### Usuario
- 1024 px o más: a la izquierda (360 px) la ficha y "Tu cuenta"; a la derecha las cuatro métricas en cuadrícula de **dos por fila en todos los anchos** (`grid-cols-2`, sin truncar etiquetas ni subtítulos), "Tus favoritas" con el cofre, las tarjetas de ajustes y el resto de filas ("Soy psicólogo o psicóloga", "Ver los tutoriales otra vez", Términos y Privacidad).
- Sin título grande: la ficha encabeza la pantalla, como en la app.

## 5. Hojas y ventanas

Lo que en la app es una **hoja** (compartir el diario, compartir una frase, editar el perfil, confirmaciones) en la web es:

- **Menos de 768 px:** una hoja que sube desde abajo.
- **768 px o más:** una ventana centrada.

Las dos se montan **fuera del contenido de la página** (portal en `document.body`), con fondo `background` al 80 % y desenfoque, `role="dialog"`, `aria-modal`, título enlazado con `aria-labelledby`, cierre con `Escape`, foco atrapado dentro y devuelto al botón que la abrió, y la página de atrás sin scroll. Nunca `window.confirm` ni `alert`: las confirmaciones usan esta misma pieza, con el botón destructivo en `destructive` solo cuando se borra algo.

El recorrido (`TourHost`) sigue la misma regla: va en un portal, deja la página inerte mientras está abierto y, al cerrarse, devuelve el foco a donde estaba.

### Cuando el servidor no responde

Con la cuenta real, la web trae todo antes de mostrar nada: mientras tanto, solo el fondo. Si no lo consigue, una pantalla con "No pudimos traer tu diario. Revisa tu conexión e inténtalo otra vez." y "Intentar de nuevo". Un mensaje que no salió vuelve al campo, con su aviso encima. Eliminar la cuenta sin conexión deja su aviso en la tarjeta. Los tres en `emotion`, porque son fallos reales.

## 6. Lo nativo, traducido al navegador

| En la app | En la web |
|---|---|
| Hápticos | No existen; nada los reemplaza. |
| Sonidos | La misma familia (`public/sounds/`), con la firma del cierre del registro. **Apagados por defecto**; se activan en Usuario → Apariencia o en la bienvenida. No se descargan hasta que se activan. |
| Splash animado | No hay: en el navegador retrasaría el contenido. Mientras carga la app, `index.html` muestra el ícono quieto (sección 9). |
| Dictado (`expo-speech-recognition`) | Web Speech API (Chrome y Edge). Si el navegador no lo tiene, el micrófono no aparece. Los resultados parciales se muestran sin sumarse al texto hasta que son finales, como en la app. |
| Bloqueo con Face ID o huella | Un PIN de este navegador y, donde el dispositivo la tenga, su llave de acceso (WebAuthn). Se activa en Usuario, no en la configuración inicial (sección 11, "Bloqueo del diario"). |
| Recordatorio diario (`expo-notifications`) | Web Push (HTTPS, Service Worker y permiso). Si el navegador no lo tiene o falta la clave pública del servidor, el ajuste no se ofrece (sección 11, "Recordatorio diario"). |
| Compartir frase como imagen | La misma imagen 9:16 (1080 × 1920) con sus cuatro fondos, dibujada en un `canvas`. Se comparte con la Web Share API cuando el navegador acepta archivos; si no, se descarga. |
| Elegir foto de perfil (galería o cámara) | `<input type="file" accept="image/*">`, recortada en cuadrado. |
| Botón atrás de Android | El atrás del navegador: por eso el detalle, "Tu día" y los pasos del registro son rutas. `Escape` cierra ventanas, la búsqueda y los recorridos. |
| Cambio de tema con foto de la pantalla | Un fundido corto de los colores (180–360 ms) o, donde exista, `document.startViewTransition`. Sin parpadeo. |
| Teclado del teléfono | En escritorio no hay barra pegada al teclado: la barra de la hoja queda dentro de la hoja. |

## 7. Implementación de los tokens

- Los colores viven como variables CSS en `src/index.css`, con los valores exactos de `DESIGN.md` §3.3 (más la escala de la tela de §3.2).
- Tailwind tiene que poder aplicar opacidad a esos tokens (`border-border/40`, `bg-reply-soft/25`…). Con `var(--x)` sin más, **Tailwind 3 no genera esas clases**. Cada color del config se define de forma que acepte opacidad (por ejemplo con `color-mix(in srgb, var(--x) <alpha>, transparent)`), y se comprueba en el CSS generado.
- El modo "Sistema" aplica el bloque oscuro con `prefers-color-scheme` cuando no hay tema elegido. Las variantes `dark:` de Tailwind deben funcionar también en ese caso.
- `prefers-reduced-motion` se respeta en **todas** las animaciones: queda solo la opacidad.

## 8. Fuera del proyecto

Pagos, planes y videollamadas propias. Todo lo demás de la especificación se construye (`04-plan.md`), también lo que antes estaba fuera: chat con la IA, ayuda en crisis, exportar notas, bloqueo del diario, compartir una nota suelta en el chat y recordatorio diario. Sus interfaces se anotan en esta guía antes de construirlas, en la sección 11.

## 9. La marca en el navegador

El manual y el kit son los de la app (`docs/marca` en su repositorio); `DESIGN.md` resume la marca. Aquí, cómo se aplica en la web.

**Piezas.** Las cinco del manual salen de una sola geometría (`src/components/brand/logoGeometry.ts`, generada por el kit). Se pintan con los tokens, igual que en la app: hoja `surface-raised`, borde y agujeros `border`, anillos `subtle`, cinta `voice`, flor `reply` y `reply-soft`, palabra `foreground`. Así el logo sigue el tema elegido, también cuando se fuerza claro u oscuro. Tamaños mínimos del manual: firma 120 px de ancho, logotipo 72 px, ícono 32 px, flor 16 px.

| Lugar | Pieza | Notas |
|---|---|---|
| Pestaña | Flor (`favicon.svg`, sigue el tema del sistema), con `favicon.ico` y `apple-touch-icon.png` | El título cambia por sección: "Replica · Tu diario" en Inicio y "Notas · Replica", "Evolución · Replica"… en el resto. |
| Mientras carga | Ícono quieto, centrado, sobre el fondo del tema, dentro de `index.html` | Reemplaza al splash. Aparece antes que el JavaScript y se va cuando React dibuja. |
| Bienvenida | Firma horizontal con «Ola», una sola vez al cargar | El manual la propone para la cabecera de la web. |
| Pasos del registro | Ícono a 36 px | |
| Barra lateral | Logotipo quieto, 112 px de ancho, y el anillado en el borde | Con el anillado, el ícono de la firma repetía los anillos al lado: el cuaderno lo cuentan los anillos y arriba queda el nombre con su flor (sección 3). |
| Dentro de la app, en el teléfono | Sin marca en la cabecera | El contenido manda. |
| "Todo listo" | Firma vertical «Se escribe y florece» | Igual que la app. La firma suena solo si los sonidos están activados (en la web empiezan apagados). |
| Imagen para compartir | Solo el logotipo, en la versión de cada fondo | `DESIGN.md`, "Imagen para compartir". |

**Movimiento.** Las animaciones usan las líneas de tiempo del kit (`linea-de-tiempo.json`) con el mismo evaluador de cuadros clave que la app, así se mueven igual. Con "reducir movimiento" la marca aparece completa, sin armarse. Nunca se repiten en bucle ni se animan al cambiar de sección.

**Fuentes.** Alegreya y Alegreya Sans van alojadas en la propia web (licencia OFL), no en Google Fonts: así nadie más sabe quién abre su diario y en 3G hay dos conexiones menos. El logo va a curvas y no depende de la fuente.

**Al publicar (Fase 18).** En `index.html`: la descripción ("Escribe lo que viviste hoy y recibe una réplica. Un diario personal, con psicólogos verificados cuando los necesites."), `theme-color` con el fondo de cada tema (`#F5FBF6` y `#131315`), las etiquetas Open Graph con `og-claro-1200x630.png` y `manifest.webmanifest` con `icon-192`, `icon-512` e `icon-maskable-512`. La imagen necesita la dirección completa: `vite.config.ts` la arma al construir en Vercel con `VERCEL_PROJECT_PRODUCTION_URL`. El script que aplica el tema guardado pasó de `index.html` a `public/tema.js`, para que la CSP no permita scripts en línea.

## 10. Área profesional y de administración

Bocetada para la Evaluación 4 de Interfaces Web (22 de octubre de 2026). Las láminas están en `entrega-evaluacion-4/salida/`. Se construye en las Fases 13 y 16 (`04-plan.md`). La voz, los colores y las reglas de producto siguen siendo las de siempre.

### Decisiones aprobadas

- **El acompañamiento empieza con una solicitud.** La persona pide acompañamiento desde el perfil del psicólogo (`/psicologo/:id`), con un mensaje opcional. El chat se abre cuando el psicólogo acepta. Mientras tanto, Chat muestra "Esperando respuesta de {nombre}" y la persona puede retirar la solicitud. Sigue habiendo un solo psicólogo a la vez, también contando las solicitudes. Este cambio toca el Chat de la persona (§4), así que se implementa junto con el panel.
- **El psicólogo puede dejar de atender a un paciente.** Lo hace con una confirmación en `destructive`. Termina el proceso y el permiso del diario, igual que cuando lo termina la persona, que ve el evento en la conversación.
- **El visor muestra solo las notas no privadas de la persona.** No muestra réplicas, réplica del día, comentarios ni frases del cofre: al psicólogo le importa lo que la persona escribió. Por eso el malva no aparece en el área profesional.
- **Ayuda en crisis:** se construye en la Fase 15 (sección 11). Mientras tanto, el layout profesional deja su lugar reservado.

### Roles y entrada

- Rol: `user`, `psychologist` o `admin` (`03-base-de-datos.md`). El psicólogo y el administrador también son personas con su propio diario.
- Al psicólogo verificado se le suma "Panel profesional" en Usuario y en la navegación. Al administrador se le suma "Solicitudes". Una ruta de un rol que no corresponde lleva a `/`.
- En la barra inferior esa entrada es un sexto ítem, después de Usuario, con el nombre corto ("Panel" o "Solicitudes"). Una cuenta `user` sigue con cinco.
- El área profesional tiene su propia navegación: **Panel**, **Mensajes** y **Mi diario** (vuelve a `/`). La del administrador tiene **Solicitudes** y **Mi diario**. Bajo el logotipo, un rótulo dice en qué área estás ("Área profesional" o "Administración").

### Rutas

| Ruta | Quién | Qué |
|---|---|---|
| `/usuario/psicologo` | Cualquier persona | Solicitud de verificación y su estado |
| `/profesional/admin` | Administrador | Solicitudes, con filtros. `?solicitud=:id` abre el expediente (enlace directo y atrás del navegador) |
| `/profesional/dashboard` | Psicólogo verificado | Resumen, solicitudes de acompañamiento, autorizaciones, pacientes y agenda |
| `/profesional/pacientes/:id` | Psicólogo con ese paciente | Diario consentido y notas clínicas |
| `/profesional/mensajes` | Psicólogo verificado | Conversaciones con sus pacientes. **Sin lámina:** se diseña aquí antes de construirla, en la Fase 16 |

### Anchos

| Ancho | Navegación | Contenido |
|---|---|---|
| Menos de 768 px | Barra inferior (como §2). Arriba, el `h1` de la pantalla y, en la misma fila a la derecha, el botón **Ayuda en crisis** (`LifeBuoy` y texto, 44 px). No hay una barra aparte que repita el título; la fila ya mide 44 px, así que el botón entra en la Fase 15 sin mover nada | Una columna. Las tablas pasan a tarjetas apiladas. El expediente y las notas clínicas se abren en una hoja a pantalla completa |
| 768–1023 px | Barra lateral de 240 px, con Ayuda en crisis al pie | Dos columnas: tarjetas en cuadrícula de dos, o contenido y módulo. El expediente y las notas clínicas se abren en un panel lateral superpuesto (modal, con el foco atrapado) |
| 1024 px o más | Barra lateral de 240 px | Contenido principal y un panel contextual fijo a la derecha (360–440 px, `aside` con `aria-labelledby`, no modal). Con poco sitio, las tablas ocultan las columnas secundarias (que siguen en el expediente) o pasan a tarjetas: lo deciden por su propio ancho (`DataTable`) |

Los tamaños van en `rem` y `%`, sin anchos fijos en px fuera de la barra lateral y del panel. Nunca hay desplazamiento horizontal: los textos largos se cortan con `break-words`.

### Piezas nuevas

- **`DataTable`.** Desde 1024 px es una `<table>` semántica con `<caption>`, `<th scope="col">` y `aria-sort` en la columna de fecha. Por debajo es una lista (`<ul>`) de tarjetas con la acción principal a 44 px. Se dibuja **una sola** de las dos según el ancho (`matchMedia`), para que el lector de pantalla no lea los datos dos veces.
- **`Skeleton`.** Tiene la forma de las filas o tarjetas que vienen. La región lleva `aria-busy="true"` y un `role="status"` oculto que dice "Cargando…". Con "reducir movimiento" queda quieto, sin brillo.
- **`EmptyState`.** Un ícono de Lucide, una frase con la voz de Replica y una acción cuando la hay.
- **`FileDropzone`.** Para arrastrar o elegir archivos: es un `<label>` de un `<input type="file" accept="application/pdf" multiple>`, así funciona con teclado y al tocar. Por cada archivo muestra el nombre, el peso ("2,4 MB") y una barra `role="progressbar"` con `aria-valuenow`. Acepta hasta 3 PDF de 10 MB como máximo cada uno. Los errores van junto al archivo en `emotion` con `role="alert"`, y "Quitar" lleva un `aria-label` con el nombre del archivo.
- **`PdfPreview`.** Desde 768 px muestra la primera página dentro de la página (`<object>`) y deja "Abrir en otra pestaña". En el teléfono no hay vista previa, porque Chrome Android y Safari iOS no la muestran: va una tarjeta con "Abrir el documento".
- **`StatusPill`.** Un `<span>` con la forma de `Pill`: `Pill` es un botón, y un estado no se toca. Cada estado se reconoce por el ícono y el texto, nunca solo por el color:
  - Pendiente: `Hourglass`, neutro.
  - Por corregir: `FilePen`, `emotion`.
  - Aprobada: `BadgeCheck`, `voice`.
  - Rechazada: `CircleX`, `destructive` sobre fondo neutro.
- **`DateRangeFilter`.** Dos `<input type="date">` con su `label` ("Desde", "Hasta") y atajos (7 días, 30 días, todo).
- **`CrisisButton`.** Siempre visible en toda pantalla con sesión, no solo en el área profesional (sección 11). Lleva a `/ayuda`, con las líneas de atención del país; el sistema no inventa números.
- Se reutilizan:
  - `Dialog`, para las confirmaciones y el panel lateral, como variante;
  - `Segmented`, `Button`, `Card` y `NoteCard`;
  - los filtros de Notas;
  - `BadgeCheck` en `voice` para el distintivo de verificado.

### Cada pantalla

- **Solicitud de verificación (`/usuario/psicologo`).**
  - Campos:
    - nombre completo;
    - cédula profesional o número de colegiatura;
    - universidad;
    - especialidades (casillas en un `fieldset`, al menos una);
    - sobre ti (hasta 280 caracteres, con el conteo como dato).
  - Documentos: título y constancia de colegiatura, en `FileDropzone`.
  - Dos casillas de aceptación: la ética profesional y la confidencialidad de lo que compartan los pacientes. Se guardan con su fecha y su versión.
  - El botón no se desactiva: al enviar, cada campo que falta lo dice junto a él.
  - El enlace de Meet ya no se pide aquí: se configura en el panel, después de la aprobación.
  - Estados: sin solicitar, en revisión, por corregir (con el motivo y solo los documentos que hay que reemplazar), rechazada (con el motivo y "Enviar otra solicitud") y verificada ("Ir a mi panel profesional").
  - Desde 1024 px, el panel contextual explica cómo es la verificación y quién ve los documentos.
- **Panel de administración (`/profesional/admin`).**
  - Filtros: estado (`Segmented`: Pendientes, Por corregir, Aprobadas, Rechazadas, Todas; sin contadores), fechas (`DateRangeFilter`) y búsqueda por nombre o cédula. En el teléfono, todos van en "Filtrar".
  - El expediente muestra los datos, la aceptación firmada, los documentos (`PdfPreview`) y el historial de la revisión.
  - Acciones:
    - "Aprobar perfil" (`voice`), con una confirmación que dice que el perfil aparecerá en el directorio.
    - "Solicitar subsanación", que pide qué corregir y un mensaje.
    - "Rechazar", en `destructive`, con un motivo obligatorio y una confirmación.
  - Cada acción queda en `verification_reviews` y se anuncia con `role="status"`.
- **Panel del psicólogo (`/profesional/dashboard`).**
  - Arriba, un resumen con los números como dato: pacientes activos, solicitudes nuevas, diarios compartidos y próxima sesión.
  - Solicitudes de acompañamiento: "Aceptar" o "Ahora no". "Ahora no" no es destructivo, y a la persona se le dice con calma.
  - Bandeja de autorizaciones: cuándo alguien empezó o dejó de compartir su diario.
  - Pacientes vinculados (`DataTable`).
  - Agenda: el enlace fijo de Meet (se valida, y se puede copiar y probar), la disponibilidad semanal, la duración de la sesión, las próximas sesiones y "Agendar una sesión".
  - Ayuda en crisis, siempre a la vista.
- **Visor del diario consentido (`/profesional/pacientes/:id`).**
  - Arriba, el aviso de confidencialidad: desde cuándo comparte la persona, que las notas privadas no aparecen y que puede dejar de compartir cuando quiera.
  - Las notas, por día y con los encabezados fijos al bajar, con filtros por ánimo (solo los que existen) y por fechas.
  - Notas clínicas privadas del profesional: la persona nunca las ve, y se quedan con el psicólogo aunque el permiso termine.
  - Si el permiso se retiró, las notas dejan de verse y un aviso dice desde cuándo.
  - "Dejar de atender" va en "Más acciones", con confirmación en `destructive`.

### Fase 16: lo que se decidió al construir

Completa lo anterior. La voz, los tokens y las piezas son los de siempre; en el área profesional no hay malva.

**Solicitud de verificación (`/usuario/psicologo`).**
- Además de los campos de arriba, pide cómo te presentas ("Psicóloga clínica"), los años de experiencia y el enfoque (opcional): el directorio los muestra, y sin ellos el perfil aprobado saldría a medias.
- Documentos: de 1 a 3 PDF en un solo `FileDropzone` ("Tu título y tu constancia de colegiatura"). Cada archivo sube al elegirlo, con su barra; "Quitar" lo borra si todavía no se envió.
- Cada estado empieza con su `StatusPill` y una frase:
  - **En revisión:** "Recibimos tu solicitud el {fecha}. Te avisamos aquí cuando la revisemos." Debajo, los datos enviados y los documentos con "Abrir".
  - **Por corregir:** "Hay algo que corregir antes de aprobar tu perfil." El motivo del administrador va en una tarjeta `surface`; el formulario vuelve con los datos de antes y solo los documentos marcados aparecen como "Por reemplazar", con su `FileDropzone`. "Enviar de nuevo".
  - **Rechazada:** el motivo y "Enviar otra solicitud", que abre el formulario con los datos de antes y sin documentos.
  - **Verificada:** "Tu perfil está en el directorio." y "Ir a mi panel profesional". Los datos quedan a la vista, sin editarse: un perfil aprobado ya no cambia su nombre, su cédula ni su universidad.
- Desde 1024 px, a la derecha (320 px): "Cómo es la verificación" (tres pasos) y "Quién ve tus documentos": "Solo tú y el equipo de administración de Replica. Se guardan en un espacio privado y se abren con enlaces que vencen."
- Menos de 1024 px: una columna; esas dos explicaciones van al final.

**Panel de administración (`/profesional/admin`).**
- Columnas: Nombre, Cédula, Universidad (secundaria), Enviada (orden por fecha, `aria-sort`) y Estado, con "Revisar". Con el panel contextual abierto, la tabla tiene poco sitio: es tabla desde 560 px de ancho propio y muestra Universidad desde 760 px; por debajo, una tarjeta por solicitud (a 1024 px de ventana, tarjetas).
- Filtros: el estado en pastillas que bajan de línea (Pendientes, Por corregir, Aprobadas, Rechazadas y Todas; cinco no caben en un `Segmented`), "Buscar por nombre o cédula" y `DateRangeFilter`. Menos de 768 px van en "Filtrar" (una hoja, con "Ver {n} solicitudes"); desde 768 px, a la vista sobre la tabla.
- El expediente: desde 1024 px en el panel contextual (sin solicitud elegida: "Elige una solicitud para ver su expediente."); entre 768 y 1023 px en el panel lateral superpuesto, y en el teléfono a pantalla completa. Abrirlo agrega `?solicitud=:id` al historial, y cerrarlo (o el atrás del navegador) lo quita.
- Las acciones solo están con la solicitud **pendiente**. Por corregir dice "Esperando que {nombre} corrija."; aprobada y rechazada muestran su historial.
- "Solicitar subsanación" abre una ventana con una casilla por documento ("Pedir que reemplace {archivo}") y "Qué hay que corregir" (obligatorio). "Rechazar" pide el motivo en su ventana, con el botón en `destructive`.

**Acompañamiento, del lado de la persona.**
- `/psicologo/:id`: "Pedir acompañamiento" abre una ventana con "Cuéntale, si quieres, qué te trae" (opcional, hasta 2000 caracteres) y "Enviar solicitud". Explica: "{Nombre} lee tu solicitud y decide si puede acompañarte. Si acepta, se abre el chat."
- Con una solicitud pendiente, a ese psicólogo: "Esperando respuesta de {nombre}" y "Retirar solicitud"; a otro, o con otro activo: "Ya pediste acompañamiento a {nombre}" o "Ya trabajas con {nombre}", sin botón.
- `/chat`, sin conversación activa, arriba del estado vacío y solo lo más reciente:
  - **Pendiente:** "Esperando respuesta de {nombre}", la fecha, su mensaje si escribió uno, y "Retirar solicitud" (confirmación sin `destructive`).
  - **"Ahora no":** "{Nombre} no puede acompañarte por ahora. En el directorio hay otros psicólogos verificados." en `surface`, con "Buscar un psicólogo".
  - **Terminado:** "{Nombre} terminó el acompañamiento el {fecha}." o "Terminaste tu proceso con {nombre} el {fecha}.", "Tu diario ya no está compartido." y "Ver la conversación".
- `/chat/conversacion/:id`: una conversación terminada, para leerla. La misma pantalla del chat, sin campo ni "Compartir mi diario", y al final "Esta conversación terminó el {fecha}."
- Solo aceptar abre la conversación. Lo que el psicólogo lee de tu diario son **tus notas, salvo las privadas**; las réplicas son solo tuyas, y así lo dice la ventana de compartir.

**Avisos del chat, para cada lado.** El servidor deja el evento con su tipo y cada lado lo dice a su manera:

| Evento | La persona lee | El psicólogo lee |
|---|---|---|
| Aceptó | "{Psicólogo} aceptó acompañarte." | "Aceptaste acompañar a {persona}." |
| Compartió el diario | "Compartiste tu diario con {psicólogo}." | "{Persona} te compartió su diario." |
| Dejó de compartir | "Dejaste de compartir tu diario con {psicólogo}." | "{Persona} dejó de compartir su diario." |
| Lo terminó la persona | "Terminaste tu proceso con {psicólogo}." | "{Persona} terminó su proceso contigo." |
| Lo terminó el psicólogo | "{Psicólogo} terminó el acompañamiento." | "Dejaste de atender a {persona}." |

Cada lado marca su propia lectura: lo leído por la persona no cuenta para el psicólogo.

**Panel del psicólogo (`/profesional/dashboard`).**
- Resumen en una cuadrícula de 2 por fila (4 desde 1280 px: entre 1024 y 1279 el panel contextual deja la columna demasiado angosta), con `MetricTile`: Pacientes activos, Solicitudes nuevas, Diarios compartidos y Próxima sesión (la fecha, o "Sin sesiones").
- Solicitudes: tarjeta con el nombre, la fecha, el mensaje y "Aceptar" (`voice`) o "Ahora no" (`secondary`, con una confirmación: "Le diremos que por ahora no puedes y que puede buscar a otro psicólogo.").
- Pacientes (`DataTable`): Nombre, Desde, Diario (Compartido o Privado), Próxima sesión y "Abrir". Los que terminaron van en "Terminados", debajo, para releer sus notas clínicas.
- Agenda: "Tu enlace de Meet" (`https://meet.google.com/…`, con "Copiar" y "Probar"), los días (casillas), "Desde" y "Hasta", la duración (`Segmented`: 30, 45, 50 y 60 min) y "Guardar agenda". Debajo, las próximas sesiones con "Cancelar" (confirmación sin `destructive`) y "Agendar una sesión" (paciente, día y hora; sin enlace guardado, primero lo pide). La agenda guía y no bloquea: si el día o la hora quedan fuera, el diálogo lo dice ("Está fuera de tu agenda… Puedes agendarla igual.") y deja agendar. Los días y el horario se ven en el perfil público, en "Sesiones": "Atiende de lunes a viernes, de 15:00 a 19:00."
- Autorizaciones: en el panel contextual desde 1024 px y al final por debajo. Cada cambio con su fecha: "{Persona} te compartió su diario" o "dejó de compartirlo".

**Mensajes (`/profesional/mensajes` y `/profesional/mensajes/:id`).**
- Desde 1024 px: a la izquierda (320 px) las conversaciones; a la derecha la elegida, a la altura de la ventana. Sin elegida: "Elige una conversación." Sin panel contextual.
- Menos de 1024 px: la lista; la conversación ocupa la columna con su cabecera (volver a Mensajes, el nombre y "Ver su ficha"). En el teléfono va a pantalla completa, sin barra inferior y con Ayuda en crisis en la cabecera, como el chat de la persona.
- Cada fila: el nombre, el último mensaje en una línea y cuándo. Lo no leído se dice con "Nuevo", en texto, nunca con un número.
- Las conversaciones terminadas van aparte, en "Terminadas", y se leen sin campo.
- Las burbujas son las de siempre: las propias en salvia y las del paciente sobre la superficie. Las sesiones son la misma tarjeta, con "Agendaste una sesión".

**Visor (`/profesional/pacientes/:id`).**
- Cabecera: el nombre y "Más acciones" (un menú desplegable con "Escribirle" y "Dejar de atender"). La confirmación dice: "Termina el acompañamiento: ya no podrán escribirse y dejarás de ver su diario. {Persona} verá el aviso en su chat. Tus notas clínicas se quedan contigo."
- Las notas, como en Notas: por día, encabezados fijos, el ánimo con su color y el tema. Filtros: los ánimos que existen en sus notas y `DateRangeFilter`.
- Sin permiso: "{Persona} todavía no te compartió su diario." o "{Persona} dejó de compartir su diario el {fecha}."
- Notas clínicas: desde 1024 px en el panel contextual; por debajo, un botón "Notas clínicas" abre el panel lateral o la hoja. "Nueva nota", cada una con su fecha, "Editar" y "Borrar" (este con confirmación en `destructive`). Encabezado: "Solo tú las ves. {Persona} nunca las lee."

**Piezas, al construirlas.**
- **Panel lateral:** `Dialog` con `variant="side"`. Menos de 768 px es una hoja a pantalla completa; desde 768 px se pega a la derecha (hasta 440 px), a toda la altura. Lo demás es el `Dialog` de siempre.
- **`DataTable`:** recibe columnas (con `secondary` para las que se ocultan con poco sitio) y una tarjeta por fila. Decide por su propio ancho, no por el de la ventana: tabla desde 560 px, columnas secundarias desde 760 px. Dibuja solo una de las dos.
- **`Menu`:** "Más acciones". Un botón con `aria-haspopup="menu"` y una lista `role="menu"`; flechas, Inicio y Fin para moverse; Escape o Tab lo cierran y el foco vuelve al botón. La acción irreversible va en `destructive`.
- **`DateRangeFilter`:** "Desde" y "Hasta" (`<input type="date">` con su `label`, en hora local) y los atajos 7 días, 30 días y Todo.
- **`PdfPreview`:** desde 768 px el PDF dentro de la página (`<object>`) con "Abrir en otra pestaña"; en el teléfono, una tarjeta con "Abrir el documento". El enlace firmado se pide al abrir.
- **Conversación terminada:** las sesiones agendadas se muestran sin "Unirse por Meet".
- **`Skeleton`:** filas de `surface-sunken` con un brillo lento que se apaga con "reducir movimiento".
- **Modo simulado:** `admin@replica.test` ve las solicitudes de prueba y la de este navegador; aprobarla vuelve psicóloga a esa cuenta (al entrar de nuevo, o al abrir su solicitud) y la pone en el directorio de este navegador, como en el servidor. `valeria@replica.test` tiene un consultorio de prueba con dos pacientes y una solicitud. En el chat de la persona, en desarrollo, dos botones simulan la respuesta del psicólogo.

## 11. Módulos que faltan por diseñar

Salen de la especificación y todavía no tienen interfaz. Cada uno se diseña aquí, en pocas líneas y con los tres anchos, antes de construirlo:

| Módulo | Ruta | Requisitos | Punto de partida |
|---|---|---|---|
| Ayuda en crisis | `/ayuda`, y `CrisisButton` en toda pantalla con sesión | RF-59 a RF-61 | Tono calmado, sin rojo. Líneas por país con fuente oficial, ejercicio de respiración y escribirle a su psicólogo si tiene uno |
| Chat con la IA | `/chat/ia` | RF-57, RF-58 | Aparte del chat con psicólogos. El malva es de la IA. Respuesta palabra por palabra, historial y límite diario |
| Exportar notas | Hoja desde `/notas` | RF-29 | PDF o texto, rango de fechas y si incluye las privadas |
| Compartir una nota suelta | Hoja desde `/chat` | RF-44 | Con confirmación; las privadas no se ofrecen; se ve qué se compartió |
| Bloqueo del diario | `/bloqueado`, y ajuste en Usuario | RF-52 | PIN o llave de acceso, con tiempo de inactividad. Nunca se presenta como cifrado |
| Recordatorio diario | Ajuste en Usuario | RF-53 | Pide permiso al navegador y se apaga cuando la persona quiera |

### Ayuda en crisis (Fase 15)

**`CrisisButton`.** `LifeBuoy` y "Ayuda en crisis", nunca en rojo ni con animación. Lleva a `/ayuda`.

| Ancho | Dónde |
|---|---|
| Menos de 768 px | Junto a la barra inferior, a su derecha: un círculo de 52 px con el mismo fondo translúcido de la barra, solo ícono y `aria-label="Ayuda en crisis"`. La barra se acorta para dejarle sitio. En las pantallas sin barra (la conversación con el psicólogo y la de Replica), un botón de 44 px en su cabecera. En el área profesional, en la fila del `h1`, con texto (§10, "Anchos") |
| 768 px o más | Al pie de la barra lateral, encima del tema, con texto, en las dos áreas |

**`/ayuda`.** Con sesión, dentro de la navegación personal. Una columna de lectura (680 px, `lg:mx-0`), sin panel derecho, con `PageHeader` ("Ayuda en crisis", vuelve a `/`). De arriba abajo:

1. Una frase en la voz de Replica (`font-replica`, sin malva: aquí no habla la IA): "Si estás pasando por un momento difícil, no tienes que cargarlo a solas." Debajo: "Si tu vida o la de alguien corre peligro ahora, llama a emergencias." Con el número solo si el país lo tiene comprobado.
2. **Líneas de atención.** Un `<select>` con su `label` ("País"). Por ahora la lista tiene solo Venezuela, el país donde la persona responsable puede comprobar las líneas, y "Otro país". Empieza en Venezuela si la zona horaria es la de Caracas; si no, en "Otro país". Se recuerda en ese navegador. Cada línea es una tarjeta: nombre, para qué es y su horario, el botón "Llamar al {número}" (`tel:`, 44 px, `voice`) y, debajo, "Fuente: {dominio} · comprobada el {fecha}", enlazada a la página oficial. Un país sin línea comprobada no muestra ningún número: "Todavía no tenemos una línea comprobada para tu país. Si estás en peligro, acude al centro de salud más cercano o pídele a alguien de confianza que te acompañe."
3. **Respira conmigo.** Un círculo `voice-soft` que crece en 4 s ("Inhala"), se queda 4 s ("Sostén") y baja en 6 s ("Exhala"), tres vueltas. "Empezar" y "Parar". La indicación va en texto con `aria-live="polite"`; con "reducir movimiento" el círculo no cambia de tamaño y solo cambia el texto.
4. **Tu psicólogo.** Con conversación activa: "Escribirle a {nombre}" lleva a `/chat`. Sin psicólogo: "Si quieres acompañamiento, en el directorio hay psicólogos verificados", a `/chat/directorio`.

En los tres anchos es la misma columna; desde 768 px las tarjetas de líneas van de dos en dos.

**`help_resources`.** Las líneas viven en la base de datos, cada una con `source_url` y `checked_at`, y las aprueba la persona responsable antes de publicarlas. La web simulada usa la misma lista (`frontend/src/data/helpResources.ts`).

**Señales de riesgo (RF-61).** La réplica y la respuesta del chat traen `risk`, que decide Gemini con la instrucción de seguridad y que el servidor también marca si Gemini se niega. Con `risk`, la réplica no da consejos y, debajo del análisis, aparece `HelpLink`: "Si lo necesitas, hay personas que pueden escucharte hoy." y "Ver ayuda en crisis", en `voice`. Igual en la réplica del día y en el chat con Replica, debajo de su mensaje.

### Chat con Replica (Fase 15)

Aparte del chat con psicólogos. Lo que dice la IA va en malva (`reply`); lo de la persona, en su burbuja de siempre.

- **Rutas:** `/chat/ia` (las conversaciones) y `/chat/ia/:id` (una). `/chat/ia/nueva` empieza una; al enviar el primer mensaje pasa a su `:id` con `replace`.
- **Entrada:** desde `/chat`. Sin psicólogo, una segunda tarjeta "Conversar con Replica" bajo el estado vacío; con psicólogo, una línea al final del aviso inicial de la conversación.
- **Menos de 1024 px:** `/chat/ia` es la lista (título "Conversa con Replica", "Nueva conversación" y cada conversación con su título y su fecha). La conversación ocupa toda la pantalla, como la del psicólogo: en el teléfono sin barra inferior, con cabecera (volver, "Replica", Ayuda en crisis y "Borrar conversación").
- **1024 px o más:** a la izquierda (320 px) la lista; a la derecha la conversación. `/chat/ia` abre una nueva.
- **Aviso inicial:** "Aquí piensas en voz alta con Replica. No lee tus notas, no diagnostica y no reemplaza a un psicólogo."
- **Respuesta palabra por palabra**, con el mismo ritmo de la réplica; el resto de la pantalla no se mueve.
- **Límite diario,** definido en el servidor (20 mensajes). Al llegar, en la voz de Replica (malva, itálica) encima del campo: "Por hoy ya conversamos bastante. Mañana seguimos aquí." y el envío se desactiva hasta el día siguiente. El mensaje que no salió vuelve al campo.
- **Borrar:** "Borrar conversación" abre `Dialog` con el botón en `destructive`: "Se borra esta conversación con Replica. No se puede deshacer."

### Exportar notas (Fase 17)

- **Entrada:** en `/notas`, un botón de ícono (`Download`, 44 px, `aria-label="Exportar tus notas"`) en la fila del título, a la izquierda de la búsqueda. Mientras se busca, el campo ocupa la fila y el botón se esconde. Sin notas no aparece.
- **La hoja** (`Dialog`, `size="sm"`; hoja inferior en el teléfono y ventana desde 768 px), "Exportar tus notas", con la descripción "Un archivo con tus notas y sus réplicas, para guardarlo donde quieras.":
  1. **Formato:** `Segmented` con "PDF" y "Texto".
  2. **Fechas:** `DateRangeFilter` ("Desde" y "Hasta"), que empieza en el día de la primera nota y termina hoy.
  3. **Notas privadas:** una casilla "Incluir mis notas privadas", apagada al abrir. Debajo, en `muted-foreground`: "Solo tú las ves. Si las incluyes, quedan en el archivo."
  4. **Cuántas:** "Se exportan 12 notas", con el número calculado de lo elegido. Si es cero: "No hay notas en esas fechas." y el botón se desactiva.
  5. "Exportar" (`voice`) y "Cancelar".
- **El archivo** se arma en el navegador con lo que ya está en el diario de la persona, nunca de otra cuenta: `replica-notas-{desde}-a-{hasta}.pdf` o `.txt`. Cada día con su fecha; cada nota con la hora, el ánimo, el tema y, si la tuvo, su réplica (titular, análisis y preguntas) o el comentario de la réplica del día; la réplica del día va al final de su día. Las privadas, si se incluyen, dicen "Nota privada". El PDF usa las fuentes estándar del formato (una con serifa para los títulos y una sin serifa para el texto, las más cercanas a Alegreya y Alegreya Sans), "Replica" arriba y sin colores fuertes; se genera aparte, solo cuando alguien exporta. El texto plano va en UTF-8.
- Se descarga sin salir de la pantalla. Al terminar, la hoja se cierra. Si falla (por ejemplo, sin espacio), el aviso queda en la hoja, en `emotion`: "No pudimos crear el archivo. Inténtalo otra vez."

### Compartir una nota suelta (Fase 17)

- **Entrada:** en la conversación con el psicólogo (`/chat`), un botón de ícono a la izquierda del campo (`NotebookPen`, 44 px, `aria-label="Compartir una nota"`). No aparece en una conversación terminada.
- **La hoja** (`Dialog`, `size="md"`), "Compartir una nota con {nombre}". Arriba: "{nombre} la verá en el chat: el texto, el ánimo y el tema. Su réplica sigue siendo solo tuya." Debajo, la lista de las notas que no son privadas, de la más nueva a la más vieja (las 30 últimas, con búsqueda si hay más), cada una como botón con su título, el día y el ánimo. **Las privadas no aparecen.** Una que ya compartiste dice "Ya la compartiste el {fecha}" y se puede volver a compartir.
- **Confirmación:** al elegir una, la hoja pasa a su vista previa (el texto completo, el ánimo y el tema) con "Compartir" (`voice`) y "Elegir otra". Nada se envía antes de esa confirmación.
- **En el chat** la nota compartida es una tarjeta, no una burbuja: borde `border`, fondo `surface-raised`, "Nota del {día}" en mayúsculas pequeñas, el ánimo con su punto de color, el tema y el texto (seis líneas y "Ver la nota" en el lado de la persona, que lleva a `/notas/:id`; completo en el lado del psicólogo). Va a la derecha si la compartió la persona. La tarjeta es la forma de ver qué notas compartiste.
- **En el servidor:** el mensaje lleva `entry_id`, y el texto lo copia la base de datos de la nota, no el navegador. Solo la persona comparte, solo notas suyas y nunca privadas. El psicólogo de esa conversación puede leer esa nota, aunque no tenga el diario compartido.

### Borrar una nota

No lo pide la especificación: es una decisión de producto del 3 de noviembre. El diario es de la persona, y tiene que poder quitar lo que escribió.

- **Entrada:** en el detalle de la nota (`/notas/:id`), al final, un botón fantasma "Borrar nota" con `Trash2`, en `destructive`. No hay borrar desde la lista ni con un gesto: borrar siempre pasa por ver la nota.
- **Confirmación** (`ConfirmDialog`, `destructive`): "¿Borrar esta nota?" y "También se borra su réplica. No se puede deshacer." Si se compartió en el chat, agrega: "En el chat se queda como la enviaste." El botón dice "Borrar".
- **Después:** vuelve a `/notas` con un aviso en `role="status"`: "Borraste la nota." Si no se pudo, el aviso va en `emotion` (`role="alert"`) debajo del botón: "No pudimos borrar la nota. Revisa tu conexión e inténtalo otra vez.", y la nota sigue ahí.
- **Qué se borra con ella:** su tema, su réplica al momento (y esa réplica sale del cofre), el comentario que le dejó la réplica del día y su lugar entre las favoritas. **Qué se queda:** la réplica del día, que leyó otras notas, y el mensaje del chat si se compartió, porque el psicólogo ya lo recibió. Evolución y la racha se recalculan, porque salen de las notas que existen.
- **En el servidor:** cada persona borra solo sus notas (`entries_own_delete`). Lo demás se borra en cascada. Borrar la primera nota del día no devuelve la llamada a la IA: el límite diario sigue contando.

### Bloqueo del diario (Fase 17)

Protege el acceso a Replica **desde este navegador**. Nunca se dice "cifrado", "encriptado" ni "seguro": el texto dice "bloqueo" y "este navegador".

- **Ajuste:** en Usuario → "Tu espacio privado", una fila "Bloqueo en este navegador". Apagado: "Pide un PIN al abrir Replica aquí." y "Activar". Encendido: "Con PIN" o "Con PIN y llave de acceso", el tiempo y "Desactivar".
- **Activar** abre `Dialog` en dos pasos:
  1. "Elige un PIN de 4 a 6 números" y "Repítelo" (campos `inputmode="numeric"`, `autocomplete="off"`, 16 px, su `label`). Si no coinciden: "Los dos PIN no coinciden." junto al segundo campo, con `aria-invalid`.
  2. "¿Cuándo lo pedimos?": `Segmented` con "1 min", "5 min" y "15 min" sin usar Replica (empieza en 5). Siempre se pide al abrir. Si el dispositivo tiene llave de acceso (`isUserVerifyingPlatformAuthenticatorAvailable`), la casilla "Usar también la llave de acceso de este dispositivo" (huella, rostro o el bloqueo del equipo); al activarla se crea la llave con WebAuthn y, si se cancela, queda solo el PIN.
  Debajo, siempre: "El bloqueo protege el acceso desde este navegador. Tus notas siguen en tu cuenta y no se cifran."
- **Cambiar el tiempo** se hace en la misma fila. **Desactivar** pide el PIN (o la llave) en `Dialog`.
- **`/bloqueado`.** Con el bloqueo puesto, cualquier ruta lleva aquí y, al desbloquear, vuelve a donde estaba. Pantalla completa sobre el fondo, sin navegación ni contenido detrás: el ícono de la marca (36 px), "Replica está bloqueada", el campo del PIN (`label` "Tu PIN") con "Entrar" y, si existe, "Usar la llave de acceso" (que se ofrece sola al abrir). Un PIN equivocado: "Ese no es tu PIN." (`role="alert"`, en `emotion`). Tras cinco intentos, espera 30 s con la cuenta atrás en texto. Abajo: "¿Olvidaste tu PIN? Cierra sesión y vuelve a entrar con tu cuenta." con "Cerrar sesión"; cerrar sesión quita el bloqueo de este navegador.
- **En el navegador:** el PIN se guarda solo como derivación PBKDF2 con sal (WebCrypto), por cuenta, en `localStorage`. La llave de acceso solo comprueba que es la persona del dispositivo: no viaja al servidor.
- Se bloquea al abrir la web, al volver a la pestaña después del tiempo elegido y tras ese tiempo sin tocar, escribir ni desplazarse. Mientras está bloqueada no se trae nada nuevo a la pantalla.

### Recordatorio diario (Fase 17)

- **Ajuste:** en Usuario → "Tu réplica", debajo de la réplica del día, la fila "Recordatorio diario": "Un aviso suave a la hora que elijas, solo si ese día aún no escribiste." con un interruptor (`role="switch"`, 44 px). Encendido, aparece la hora (`<input type="time">`, con su `label` "Hora del recordatorio", 21:00 al empezar).
- **Activar** pide el permiso del navegador en ese momento, nunca antes. Si la persona lo niega, el interruptor vuelve a apagado y la fila dice, en `muted-foreground`: "Tu navegador no permite avisos de Replica. Puedes cambiarlo en los ajustes del sitio." Si el navegador no tiene Web Push (o falta la clave pública del servidor), la fila no aparece.
- **El aviso:** "Replica" y "Tu hoja está aquí, si quieres escribir hoy." Sin números, sin rachas y sin culpa. Al tocarlo abre Inicio (o enfoca la pestaña abierta).
- **En el servidor:** la suscripción va a `push_tokens` y la hora a `user_settings` (`reminder_enabled`, `reminder_time`). Cada 15 minutos, `pg_cron` llama a `send-reminders`, que manda el aviso a quien le tocó la hora en su zona, no escribió ese día y no lo recibió hoy. Apagarlo borra la suscripción de este navegador. Sin servidor (modo simulado), el aviso lo muestra la propia web si está abierta a esa hora.

### Sin conexión (Fase 17)

- **Lo que se guarda en el navegador** (IndexedDB `replica-offline`, por cuenta): la última copia de la cuenta que llegó del servidor y la bandeja de notas que no salieron. Cerrar sesión o eliminar la cuenta lo borra todo.
- **Al abrir sin conexión**, si hay copia, la web entra con ella en vez de "No pudimos traer tu diario". Sin copia, la pantalla de siempre.
- **Mientras no hay conexión**, arriba del contenido y en la voz de Replica (malva, itálica, `role="status"`): "Estás sin conexión. Lo que escribas se guarda aquí y se envía cuando vuelvas." Lo que necesita el servidor (pedir una réplica, el chat, compartir el diario) dice lo suyo como siempre.
- **Una nota escrita sin conexión** se guarda con "Guardar" o "Replica" igual que siempre y queda en la bandeja. En su tarjeta, en `muted-foreground`: "Se envía cuando vuelva la conexión." Al volver, sale sola con la hora en que se escribió (el servidor la acepta hasta tres días atrás) y la web trae la cuenta otra vez; si le tocaba réplica al momento, se pide desde la nota.
- **La web abre sin conexión** porque el Service Worker guarda sus archivos al primer uso (solo en la versión publicada).
