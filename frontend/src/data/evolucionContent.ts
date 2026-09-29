export interface PeriodOption {
  value: "semana" | "mes" | "ano";
  label: string;
}

export const EVOLUCION_CONTENT = {
  header: {
    title: "Evolución",
    description: "Cómo te sentiste en el tiempo, qué se repite en tus notas, tu cofre y tu constancia.",
    stepBadge: "Paso 7",
  },
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
      semana: "Desliza el ratón sobre la curva para ver cada día.",
      mes: "Desliza el ratón sobre la curva para ver cada semana.",
      ano: "Desliza el ratón sobre la curva para ver cada mes.",
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
  chest: {
    title: "Cofre de aprendizajes",
    badge: "Frases destiladas",
    openButton: "Abrir cofre",
    emptyTitle: "Tu cofre está esperando",
    emptyDescription: "Escribe una nota y pide la réplica: la frase que destile llegará aquí.",
  },
  writing: {
    wordsWritten: "palabras escritas",
    notesPrefix: "notas en los últimos",
    notePrefix: "nota en los últimos",
    daysSuffix: "días",
  },
  cloth: {
    title: "Tu tela",
    subtitle: "84 días de constancia · La pasada del hilo sin penalizaciones",
    tooltipNoNotes: "sin notas",
    tooltipOneNote: "1 nota",
    tooltipMultipleNotes: "notas",
    dayLabels: { 0: "L", 2: "X", 4: "V", 6: "D" } as Record<number, string>,
  },
};
