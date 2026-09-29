/**
 * Fuente única de verdad para la pantalla de Chat y Terapia (Care).
 * Cumple con la Regla 2 del proyecto (cero copy improvisado).
 * Datos de psicólogos y textos 1:1 con zairo-main/features/care/data.ts.
 */

export interface PsychologistData {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  approach: string;
  years: number;
  bio: string;
  license: string;
  meetLink: string;
  hours: number[];
  initials: string;
}

export const CHAT_CONTENT = {
  header: {
    statusOnline: "En línea",
    verifiedBadge: "Verificada",
    changePsychologist: "Cambiar terapeuta",
  },

  nextSession: {
    title: "Próxima sesión",
    platform: "Google Meet",
    joinButton: "Unirse por Meet",
    joinAria: "Unirse a la videollamada de Google Meet",
  },

  diaryShare: {
    title: "Diario compartido",
    description:
      "Permite que tu psicólogo lea tus notas públicas para preparar mejor cada sesión.",
    toggleAria: "Permitir o revocar acceso a notas públicas",
    activeBadge: "Compartiendo notas públicas",
    inactiveBadge: "No compartido",
    privateShield: "🔒 Tus notas privadas NUNCA son visibles para tu psicólogo ni para la IA.",
  },

  input: {
    placeholder: "Escribe un mensaje a tu psicólogo…",
    sendAria: "Enviar mensaje",
    shareNoteTooltip: "Compartir una nota de tu diario",
    typingStatus: "está escribiendo…",
  },

  shareNoteModal: {
    title: "Compartir nota en el chat",
    description:
      "Elige una nota de tu diario para mostrársela a tu psicólogo durante la conversación.",
    emptyNotes: "No tienes notas públicas disponibles para compartir.",
    shareButton: "Compartir esta nota",
    cancelButton: "Cancelar",
  },

  directory: {
    title: "Directorio de Psicólogos Verificados",
    subtitle:
      "Terapeutas colegiados con experiencia clínica. Trabajas con uno a la vez en un canal confidencial y seguro.",
    selectButton: "Elegir y comenzar chat",
    activeLabel: "Terapeuta actual",
    experienceSuffix: "años de experiencia clínica",
    closeAria: "Cerrar directorio",
  },

  psychologists: [
    {
      id: "psi-valeria",
      name: "Valeria Rondón",
      title: "Psicóloga clínica",
      specialties: ["Ansiedad", "Autoestima", "Estrés laboral"],
      approach: "Terapia cognitivo-conductual",
      years: 9,
      bio: "Acompaño a personas que sienten que la ansiedad les está ganando. Trabajo con herramientas concretas y a tu ritmo.",
      license: "Colegiada N.º 14.382",
      meetLink: "https://meet.google.com/rpl-valr-ond",
      hours: [9, 15, 18],
      initials: "VR",
    },
    {
      id: "psi-andres",
      name: "Andrés Mejía",
      title: "Psicólogo",
      specialties: ["Duelo", "Migración", "Depresión"],
      approach: "Terapia humanista",
      years: 12,
      bio: "Me especializo en duelos y en los cambios grandes de la vida, incluido dejar tu país. Aquí puedes hablar sin prisa.",
      license: "Colegiado N.º 9.117",
      meetLink: "https://meet.google.com/rpl-andr-mej",
      hours: [10, 14, 19],
      initials: "AM",
    },
    {
      id: "psi-camila",
      name: "Camila Ferrer",
      title: "Psicóloga",
      specialties: ["Pareja", "Familia", "Comunicación"],
      approach: "Terapia sistémica",
      years: 7,
      bio: "Trabajo con vínculos: pareja, familia y las conversaciones difíciles que a veces evitamos.",
      license: "Colegiada N.º 18.905",
      meetLink: "https://meet.google.com/rpl-cami-fer",
      hours: [11, 16, 20],
      initials: "CF",
    },
    {
      id: "psi-luis",
      name: "Luis Arévalo",
      title: "Psicólogo clínico",
      specialties: ["Ansiedad", "Sueño", "Hábitos"],
      approach: "Terapia de aceptación y compromiso",
      years: 15,
      bio: "Ayudo a construir hábitos que sostengan tu bienestar, sobre todo cuando el estrés no te deja descansar.",
      license: "Colegiado N.º 6.540",
      meetLink: "https://meet.google.com/rpl-luis-are",
      hours: [8, 13, 17],
      initials: "LA",
    },
  ] as PsychologistData[],

  simulatedReplies: [
    "Gracias por contármelo con tanta sinceridad. ¿Quieres que lo retomemos en nuestra próxima sesión?",
    "Te leo con atención. Si te ayuda, anótalo también en tu diario y lo profundizamos juntos.",
    "Entiendo perfectamente lo que sientes. ¿Cómo te encuentras ahora mismo, mientras me lo cuentas?",
    "Tiene mucho sentido lo que me estás diciendo. Vamos a ir paso a paso, con calma.",
  ],
} as const;
