/**
 * Textos de la hoja de Inicio (la app: features/journal/components/composer-toolbar.tsx y
 * app/(tabs)/index.tsx). El resto de los textos de Inicio vive junto a su lógica, igual que en la app.
 */
export const INICIO_CONTENT = {
  writer: {
    listening: "Escuchando…",
    privateBadge: "Privada",
    wordsSuffix: "palabras",
    actions: {
      replica: "Replica",
      save: "Guardar",
    },
    // Mismos avisos que la app (DictationNotice), dichos para el navegador.
    dictation: {
      start: "Dictar",
      stop: "Detener el dictado",
      denied: "Para dictar, permite el micrófono en la configuración del navegador.",
      unavailable:
        "No pudimos usar el micrófono ahora mismo. Si otra pestaña o app lo está usando, ciérrala e intenta de nuevo.",
      error: "No pudimos escucharte. Intenta de nuevo.",
      dismiss: "Entendido",
    },
  },
} as const;
