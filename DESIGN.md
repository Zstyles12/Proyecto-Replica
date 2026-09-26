# Design System: Réplica
**Project ID:** 17299559205999308659

## 1. Visual Theme & Atmosphere
El sistema de diseño de **Réplica** encarna un santuario íntimo, empático, discreto y profundamente seguro para la claridad mental y el desempaque emocional. Rechaza de forma deliberada el lenguaje frío y analítico del software hospitalario tradicional, así como la sobreestimulación gamificada de las aplicaciones comerciales.

Su estética combina **Minimalismo Orgánico Cálido** con **Tacto Suave**:
- **Respiración y Espacio Negativo:** Generosos márgenes y espaciados que alivian la sobrecarga cognitiva.
- **Geometría Inspirada en Cantos Rodados:** Formas orgánicas, redondeces pronunciadas (`rounded-lg`, `rounded-full`) que evocan piedras de río pulidas y objetos físicos reconfortantes.
- **Capas Tonales vs. Líneas Duras:** Jerarquías comunicadas mediante transiciones tonales, desenfoques sutiles (`backdrop-blur-xl`) y sombras ambientales difusas en lugar de bordes divisorios agresivos.

---

## 2. Color Palette & Roles

La paleta se fundamenta en pigmentos naturales que disminuyen la excitación sensorial y garantizan legibilidad prolongada sin fatiga visual:

### Primary (Lavanda Introspectiva)
- **Primary (`#5e5586`)**: Tono lavanda suave para estados reflexivos, elementos interactivos principales y botones primarios.
- **Primary Container (`#776ea0`)**: Contenedor primario de apoyo para estados hover o elevaciones.
- **On Primary (`#ffffff`)**: Texto blanco puro sobre superficies primarias.
- **Primary Fixed (`#e6deff`)**: Lavanda claro para acentos ambientales, halos y fondos de insignias suaves.
- **Primary Fixed Dim (`#cabff7`)**: Tono lavanda atenuado para contrastes suaves.
- **On Primary Fixed (`#1d1441`)**: Tinta oscura profunda para máxima legibilidad sobre lavanda fijo.
- **On Primary Fixed Variant (`#49406f`)**: Tinta lavanda oscura intermedia para enlaces y detalles secundarios.

### Secondary (Verde Salvia Regulador)
- **Secondary (`#436558`)**: Verde salvia terroso para conexión a tierra, estados de calma, confirmaciones e indicadores de progreso.
- **Secondary Container (`#c2e8d7`)**: Fondo contenedor salvia para píldoras interiores y círculos de respiración.
- **On Secondary Container (`#476a5c`)**: Tinta salvia profunda para iconos y etiquetas sobre contenedor secundario.
- **Secondary Fixed (`#c5ebda`)**: Tono menta-salvia suave para fondos de insignias y halos ambientales.
- **Secondary Fixed Dim (`#a9cfbe`)**: Variante suave para estados inactivos o contrastes sutiles.
- **On Secondary Fixed (`#002117`)**: Tinta verde bosque profunda para texto de alto contraste.
- **On Secondary (`#ffffff`)**: Texto blanco sobre fondos secundarios.

### Tertiary (Pizarra Introspectiva)
- **Tertiary (`#4c5e71`)**: Azul pizarra apagado para metadatos, controles secundarios y notas reflexivas.
- **Tertiary Container (`#64768b`)**: Contenedor azul pizarra sereno.
- **Tertiary Fixed (`#d2e4fc`)**: Azul cielo tenue para etiquetas y descansos visuales.
- **On Tertiary (`#ffffff`)**: Blanco sobre fondo terciario.

### Superficies y Neutros (Lienzo Orgánico)
- **Background / Surface (`#fbf8ff`)**: Base de lienzo con ligero matiz lavanda/crema, eliminando la frialdad del blanco puro.
- **Surface Dim (`#dad9e4`)**: Superficie atenuada para jerarquías bajas.
- **Surface Container Lowest (`#ffffff`)**: Blanco puro usado para tarjetas activas elevadas (`backdrop-blur-xl`).
- **Surface Container Low (`#f4f2fd`)**: Superficie base para inputs y botones secundarios.
- **Surface Container (`#eeedf8`)**: Base de contenedores agrupados (como el switcher de roles).
- **Surface Container High (`#e8e7f2`)**: Divisores y separadores suaves.
- **Surface Container Highest (`#e2e1ec`)**: Superficie de mayor contraste tonal.
- **On Surface (`#1a1b23`)**: Carbón oscuro suave para tipografía principal, previniendo el cansancio del negro puro `#000000`.
- **On Surface Variant (`#48454e`)**: Carbón medio para subtítulos, descripciones e instrucciones.
- **Outline (`#79757f`)**: Tono neutro para bordes e iconos deseleccionados.
- **Outline Variant (`#c9c4cf`)**: Borde sutil de baja intensidad.

### Alertas y Estados
- **Error (`#ba1a1a`)**: Rojo suave para errores de validación sin sobresalto visual excesivo.
- **Error Container (`#ffdad6`)**: Contenedor de advertencia cálido.
- **On Error (`#ffffff`)**: Contraste sobre fondo de error.

---

## 3. Typography Rules

Toda la jerarquía utiliza **Plus Jakarta Sans**, seleccionada por su apertura humanista, curvas orgánicas y ritmo pausado:

| Token | Font Size | Line Height | Weight | Letter Spacing | Uso Funcional |
|---|---|---|---|---|---|
| `display` | 40px | 48px | 600 (SemiBold) | -0.02em | Títulos de bienvenida ("Hola, estás en casa") |
| `display-mobile` | 32px | 40px | 600 (SemiBold) | -0.015em | Variantes móviles de títulos |
| `headline-lg` | 28px | 36px | 600 (SemiBold) | -0.01em | Encabezados de paneles y secciones reflexivas |
| `headline-md` | 22px | 30px | 600 (SemiBold) | -0.005em | Subsecciones y subtítulos de tarjetas |
| `headline-sm` | 18px | 26px | 600 (SemiBold) | 0 | Marca institucional y títulos de tarjetas compactas |
| `body-lg` | 18px | 28px | 400 (Regular) | 0 | Textos de guía y acompañamiento |
| `body-md` | 16px | 24px | 400 (Regular) | 0 | Lectura principal, campos de entrada de formulario |
| `body-sm` | 14px | 20px | 400 (Regular) | 0 | Descripciones secundarias, sellos de privacidad |
| `label-lg` | 15px | 20px | 500 (Medium) | +0.01em | Botones interactivos principales y pestañas de rol |
| `label-md` | 13px | 18px | 500 (Medium) | +0.015em | Etiquetas de campos, botones sociales, estados |
| `label-sm` | 11px | 16px | 600 (SemiBold) | +0.03em | Microcopia, citas, insignias superiores |

---

## 4. Spacing & Grid System

- **Escala de Espaciado Modular**:
  - `space-xs`: `0.25rem` (4px)
  - `space-sm`: `0.5rem` (8px)
  - `space-md`: `1rem` (16px)
  - `space-lg`: `1.5rem` (24px)
  - `space-xl`: `2.5rem` (40px)
- **Márgenes y Gutters Adaptativos**:
  - `gutter`: `1.25rem` (Mobile) / `1.5rem` (Tablet) / `2rem` (Desktop)
  - `margin`: `1.25rem` (Mobile) / `2.5rem` (Tablet) / `4rem` (Desktop)
- **Estructura Grid**:
  - Contenedor central máximo: `1240px`.
  - Disposición en 12 columnas: 5 columnas para el panel santuario (reflexión/respiración) y 7 columnas para el portal de acceso (formulario e interacción).

---

## 5. Border Radii & Geometry (Shapes)

- **`rounded-sm`**: `0.5rem` (8px)
- **`DEFAULT`**: `1rem` (16px) — Tarjetas internas compactas.
- **`rounded-lg`**: `2rem` (32px) — Contenedores de sección y campos de entrada.
- **`rounded-xl`**: `3rem` (48px) — Contenedor maestro del módulo de autenticación.
- **`rounded-full`**: `9999px` — Botones de acción, píldoras de cambio de rol, chips y badges.

---

## 6. Depth & Elevation

- **Base de Lienzo:** Fondo sutil `#fbf8ff` con dos orbes decorativos difuminados (`blur-3xl`) en lavanda y salvia.
- **Contenedor Principal:** Fondo `#ffffff/80` con efecto de vidrio esmerilado `backdrop-blur-xl`, borde sutil y sombra difusa `shadow-xl`.
- **Interacciones:** Efectos de pulsación suave (`hover:scale-[0.99]`, `active:scale-[0.97]`) que simulan presión física sobre material suave.
