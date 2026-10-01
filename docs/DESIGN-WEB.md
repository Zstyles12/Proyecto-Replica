# Replica web — Adaptación a escritorio

> **Cómo se usa este archivo.** `DESIGN.md` es una **copia exacta** del sistema de diseño de la app (`replica mobile/zairo/DESIGN.md`) y manda en todo: colores, tipografía, movimiento, voz, piezas y reglas de producto. Este archivo solo dice **qué hace distinto la web a propósito** para aprovechar una pantalla grande, y cómo se traduce lo nativo al navegador. Si algo no está aquí, se hace como dice `DESIGN.md` y como lo hace la app.
>
> Cuando la app cambie su `DESIGN.md`, se vuelve a copiar tal cual y se revisa que este archivo siga siendo cierto.

---

## 1. Principio

La web es **la misma Replica**, no otro producto. En el teléfono (menos de 768 px) debe sentirse como la app. En escritorio usa el espacio extra para **poner al lado** lo que en la app va debajo o en otra pantalla, nunca para **agregar** contenido que la app no tiene. Regla práctica: si una pieza no existe en la app, no entra en la web sin acordarlo con el equipo de la app.

## 2. Anchos y estructura

| Ancho | Navegación | Contenido |
|---|---|---|
| Menos de 768 px | Barra inferior flotante, igual que la app (`DESIGN.md` §6) | Una columna, como la app |
| 768–1023 px | Barra lateral fija de 240 px | Una columna de lectura centrada (640–720 px) |
| 1024 px o más | Barra lateral fija de 240 px | Columna principal + panel derecho donde la pantalla lo define (sección 4) |

- Los renglones del fondo (`warp`) ocupan todo el ancho de la ventana.
- Probar siempre en anchos exactos: 375, 767, 768, 1023, 1024 y 1440.
- La pantalla de bienvenida usa su propio corte a 1100 px (ilustración a un lado del texto).

## 3. Navegación en escritorio

- **Barra lateral:** las mismas cinco secciones, con el mismo ícono y nombre que la app. La activa se marca con **el hilo salvia de 2,5 px**, vertical, a la izquierda del ícono.
- Arriba, la marca de Replica (el brote dibujado, nunca un emoji).
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
- **Panel derecho (1024 px o más):** solo las **dos frases del día**, sin título. Es lo mismo que la app pone debajo de la hoja; en escritorio va al lado.
- **No hay** notas recientes ni tarjetas que repitan el estado de la réplica del día: nada compite con la hoja (decisión de la app).
- En la hoja, `Ctrl/⌘ + Enter` equivale a tocar "Replica" o "Guardar".

### Notas
- Columna principal: título, búsqueda, "Todas / Favoritas" y "Filtrar", y la lista por día con la réplica de cada día arriba de sus notas.
- **Panel derecho (1024 px o más):** opcional, solo con datos reales y sin números como insignia (por ejemplo, notas y palabras del mes, y un enlace para escribir). No duplica filtros que ya están en la lista.
- **El detalle de una nota y "Tu día" son páginas con su ruta**, no ventanas: `/notas/:id` y `/replica-dia/:dia`. Funcionan el botón atrás y los enlaces directos. En escritorio usan la columna de lectura.

### Evolución
- 1024 px o más: a la izquierda "Cómo te sentiste" (curva y barras) y "Tu tela"; a la derecha "Temas y patrones" y "Tu escritura en números". Sin cofre (vive en Usuario y junto al saludo de Inicio).
- La curva se recorre con el cursor, con el dedo y con las flechas del teclado.

### Chat
- **1024 px o más:** a la izquierda (340 px) la ficha del psicólogo, la próxima sesión con "Unirse por Meet" y el estado del diario compartido; a la derecha la conversación, a la altura de la ventana.
- **Menos de 1024 px:** la conversación a pantalla completa y sin barra de navegación, como en la app; la ficha se abre desde la cabecera (`/psicologo/:id`).
- Sin psicólogo: el estado vacío de la app ("Aquí hablarás con tu psicólogo") y el directorio (`/chat/directorio`), con filtro por especialidad.

### Usuario
- 1024 px o más: a la izquierda (360 px) la ficha y "Tu cuenta"; a la derecha las métricas, "Tus favoritas" con el cofre, las tarjetas de ajustes y el resto de filas ("Soy psicólogo o psicóloga", "Ver los tutoriales otra vez", Términos y Privacidad).
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
| Sonidos | La misma familia (`public/sounds/`). **Apagados por defecto**; se activan en Usuario → Apariencia o en la bienvenida. No se descargan hasta que se activan. |
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
