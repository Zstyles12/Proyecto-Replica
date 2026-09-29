# Replica — Sistema de diseño

> **Para quien diseña o programa la web (incluida una IA como Gemini):** este archivo es la guía completa y suficiente para que la web se vea y se sienta igual que la app. Léelo entero antes de diseñar. Los valores salen del código de la app (`theme/colors.ts`, `theme/fonts.ts`, `theme/motion.ts`, `tailwind.config.js`); si algo aquí contradice al código, manda el código. El producto (qué hace y qué no) está resumido en la sección 11 y detallado en `PRODUCT.md`.

---

## 1. Qué es Replica, en una línea

Un diario personal donde escribes lo que sientes y la IA te devuelve una **réplica**: una reflexión breve y cálida con preguntas para seguir escribiendo. Además conecta con un psicólogo verificado por chat. **Nombre: "Replica", sin tilde.** A la respuesta de la IA se le dice "réplica" (con tilde) en los textos.

## 2. Dirección visual: "Telar"

Tu nota es la **pasada de ida** del hilo; la réplica es **el hilo que vuelve**; los días escritos forman **una tela**. Todo el sistema sale de esa idea:

- **Renglones de fondo:** líneas **horizontales** finísimas (1 px físico) cada **24 px**, color `warp`, de lado a lado, como la hoja de un cuaderno. Aparecen detrás de todas las pantallas y, donde hay scroll, se mueven con el contenido como una hoja de verdad. Es muy sutil: se nota, no se mira. (Antes eran hilos verticales, la urdimbre del telar; se cambiaron a renglones para que la app se sienta más como un cuaderno de notas. En la app, `components/ui/warp.tsx` conserva las dos versiones y se cambia con una constante.)
- **Dos voces, dos hilos:** lo que escribe el usuario va en **salvia** (`voice`). Lo que dice la réplica va en **malva** (`reply`). **Nunca se mezclan:** el malva es exclusivo de la IA.
- **Terracota** (`emotion`) para lo emocional y cálido: corazones de favoritos, detalles de ánimo.
- **Sin culpa:** un día sin escribir es hilo sin tejer, nunca un reproche, una X roja ni un puntaje.

**Tono visual:** calmado, contemplativo, editorial. Como un cuaderno bueno, no como una app de productividad ni de bienestar genérica. Nada de degradados llamativos, íconos gigantes, confeti, gamificación ni colores saturados de "wellness".

## 3. Color

Cada color tiene **un solo papel**. Hay tema **claro** y **oscuro** (y "Sistema", que sigue al dispositivo). Todos los pares texto/fondo cumplen contraste accesible.

### 3.1 Tokens

| Token | Claro | Oscuro | Papel |
|---|---|---|---|
| `background` | `#F5FBF6` | `#131315` | Fondo de todas las pantallas (menta muy clara / obsidiana) |
| `foreground` | `#171D1A` | `#E5E1E4` | Texto principal |
| `surface` | `#EFF5F0` | `#1B1B1D` | Hoja de escribir, tarjetas agrupadas, burbujas del psicólogo |
| `surface-raised` | `#FFFFFF` | `#201F21` | Tarjetas con peso propio (réplica, ajustes), barra de navegación, ventanas emergentes |
| `surface-sunken` | `#E9EFEA` | `#0E0E10` | Filas dentro de tarjetas de ajustes, estados vacíos |
| `muted` | `#E4EAE5` | `#2A2A2C` | Botones secundarios, fondos de íconos neutros |
| `muted-foreground` | `#414844` | `#C1C8C3` | Texto secundario |
| `subtle` | `#5E6661` | `#9AA19C` | Placeholders, íconos discretos, chevrons |
| `border` | `#C1C8C3` | `#414845` | Bordes finos (casi siempre con transparencia) |
| `warp` | `#DDE4DF` | `#232326` | Renglones del fondo |
| `voice` | `#325346` | `#A7CFBE` | **Voz del usuario y acción principal:** botones primarios, selección, tus mensajes, el hilo de ida |
| `voice-foreground` | `#FFFFFF` | `#0F372A` | Texto sobre `voice` |
| `voice-soft` | `#C6EAD8` | `#284E40` | Fondos suaves de la voz (íconos en círculo, pastillas elegidas) |
| `reply` | `#655975` | `#D0C1E0` | **Solo la réplica de la IA:** su texto, su aura, el hilo de vuelta, etiquetas "Destilado por Replica" |
| `reply-foreground` | `#FFFFFF` | `#20172E` | Texto sobre `reply` |
| `reply-soft` | `#ECDCFD` | `#2E2638` | Fondos de lo que dijo la réplica (recuadros de réplica en listas) |
| `emotion` | `#A04B2F` | `#F3B8B3` | Corazón de favorito, detalles emocionales cálidos |
| `emotion-foreground` | `#FFFFFF` | `#4B2623` | Texto sobre `emotion` |
| `emotion-soft` | `#FFDBD0` | `#5C3431` | Fondos suaves emocionales |
| `destructive` | `#BA1A1A` | `#FFB4AB` | Solo acciones destructivas (eliminar cuenta, errores reales) |
| `destructive-foreground` | `#FFFFFF` | `#690005` | Texto sobre `destructive` |

**Reglas de uso:**
- **Una sola acción principal por pantalla**, en `voice`. Lo demás: secundario (`muted`), fantasma (texto `voice` sin fondo) o contorno.
- **Nunca uses rojo para pedirle algo al usuario.** Los avisos amables (por ejemplo, "falta elegir cómo te sientes") no son errores: se dicen con la voz de Replica (malva, itálica) o en gris. El rojo es solo para destruir algo o para un fallo real.
- Las transparencias sobre tokens son comunes: bordes al 35–70 %, fondos suaves al 10–15 % (por ejemplo, la tarjeta elegida usa `voice` al 10 % con borde `voice`).

### 3.2 Ánimos

Siete ánimos, cada uno con su tinte. Van **siempre con su nombre escrito** (nunca identifican solo por color) y se usan como puntos, bordes y tintes suaves, no como fondos grandes.

| Ánimo | Claro | Oscuro |
|---|---|---|
| Paz | `#2A8A6A` | `#34A07A` |
| Alegría | `#B07D00` | `#BF8A00` |
| Gratitud | `#D1567E` | `#DB6A90` |
| Reflexión | `#2477B8` | `#3B8BD0` |
| Cansancio | `#A4417A` | `#B04D86` |
| Ansiedad | `#D4502C` | `#DD6630` |
| Tristeza | `#4A62B8` | `#6A80D6` |

**Temas** (un solo tema por nota): Trabajo, Familia, Pareja, Amistades, Salud, Estudios, Dinero, Yo. Se muestran como `#Trabajo` en listas y como "Trabajo" junto a un ícono `#` en la pastilla de la hoja (nunca `# #Trabajo`).

**Tela de días** (constancia): escala de un solo tono según las notas del día (1, 2, 3 o más). Claro: `#86BDA4`, `#3A7059`, `#244A3B`. Oscuro: `#2A5444`, `#6FAE94`, `#A7CFBE`. Sin nota: celda vacía con borde fino, nunca roja.

### 3.3 Variables CSS para la web

```css
:root {
  --background: #F5FBF6; --foreground: #171D1A;
  --surface: #EFF5F0; --surface-raised: #FFFFFF; --surface-sunken: #E9EFEA;
  --muted: #E4EAE5; --muted-foreground: #414844; --subtle: #5E6661;
  --border: #C1C8C3; --warp: #DDE4DF;
  --voice: #325346; --voice-foreground: #FFFFFF; --voice-soft: #C6EAD8;
  --reply: #655975; --reply-foreground: #FFFFFF; --reply-soft: #ECDCFD;
  --emotion: #A04B2F; --emotion-foreground: #FFFFFF; --emotion-soft: #FFDBD0;
  --destructive: #BA1A1A; --destructive-foreground: #FFFFFF;
  --mood-paz: #2A8A6A; --mood-alegria: #B07D00; --mood-gratitud: #D1567E;
  --mood-reflexion: #2477B8; --mood-cansancio: #A4417A; --mood-ansiedad: #D4502C;
  --mood-tristeza: #4A62B8;
}
[data-theme="dark"] {
  --background: #131315; --foreground: #E5E1E4;
  --surface: #1B1B1D; --surface-raised: #201F21; --surface-sunken: #0E0E10;
  --muted: #2A2A2C; --muted-foreground: #C1C8C3; --subtle: #9AA19C;
  --border: #414845; --warp: #232326;
  --voice: #A7CFBE; --voice-foreground: #0F372A; --voice-soft: #284E40;
  --reply: #D0C1E0; --reply-foreground: #20172E; --reply-soft: #2E2638;
  --emotion: #F3B8B3; --emotion-foreground: #4B2623; --emotion-soft: #5C3431;
  --destructive: #FFB4AB; --destructive-foreground: #690005;
  --mood-paz: #34A07A; --mood-alegria: #BF8A00; --mood-gratitud: #DB6A90;
  --mood-reflexion: #3B8BD0; --mood-cansancio: #B04D86; --mood-ansiedad: #DD6630;
  --mood-tristeza: #6A80D6;
}
/* "Sistema": aplica el bloque oscuro con @media (prefers-color-scheme: dark) si no hay tema elegido. */
```

## 4. Tipografía

Tres voces tipográficas, cada una con un papel:

| Voz | Fuente | Dónde |
|---|---|---|
| **Replica / títulos** | **Alegreya** (Regular 400, Medium 500, Italic 400) | Títulos de pantalla, saludo, titular de la réplica, frases del cofre |
| **La réplica** | **Alegreya Italic**, en `reply` (malva) | Todo lo que "dice" la IA en cuerpo de texto |
| **Tu voz** | **Alegreya Sans** (400, 500) | Lo que escribe el usuario (la hoja, sus notas) |
| **Interfaz** | Fuente del sistema (SF Pro / Roboto / `system-ui`) | Botones, etiquetas, ajustes, metadatos |

En la web: Google Fonts **Alegreya** (400, 400 italic, 500) y **Alegreya Sans** (400, 500); para la interfaz, `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

**Escala (tamaño/interlineado, en px):**

| Estilo | Fuente | Tamaño | Uso |
|---|---|---|---|
| `display` | Alegreya 400 | 28/34, tracking −0.3 | Título de pantalla, saludo ("Buenos días, Ana") |
| Titular de réplica | Alegreya 400 | 29/36, tracking −0.3 | La frase grande de la réplica |
| `title` | Alegreya 500 | 20/26 | Títulos de sección ("Tus favoritas") y de tarjeta (19/24) |
| Frase del cofre | Alegreya Italic | 20/29 | Frases y citas |
| `reply` | Alegreya Italic | 17/26, malva | Cuerpo de lo que dice la réplica |
| `voice` | Alegreya Sans 400 | 17/26 | La hoja y el texto de las notas |
| `body` | Sistema | 16/22 | Texto de interfaz |
| `heading` | Sistema 600 | 17/22 | Encabezados de interfaz |
| `callout` | Sistema | 15/21 | Explicaciones, subtítulos de pantalla |
| `footnote` | Sistema | 13/18, `muted-foreground` | Metadatos, ayudas |
| `caption` | Sistema | 12/16, `muted-foreground` | Notas mínimas |
| Etiqueta de sección | Sistema 600 | 11–12, MAYÚSCULAS, tracking 0.6–0.8 | "FRASE DEL DÍA", "DESTILADO POR REPLICA", "TUS MÉTRICAS" |

Cuando la réplica cita lo que escribiste, la cita va en **Alegreya Italic salvia** (son tus palabras dentro de la voz de la IA).

## 5. Espacio, forma y profundidad

- **Márgenes laterales:** 20 px para textos y títulos; 16 px para tarjetas. En la web, el contenido vive en una **columna de lectura de 640–720 px** centrada; los renglones ocupan todo el ancho de la ventana.
- **Ritmo vertical:** 8 px de base. Entre secciones, 24–32 px; dentro de una tarjeta, 12–16 px.
- **Radios:** `sm` 8 · `DEFAULT` 12 · `md` 16 · `lg` 24 · `xl` 32. Tarjetas: **24**. Hoja de escribir: 32. Filas dentro de tarjetas: 16. **Botones y pastillas: totalmente redondeados** (radio completo).
- **Alturas de toque:** botón 44 (normal), 36 (pequeño), 48 (grande); pastillas 32–36; nunca menos de 44 px de área táctil.
- **Bordes:** siempre finos (1 px físico, "hairline") y con transparencia. Nunca bordes gruesos ni divisores oscuros.
- **Sombras:** casi imperceptibles y **solo en claro** (tarjetas elevadas: `0 6px 14px rgba(27,58,46,0.06)`). En oscuro se reemplazan por un borde fino.
- **Íconos:** trazo lineal de 2 px con puntas redondeadas (estilo **Lucide**). Tamaños 14–22 px. Los íconos importantes van dentro de un círculo de 36–40 px con fondo `voice-soft` (o `reply-soft` / `emotion-soft`) e ícono del color fuerte.
- **Densidad:** es un diario. La escritura manda; nada compite con la hoja en Inicio.

## 6. Piezas (componentes)

Estas son las piezas de la app. La web debe reproducir su aspecto y comportamiento.

- **Botón:** redondo completo. Primario: fondo `voice`, texto `voice-foreground`, 15–16 px semibold. Secundario: `muted`. Fantasma: texto `voice` sin fondo. Al presionar: escala a 0.97 en 120 ms.
- **Tarjeta:** radio 24, fondo `surface-raised` (o `surface` para grupos más tranquilos), borde fino, sombra leve solo en claro.
- **Hoja de escribir:** superficie `surface`, radio 32, borde fino; placeholder con la pregunta del día ("Escribe aquí… ¿Cómo te sientes al empezar el día?"). Dentro, una barra con: micrófono (dictar), candado **"Privada"**, contador de palabras y el botón principal (**"Replica"** con ícono de destellos si la nota recibe réplica al momento, **"Guardar"** si no). El micrófono y el candado **se transforman en su lugar**: el círculo del micrófono se estira hasta la pastilla "Escuchando" (con la onda de voz) y vuelve a cerrarse; el candado suma "Privada" y crece. Lo de al lado se desliza, nunca salta.
- **Pastillas de contexto:** dos pastillas sobre la hoja: **"¿Cómo te sientes?"** (con un aro que se llena con el color del ánimo) y **"¿Sobre qué?"** (con ícono `#`). Con valor, toman un tinte suave del color (13 %) y su borde (40 %). Al cambiar su texto, **su ancho se anima** (260 ms) y la de al lado se desliza.
- **Réplica:** tarjeta con avatar salvia (un brote) y "Replica · Tu compañera silenciosa" (o "Tu réplica del día", o "Tu última réplica" la de medianoche), titular grande en Alegreya que la llama por su nombre ("Ana, poner un límite también es una forma de cuidarte."), el análisis en texto de interfaz con tu cita en itálica salvia, una rayita `voice-soft` y un desplegable "Para seguir escribiendo" con preguntas y "Escribir sobre esto". Mientras escribe, un **aura malva** respira alrededor del avatar y el texto aparece palabra por palabra.
- **Frase (cofre):** tarjeta con comillas y etiqueta en malva ("FRASE DEL DÍA", "CITA DEL DÍA", "DESTILADO POR REPLICA"), la frase en Alegreya Italic 20 px, autor o nota de origen en pequeño, y dos botones redondos: compartir y corazón.
- **Corazón de favorito:** al marcarlo late (escala 1.3 y vuelve con resorte) y suelta seis puntitos terracota; al quitarlo **se parte en dos mitades** que caen y dejan ver el contorno vacío.
- **Cofre:** ícono propio (un baúl de tapa curva con un corazón terracota al frente) en un círculo `surface` de 44 px. Abre "Mi cofre" (lo guardado). Va junto al saludo en Inicio y junto a los títulos en Usuario y Evolución. **Sin contador encima.**
- **Botón de Notas:** el ícono de la pestaña Notas (cuaderno) en un círculo `surface` de 44 px, junto a "Notas recientes" en Inicio. Reemplaza al enlace "Ver todas (n)": **nunca un número como insignia**.
- **Nota en lista:** tarjeta con el ánimo (punto + nombre), la hora, el título (primera frase, Alegreya Medium 18), un extracto y, si tiene, el titular de su réplica en un recuadro `reply-soft`. Las privadas llevan una etiqueta "Privada" con candado.
- **Réplica del día en Notas:** tarjeta `reply-soft` arriba de las notas de su día (es lo último que pasó ese día): luna en malva, "RÉPLICA DE TU DÍA", el titular en Alegreya Italic y "Leyó tus 3 notas" ("· y una última réplica a medianoche" si la hubo). Abre la pantalla del día. Con filtros o búsqueda activos no aparece.
- **Tu entrada (detalle de nota):** lo que escribiste, con un hilo salvia a la izquierda, plegado en 3 líneas. La flecha aparece **solo si el texto no cabe**; plegada, tocar el texto la abre; abierta, el texto se puede seleccionar y se pliega con la flecha.
- **Comentario de la réplica del día (detalle de nota):** tarjeta `reply-soft` con "EN LA RÉPLICA DE TU DÍA" (o "EN TU ÚLTIMA RÉPLICA"), el comentario que la réplica le dejó **a esa nota** (distinto en cada una, nunca la réplica entera repetida) en Alegreya Italic, y "Leer la réplica de tu día ›". Antes de que llegue, una línea discreta con la luna dice cuándo llega.
- **Tarjeta de cierre:** después de guardar una nota, una tarjeta dice qué pasa con ella ("Guardada en tu diario" / "Nota privada") con **"Listo"** y "Ver en Notas ›". Nunca invita a escribir otra nota enseguida.
- **Tarjeta de ajustes (plegable):** ícono en círculo + título Alegreya + **resumen de cómo está** ("Suave y cercana · réplica del día a las 22:00", "Huella activado · diario solo tuyo", "Sistema · sonidos activados") + flecha. **Empieza cerrada** y se cierra sola al salir de la pantalla. Abierta, filas sobre `surface-sunken` (radio 16) con ícono salvia a la izquierda y el control (interruptor, selector) a la derecha.
- **Interruptores:** cambian en el acto al tocarlos; si algo falla después (no hay permiso, no se confirma la huella), vuelven atrás con un aviso. Nunca esperan al sistema para moverse.
- **Selector segmentado:** fondo `surface-sunken`, pastilla blanca que se desliza (250 ms) a la opción elegida.
- **Métrica:** etiqueta, ícono en círculo suave, número grande (Alegreya) que sube al aparecer y qué significa ("Seguidos escribiendo"). Solo métricas reales.
- **Curva de ánimo:** línea cúbica monótona (nunca se pasa de los valores reales), degradada con los colores de los ánimos, que se dibuja de izquierda a derecha y se recorre con el dedo o el cursor.
- **Barra de navegación (móvil):** flotante, a 16 px de los lados, 62 px de alto, redondeada completa, fondo `surface-raised` (translúcido con desenfoque donde se pueda), borde fino y sombra suave. Cinco pestañas con ícono y nombre; la activa se marca con **un hilo salvia de 2,5 px** bajo el ícono, que se desliza entre pestañas. En escritorio, la web puede usar una barra lateral con las mismas cinco secciones y el mismo hilo como indicador.
- **Imagen para compartir:** 9:16, 1080 × 1920 en iPhone; en Android, a la resolución de la pantalla (casi 1080 de ancho), sin reescalar para que las letras queden nítidas. Fondos fijos que no dependen del tema: **Salvia** (`#325346`, texto `#F4FAF6`), **Malva** (`#ECDCFD`, texto `#171D1A`), **Noche** (`#131315`, texto `#E5E1E4`), **Papel** (`#F5FBF6`, texto `#171D1A`). La frase, el autor si es cita y la marca de Replica; nunca contenido de la nota.
- **Recorridos (tutoriales):** la pantalla se oscurece (claro: `rgba(12,24,19,0.58)`, oscuro: `rgba(0,0,0,0.72)`), el elemento explicado queda recortado con **borde nítido y una línea blanca fina (1,5 px)**, y debajo o encima (donde quepa) una tarjeta con una línea de texto, "Saltar todo", "1 de 5" y "Siguiente". El foco se desliza de un elemento al siguiente; si el elemento es más alto que la pantalla, el recorte se limita a lo visible. En Usuario, cada paso abre su tarjeta de ajustes y cierra la anterior. El botón atrás de Android cierra el recorrido.
- **Registro:** pantallas de un solo paso con título Alegreya grande, explicación corta y la acción fija abajo. Progreso de la configuración: **un hilo que se teje** en la barra superior. Código de verificación en **seis casillas** que tiemblan si el código no coincide.

## 7. Movimiento

El movimiento es parte de la identidad: **calmado, físico, sin rebotes exagerados**. Todo se anima con propósito: explicar un cambio, confirmar algo o marcar un momento importante.

### 7.1 Tokens

| Token | Valor | Uso |
|---|---|---|
| `easing.out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entradas y salidas |
| `easing.inOut` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movimiento en pantalla (indicadores, hilo, foco del recorrido) |
| `duration.press` | 120 ms | Respuesta al toque (escala 0.97) |
| `duration.small` | 180 ms | Cambios de color, bordes, rotación de chevrons |
| `duration.enter` / `exit` | 280 / 180 ms | Entradas / salidas (las salidas siempre más rápidas) |
| `duration.indicator` | 250 ms | Indicadores que se desplazan |
| `stagger.list` / `word` | 50 / 45 ms | Escalonado de listas / palabras |
| `distance.enter` | 10 px | Cuánto sube algo al entrar (nada llega desde lejos) |
| Resortes | 400 ms (amortiguación 1.0 y 0.8), hojas 300 ms | Asentamientos |

### 7.2 Patrones

- **Entrada de contenido:** sube 10 px y aparece (280 ms, `easing.out`), escalonado 50 ms entre bloques.
- **Paneles bajo un botón** (opciones de ánimo, filtros, preguntas): bajan 6 px al aparecer (280 ms) y se van en 180 ms.
- **Reacomodo:** cuando algo cambia de alto, lo de abajo se desliza a su lugar (280 ms), nunca salta.
- **Plegar y desplegar** (tu entrada, tarjetas de ajustes): 300 ms, `easing.out`; la flecha gira 180° con la misma duración. Al abrir, el contenido aparece 80 ms después de que la tarjeta empieza a crecer; al cerrar se va en 120 ms y la tarjeta lo recorta mientras se encoge. Se anima con transiciones de layout (el marco va de su lugar viejo al nuevo), no recalculando el alto cuadro a cuadro.
- **Botones que se transforman** (dictado, nota privada): el ancho cambia animado (250 ms, `easing.out`), el contenido nuevo aparece con 60 ms de retraso y el viejo se va en 100 ms.
- **Cambio de sección o pestaña:** fundido cruzado de 220 ms, la nueva sube 8 px. **Nunca deslizar de lado** entre secciones hermanas.
- **Pedir la réplica:** la hoja se pliega hacia arriba (sube 12 px, escala 0.97, se desvanece) y 320 ms después la réplica entra encima y se escribe palabra por palabra.
- **Cambio de tema:** una foto de la pantalla actual se disuelve sobre el tema nuevo (~360 ms), sin parpadeo. Solo se vuelve a dibujar la pantalla visible; las demás se ponen al día al abrirlas.
- **Voltear la imagen para compartir:** al cambiar el fondo, la tarjeta gira como una carta (520 ms), cambia de color de canto y se abre con el nuevo.
- **Reducir movimiento:** si el usuario lo pide (`prefers-reduced-motion`), queda solo la opacidad y se quitan desplazamientos, giros y rebotes.

### 7.3 Momentos propios

- **La pasada:** al guardar, un hilo salvia cruza la pantalla y regresa en malva mientras llega la réplica.
- **El aura:** halo malva que respira lento (ciclo de 5,2 s) mientras la IA escribe.
- **El splash:** el logo tejiéndose (ida salvia, vuelta malva).
- **El cierre del registro:** la marca se teje completa y suena una campanita.

## 8. Sonido

Una sola familia sonora, suave y corta (campanitas de madera, papel), sintetizada por nosotros (`assets/sounds/`, generada con `scripts/generate-sounds.py`). Respeta el modo silencio y nunca corta la música del usuario. Se puede apagar en Usuario → Apariencia.

- **Suenan:** tocar Replica (roce de papel), la réplica terminada (dos notas), marcar favorito (pop) y quitarlo (un "tuc" suave), mensaje enviado y recibido, imagen guardada, notificaciones (una para el recordatorio, otra para el psicólogo).
- **No suenan:** navegación, selectores, pastillas, botones comunes, escribir, errores.
- Cada sonido de la app empieza con **50 ms de silencio**: el primer sonido tras un rato callado llega mientras la salida de audio del teléfono despierta, y así su comienzo no se entrecorta. Las notificaciones no lo llevan.

En la web, los sonidos son opcionales y deben estar **apagados por defecto** o pedir permiso implícito con un interruptor visible.

## 9. Voz y textos

- **Español neutro**, trato de **tú**, frases cortas y cálidas. Nunca técnico ni clínico.
- **Sin culpa y sin presión:** "Tu día quedó escrito", no "Completaste tu meta". Nada de rachas perdidas, contadores de insistencia ni "¡No te rindas!".
- **La réplica habla en primera persona suave** y usa el nombre: "Ana, noto que…".
- **Los avisos son preguntas de Replica, no errores:** "Antes de responderte, ¿cómo te sientes?", en su voz (malva itálica), no en rojo.
- **Honestidad:** no prometer lo que no existe (nada de "cifrado de extremo a extremo" si no lo es).
- **Favoritas:** se dice "marca como favorita" / "las frases que marques como favoritas", nunca "toca el corazón".
- **Sin números que llamen:** nada de "Ver todas (12)" ni "Favoritas · 5". Un ícono o la palabra sola.
- Vocabulario propio: **réplica**, **réplica del día**, **última réplica** (la de medianoche), **notas de tu día**, **cofre / Mi cofre**, **destilado por Replica**, **tela** (constancia), **hoja** (donde se escribe), **nota privada**.

## 10. Pantallas

Cinco secciones: **Inicio, Notas, Evolución, Chat, Usuario.**

- **Inicio:** fecha y costura de racha arriba; saludo grande con el cofre a la derecha; una línea de cuándo llega la réplica del día; las pastillas de contexto; **la hoja**; las dos frases del día (sin título); notas recientes. Tras guardar: la réplica (si toca), la nota plegada, la frase destilada y la tarjeta de cierre. "Notas recientes" lleva el botón de Notas (ícono), sin número. La réplica del día **no ocupa Inicio**: la línea bajo el saludo dice "Tu réplica del día llega a las 22:00", luego "Replica está leyendo tu día…" y, al llegar, "Llegó tu réplica del día · Leer ›" (en la mañana, "Llegó tu última réplica de anoche · Leer ›" si la hubo), que abre la pantalla del día.
- **Notas:** título, búsqueda (el campo reemplaza al título en la misma fila), "Todas / Favoritas" (sin número) y "Filtrar" (por ánimo y tema); lista agrupada por día, con la réplica de cada día arriba de sus notas. El detalle de una nota: su réplica propia (la primera del día), tu entrada plegable, el comentario de la réplica del día (o cuándo llega) y la frase destilada.
- **Tu día** (se abre desde la réplica en Notas, desde el detalle de una nota o desde Inicio): la réplica del día una sola vez, la última réplica si la hubo y "Notas de tu día".
- **Evolución:** selector semana/mes/año; "Cómo te sentiste" (curva + barras por ánimo); "Temas y patrones"; "Cofre de aprendizajes"; "Tu tela".
- **Chat:** si hay psicólogo, abre directo la conversación (pantalla completa, sin barra de navegación): próxima sesión con "Unirse" (Meet), mensajes, compartir diario. Si no hay, el directorio de psicólogos. **Solo un psicólogo a la vez.** Solo el psicólogo agenda o cancela sesiones.
- **Usuario:** ficha con foto, nombre, intención y "En Replica desde…"; métricas; "Tus favoritas" con el cofre; ajustes en tarjetas plegables que empiezan cerradas y muestran su resumen: **Tu réplica** (tono, hora de la réplica del día y recordatorio), **Tu espacio privado** (bloqueo y diario compartido), **Apariencia** (tema y sonidos); tu cuenta (cerrar sesión, eliminar cuenta); "Soy psicólogo"; "Ver los tutoriales otra vez"; Términos y Privacidad.
- **Registro:** bienvenida (3 páginas) → entrar (Apple, Google o correo con código de 6 dígitos, sin contraseña) → "Antes de empezar" (consentimiento: 18+, términos, que una IA lee las notas) → configuración (nombre, qué te trae, tono, hora de la réplica del día, bloqueo) → "Todo listo".

## 11. Reglas de producto que el diseño debe respetar

1. **Escribir no tiene límite; réplicas, dos al día (a veces tres):** la primera nota del día (no privada) recibe su réplica al momento; las siguientes se guardan y, a la hora elegida (8 o 10 p. m.), llega **la réplica del día**, que lee todas las notas del día y le deja a cada una un comentario propio. Si se escribe después de esa, a medianoche llega **una última réplica** que lee solo esas notas (y avisa a las 00:00). No es un chat: nunca hay ida y vuelta inmediata con la IA.
2. **Notas privadas:** no las lee la IA ni el psicólogo. Se ven con candado.
3. **Ánimo y tema son necesarios** para guardar (con ellos se calculan las métricas). Se piden con amabilidad, nunca como error.
4. **Solo métricas reales:** racha, notas, palabras, días escritos, ánimo más frecuente, temas. Nunca puntajes de salud mental ni porcentajes de "mejora".
5. **La IA acompaña, no reemplaza:** no diagnostica; si hay riesgo, sugiere ayuda profesional. "Replica acompaña, pero no reemplaza la terapia ni atiende emergencias."
6. **Privacidad primero:** el diario es privado; compartirlo con un psicólogo es explícito y revocable.
7. **Favoritos:** hay dos favoritas distintas: notas favoritas (en Notas) y frases favoritas, que se guardan en el cofre. En los textos se dice "marcar como favorita".
8. **Frases del día:** dos por día (aliento y citas de dominio público), iguales todo el día. Compartibles como imagen.

## 12. Accesibilidad

- Contraste suficiente en ambos temas (los tokens ya lo cumplen; no aclares textos por estética).
- Áreas táctiles de al menos 44 px; foco visible con teclado en la web (anillo `voice`).
- Respetar el tamaño de texto del sistema y `prefers-reduced-motion`.
- Los colores de ánimo siempre acompañados de su nombre.
- Todos los íconos-botón con etiqueta accesible ("Mi cofre", "Nota privada", "Compartir como imagen").

## 13. Referencias en este repositorio

- Valores: `theme/colors.ts`, `theme/fonts.ts`, `theme/motion.ts`, `tailwind.config.js`.
- Producto y alcance: `PRODUCT.md`, `docs/02-estructura.md`.
- Mockups de referencia visual (con el nombre provisional "Serena"): `design-reference/`. Se sigue su composición en tarjetas y su jerarquía; **no** se copian funciones fuera de alcance (chat con IA, métricas inventadas, cifrado o exportar).
- Pendiente de definir: logo definitivo y set final de ánimos.
