/**
 * Fuente única de verdad para la pantalla de Inicio y el Diario.
 * Cumple con la Regla 2 del proyecto (cero copy improvisado).
 */

export const INICIO_CONTENT = {
  header: {
    streakSuffix: "días tejiendo",
    defaultStreak: 1,
    chestAria: "Abrir mi cofre de citas y favoritas",
    notesAria: "Ver todas las notas en el diario",
  },

  greetings: {
    morning: "Buenos días",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
  },

  dayReplyStatus: {
    waitingPrefix: "Tu réplica del día llega a las",
    reading: "Replica está leyendo tu día…",
    ready: "Llegó tu réplica del día · Leer ›",
  },

  contextPills: {
    moodDefaultLabel: "¿Cómo te sientes?",
    tagDefaultLabel: "¿Sobre qué?",
    moodAria: "Seleccionar cómo te sientes",
    tagAria: "Seleccionar tema de la nota",
  },

  writer: {
    placeholder: "Escribe aquí… ¿Cómo te sientes al empezar el día?",
    listening: "Escuchando…",
    privateBadge: "Privada",
    privateTooltip: "Nota privada: no la leerá la réplica de IA ni tu psicólogo.",
    wordsSuffix: "palabras",
    actions: {
      replica: "Replica",
      save: "Guardar",
    },
    notices: {
      missingMood:
        "Antes de responderte, ¿cómo te sientes? Elige tu ánimo para poder entenderte con calidez.",
      missingTag:
        "Para ordenar mejor tu diario, ¿sobre qué tema trata lo que acabas de escribir?",
      speechNotSupported:
        "Tu navegador actual no admite dictado por voz directo. Puedes escribir normalmente con el teclado.",
    },
  },

  reply: {
    tagline: "Replica · Tu compañera silenciosa",
    followUpTitle: "Para seguir escribiendo",
    writeAboutThis: "Escribir sobre esto",
  },

  closing: {
    titlePublic: "Guardada en tu diario",
    titlePrivate: "Nota privada guardada",
    bodyPublic:
      "Tu nota quedó tejida en el telar de hoy. La réplica del día la leerá a la hora acordada.",
    bodyPrivate:
      "Guardada únicamente en tu espacio privado. Ninguna IA ni psicólogo tiene acceso a ella.",
    buttonReady: "Listo",
    buttonViewInNotes: "Ver en Notas ›",
  },

  dailyQuotes: [
    {
      id: "quote-1",
      tag: "DESTILADO POR REPLICA",
      quote: "Poner un límite también es una forma de cuidarte.",
      author: "Reflexión del telar",
    },
    {
      id: "quote-2",
      tag: "CITA DEL DÍA",
      quote:
        "Casi todo volverá a funcionar si lo desconectas durante unos minutos, incluido tú.",
      author: "Anne Lamott",
    },
  ],

  recentNotes: {
    title: "Notas recientes",
    empty: "Aún no has guardado notas hoy. Empieza escribiendo en la hoja de arriba.",
  },
} as const;
