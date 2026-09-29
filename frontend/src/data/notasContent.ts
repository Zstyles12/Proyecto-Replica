/**
 * Fuente única de verdad para la pantalla de Notas y el archivo del Diario.
 * Cumple con la Regla 2 del proyecto (cero copy improvisado).
 */

export const NOTAS_CONTENT = {
  header: {
    title: "Notas",
    description: "Tus notas agrupadas por día, con la réplica de tu día arriba.",
    newNoteButton: "Escribir nota",
  },

  search: {
    placeholder: "Buscar en tus notas…",
    clearAria: "Limpiar búsqueda",
    inputAria: "Buscar notas por texto",
  },

  filters: {
    all: "Todas",
    favorites: "Favoritas",
    moodTrigger: "Ánimo",
    tagTrigger: "Tema",
    clearAll: "Quitar filtros",
    allMoods: "Todos los ánimos",
    allTags: "Todos los temas",
  },

  emptyStates: {
    noNotes: {
      title: "Todavía no hay notas",
      description: "Cada nota que escribas se va a tejer aquí, junto con su réplica.",
      action: "Escribir la primera",
    },
    noMatch: {
      title: "Nada coincide",
      description: "Prueba con otra palabra o quita el filtro para ver tus notas.",
      action: "Ver todas",
    },
    noFavorites: {
      title: "Aún no hay favoritas",
      description: "Marca una nota con el corazón para tenerla guardada en tu cofre.",
      action: "Ver todas",
    },
  },

  rail: {
    summaryTitle: "Tu Diario",
    totalNotesLabel: "Notas tejidas",
    favoritesLabel: "Favoritas",
    streakLabel: "Días de racha",
    quickFiltersTitle: "Filtros rápidos",
    onlyFavoritesBtn: "Solo favoritas",
    onlyPrivateBtn: "Notas privadas",
    privateExplanation:
      "Tus notas privadas están cifradas localmente: nunca son leídas por la IA ni compartidas con tu psicólogo.",
  },

  noteDetail: {
    closeAria: "Cerrar detalle de nota",
    privateBadge: "Nota privada",
    favoriteAria: "Marcar o desmarcar favorita",
    replySectionTitle: "La Réplica de Replica",
    reflectionQuestionsTitle: "Para seguir reflexionando",
    deleteNote: "Eliminar nota",
    confirmDelete: "¿Seguro que deseas eliminar esta nota del diario?",
  },

  dayReply: {
    badge: "Réplica de tu día",
    streaming: "Replica está leyendo tu día…",
    notesCountPrefix: "Leyó tus",
    notesCountSuffix: "notas de hoy",
    lateReplySuffix: "· y una última réplica a medianoche",
    viewComplete: "Leer síntesis completa ›",
  },
} as const;
