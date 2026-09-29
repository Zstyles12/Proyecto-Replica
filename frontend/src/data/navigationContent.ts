/**
 * Fuente única de verdad para la navegación y las secciones principales de Replica.
 * Cumple con el principio de no improvisar copy ni estructura (Regla 2).
 * Íconos oficiales 1:1 con la app móvil (zairo-main/components/navigation/floating-tab-bar.tsx).
 */

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: "Feather" | "NotebookText" | "ChartSpline" | "MessageCircle" | "CircleUserRound";
  badge?: string;
  description: string;
  comingInStep: string;
}

export const NAVIGATION_CONTENT = {
  brand: {
    name: "Replica",
    tagline: "Tu compañera silenciosa",
    avatarAria: "Brote de Replica",
  },
  sections: [
    {
      id: "inicio",
      label: "Inicio",
      path: "/",
      iconName: "Feather",
      description: "Tu hoja de escribir diaria, las pastillas de ánimo y la réplica al guardar.",
      comingInStep: "Paso 5 (Inicio)",
    },
    {
      id: "notas",
      label: "Notas",
      path: "/notas",
      iconName: "NotebookText",
      description: "Tus notas agrupadas por día, filtros de búsqueda y la réplica de tu día.",
      comingInStep: "Paso 6 (Notas y Chat)",
    },
    {
      id: "evolucion",
      label: "Evolución",
      path: "/evolucion",
      iconName: "ChartSpline",
      description: "Curva de cómo te sentiste, temas y patrones, y tu tela de constancia.",
      comingInStep: "Paso 7 (Evolución y Usuario)",
    },
    {
      id: "chat",
      label: "Chat",
      path: "/chat",
      iconName: "MessageCircle",
      description: "Canal seguro con tu psicólogo verificado, coordinación de sesiones por Meet y compartir diario.",
      comingInStep: "Paso 6 (Notas y Chat)",
    },
    {
      id: "usuario",
      label: "Usuario",
      path: "/usuario",
      iconName: "CircleUserRound",
      description: "Tu espacio privado, ajustes de tono de la réplica, apariencia y cuenta.",
      comingInStep: "Paso 7 (Evolución y Usuario)",
    },
  ] as NavItem[],
  footerLinks: {
    playground: "Abrir Playground de UI",
  },
} as const;
