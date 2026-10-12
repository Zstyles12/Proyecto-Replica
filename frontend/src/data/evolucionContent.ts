export interface PeriodOption {
  value: "semana" | "mes" | "ano";
  label: string;
}

export const EVOLUCION_CONTENT = {
  periods: [
    { value: "semana", label: "Esta semana" },
    { value: "mes", label: "Este mes" },
    { value: "ano", label: "Este año" },
  ] as PeriodOption[],
  periodSpans: {
    semana: "Últimos 7 días",
    mes: "Últimas 5 semanas",
    ano: "Últimos 12 meses",
  },
  moodCurve: {
    badge: "Panorama emocional",
    title: "Cómo te sentiste",
    subtitleSuffix: "según el ánimo que elegiste al escribir.",
    pleasantLabel: "Agradable",
    neutralLabel: "Neutro",
    difficultLabel: "Difícil",
    tooltipNotesSingular: "nota",
    tooltipNotesPlural: "notas",
    tooltipPrevalent: "sobre todo",
    emptyNotice: "Escribe notas con tu ánimo elegido para ver tu curva emocional.",
    instructions: {
      semana: "Pasa el cursor o toca la curva para ver cada día.",
      mes: "Pasa el cursor o toca la curva para ver cada semana.",
      ano: "Pasa el cursor o toca la curva para ver cada mes.",
    },
  },
  moodBars: {
    title: "Distribución de ánimos",
    daysSuffix: "días",
    daySuffix: "día",
  },
  patterns: {
    title: "Temas y patrones",
    badgeFoundSingular: "encontrado",
    badgeFoundPlural: "encontrados",
    emptyTitle: "Aún no hay suficientes patrones",
    emptyDescription: "Cuando uses temas y elijas tu ánimo en varias notas, aquí verás qué se repite.",
    footnote: "Calculado a partir de tus temas y ánimos reales.",
  },
  writing: {
    wordsWritten: "palabras escritas",
    notesPrefix: "notas en los últimos",
    notePrefix: "nota en los últimos",
    daysSuffix: "días",
  },
  cloth: {
    title: "Tu tela",
    subtitle: "Cada día que escribiste queda tejido. Un día sin escribir es hilo sin tejer, nada más.",
    tooltipNoNotes: "sin notas",
    tooltipOneNote: "1 nota",
    tooltipMultipleNotes: "notas",
    dayLabels: { 0: "L", 2: "X", 4: "V", 6: "D" } as Record<number, string>,
  },
};
