/**
 * Fuente única de verdad para la navegación y las secciones principales de Replica.
 * Cumple con el principio de no improvisar copy ni estructura (Regla 2).
 * Íconos oficiales 1:1 con la app móvil (replica mobile/zairo/components/navigation/floating-tab-bar.tsx).
 */

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: "Feather" | "NotebookText" | "ChartSpline" | "MessageCircle" | "CircleUserRound";
}

export const NAVIGATION_CONTENT = {
  brand: {
    name: "Replica",
  },
  sections: [
    {
      id: "inicio",
      label: "Inicio",
      path: "/",
      iconName: "Feather",
    },
    {
      id: "notas",
      label: "Notas",
      path: "/notas",
      iconName: "NotebookText",
    },
    {
      id: "evolucion",
      label: "Evolución",
      path: "/evolucion",
      iconName: "ChartSpline",
    },
    {
      id: "chat",
      label: "Chat",
      path: "/chat",
      iconName: "MessageCircle",
    },
    {
      id: "usuario",
      label: "Usuario",
      path: "/usuario",
      iconName: "CircleUserRound",
    },
  ] as NavItem[],
  footerLinks: {
    playground: "Abrir Playground de UI",
  },
} as const;
