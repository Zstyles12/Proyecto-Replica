/**
 * Fuente única de verdad para los textos y opciones del Playground de Componentes.
 * Cumple con el principio de no improvisar copy en componentes (DESIGN.md y Regla 2 del proyecto).
 */

export interface MoodItem {
  id: string;
  name: string;
  colorVar: string;
}

export const PLAYGROUND_CONTENT = {
  header: {
    badge: "Fase 1 · Cimientos",
    title: "Replica — Showroom Telar",
    description:
      "Biblioteca de componentes atómicos esenciales. Diseñados para sentirse como un cuaderno sereno, con ritmo vertical de 8 px y micro-interacciones suaves.",
    note: "Valores tomados textualmente de DESIGN.md.",
  },
  themeSection: {
    title: "1. Tema de la interfaz",
    description:
      "Alterna el modo para auditar la adaptación de tokens, contraste accesible y el comportamiento de las sombras.",
    options: [
      { id: "light", label: "Claro" },
      { id: "dark", label: "Oscuro" },
      { id: "system", label: "Sistema" },
    ],
  },
  buttonsSection: {
    title: "2. Botones",
    description:
      "Redondos completos (radio 9999px). Presión con escala a 0.97 en 120 ms. Una sola acción principal por pantalla en color voice.",
    labels: {
      primary: "Acción principal (Voice)",
      secondary: "Secundario (Muted)",
      ghost: "Fantasma",
      destructive: "Destructivo",
      sizes: {
        normal: "Normal (44 px)",
        sm: "Pequeño (36 px)",
        lg: "Grande (48 px)",
      },
    },
  },
  cardsSection: {
    title: "3. Tarjetas",
    description:
      "Radio de 24 px (lg). Fondo surface-raised con sombra sutil exclusiva de modo claro, o surface para grupos secundarios.",
    sampleRaised: {
      tag: "DESTILADO POR REPLICA",
      quote: "Poner un límite también es una forma de cuidarte.",
      body: "Ana, noto que al describir tu jornada priorizaste el descanso sobre la exigencia. ¿Cómo se sintió darte esa pausa?",
      footerAction: "Escribir sobre esto",
    },
    sampleFlat: {
      tag: "TARJETA AGRUPADA (SURFACE)",
      body: "Superficie de menor peso visual para agrupar elementos secundarios, filas o estados informativos.",
    },
  },
  pillsSection: {
    title: "4. Pastillas de Ánimo y Temas",
    description:
      "Pastillas totalmente redondeadas (32–36 px de alto). Con valor activo toman un tinte suave del 13% y borde del 40%. Los ánimos siempre muestran su nombre.",
    moodsHeader: "Ánimos (Sección 3.2)",
    themesHeader: "Temas (Sección 3.2)",
  },
  iconsSection: {
    title: "5. Íconos en Círculo",
    description:
      "Trazo lineal de 2 px (Lucide). Círculos de 36–40 px con fondos suaves de cada tono semántico (Sección 5).",
    labels: {
      voiceSoft: "Voz (Salvia)",
      replySoft: "Réplica (Malva)",
      emotionSoft: "Emoción (Terracota)",
      surface: "Cofre / Diario (44 px)",
    },
  },
  moods: [
    { id: "paz", name: "Paz", colorVar: "var(--mood-paz)" },
    { id: "alegria", name: "Alegría", colorVar: "var(--mood-alegria)" },
    { id: "gratitud", name: "Gratitud", colorVar: "var(--mood-gratitud)" },
    { id: "reflexion", name: "Reflexión", colorVar: "var(--mood-reflexion)" },
    { id: "cansancio", name: "Cansancio", colorVar: "var(--mood-cansancio)" },
    { id: "ansiedad", name: "Ansiedad", colorVar: "var(--mood-ansiedad)" },
    { id: "tristeza", name: "Tristeza", colorVar: "var(--mood-tristeza)" },
  ] as MoodItem[],
  themes: [
    "Trabajo",
    "Familia",
    "Pareja",
    "Amistades",
    "Salud",
    "Estudios",
    "Dinero",
    "Yo",
  ],
} as const;
