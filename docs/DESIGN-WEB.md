# Replica web — Diseño de las interfaces

> **Cómo se usa este archivo.** `DESIGN.md` es una **copia exacta** del sistema de diseño de la app (`replica mobile/zairo/DESIGN.md`). Manda en las reglas de producto, la voz, los colores, la tipografía, la marca y los sonidos. Este archivo es **el diseño de las interfaces de la web**: cómo se organiza cada pantalla, la navegación, los anchos, el ratón y el teclado, y cómo se aplica la marca en el navegador. Donde una interfaz de este archivo es distinta de la app, manda este archivo. Si algo no está aquí, se parte de lo que dice `DESIGN.md` y de lo que hace la app.
>
> Cuando la app cambie su `DESIGN.md`, se vuelve a copiar tal cual y se revisa que este archivo siga siendo cierto.

---

## 1. Principio

La web es **la misma Replica** (las mismas reglas, la misma voz, la misma marca), con **sus propias interfaces**. Para cada pantalla, primero se mira la app: si su solución sirve en el navegador, se adapta. Si la web se ve o se usa mejor de otra forma, se diseña un camino propio, se anota aquí y se aprueba antes de implementar. Lo mismo con los textos: se copian de la app cuando sirven y se escriben nuevos, con la voz de Replica, cuando la interfaz web lo necesita.

Lo que la web no cambia por su cuenta: las reglas de producto (`AGENTS.md`), los colores y la tipografía, la marca y los sonidos. Si la web necesita algo nuevo ahí, se acuerda con la app.

## 2. Anchos y estructura

| Ancho | Navegación | Contenido |
|---|---|---|
| Menos de 768 px | Barra inferior flotante, igual que la app (`DESIGN.md` §6) | Una columna, como la app |
| 768–1023 px | Barra lateral fija de 240 px | Una columna de lectura centrada (640–720 px) |
| 1024 px o más | Barra lateral fija de 240 px | Columna principal alineada al mismo borde izquierdo (`lg:mx-0`) + panel derecho donde la pantalla lo define (sección 4) |

- Los renglones del fondo (`warp`) ocupan todo el ancho de la ventana.
- Desde 1024 px, todas las pantallas con sesión iniciada empiezan en el mismo borde izquierdo (`lg:mx-0`, columna de 680 px cuando no es de dos columnas) para que el contenido no salte al cambiar de sección. Por debajo de 1024 px la columna va centrada (`mx-auto`).
- Probar siempre en anchos exactos: 375, 767, 768, 1023, 1024 y 1440.
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

## 6. Lo nativo, traducido al navegador

| En la app | En la web |
|---|---|
| Hápticos | No existen; nada los reemplaza. |
| Sonidos | La misma familia (`public/sounds/`), con la firma del cierre del registro. **Apagados por defecto**; se activan en Usuario → Apariencia o en la bienvenida. No se descargan hasta que se activan. |
| Splash animado | No hay: en el navegador retrasaría el contenido. Mientras carga la app, `index.html` muestra el ícono quieto (sección 9). |
| Dictado (`expo-speech-recognition`) | Web Speech API (Chrome y Edge). Si el navegador no lo tiene, el micrófono no aparece. Los resultados parciales se muestran sin sumarse al texto hasta que son finales, como en la app. |
| Bloqueo con Face ID o huella | **Fuera de la v1 web.** No se muestra el ajuste ni el paso de configuración. Si hace falta mencionarlo: "El bloqueo está en la app de Replica". |
| Recordatorio diario (`expo-notifications`) | Requiere Web Push (HTTPS, Service Worker y permiso). Mientras no funcione de verdad, el ajuste no se ofrece: nada de interruptores que no hacen nada. |
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

## 8. Fuera de la v1 web

Además de lo que la app deja fuera (chat con la IA, pantalla de crisis, exportar notas, pagos, planes, videollamadas propias):

- Bloqueo del diario (biometría o PIN).
- Compartir una nota suelta dentro del chat: para eso existe compartir el diario.
- Exportar el diario.

## 9. La marca en el navegador

El manual y el kit son los de la app (`docs/marca` en su repositorio); `DESIGN.md` resume la marca. Aquí, cómo se aplica en la web.

**Piezas.** Las cinco del manual salen de una sola geometría (`src/components/brand/logoGeometry.ts`, copiada del kit con `npm run marca`; nunca se dibuja a mano). Se pintan con los tokens, igual que en la app: hoja `surface-raised`, borde y agujeros `border`, anillos `subtle`, cinta `voice`, flor `reply` y `reply-soft`, palabra `foreground`. Así el logo sigue el tema elegido, también cuando se fuerza claro u oscuro. Tamaños mínimos del manual: firma 120 px de ancho, logotipo 72 px, ícono 32 px, flor 16 px.

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

**Para la Etapa C.** Al desplegar: la imagen para enlaces compartidos (`og-claro-1200x630.png`), la descripción y `theme-color`; si la web se hace instalable, el manifiesto con `icon-192`, `icon-512` e `icon-maskable-512`.
