/**
 * Fuente única de verdad para la navegación y las secciones principales de Replica.
 * Cumple con el principio de no improvisar copy ni estructura (Regla 2).
 * Íconos oficiales 1:1 con la app móvil (replica mobile/zairo/components/navigation/floating-tab-bar.tsx).
 */

export type NavIconName =
  | "Feather"
  | "NotebookText"
  | "ChartSpline"
  | "MessageCircle"
  | "CircleUserRound"
  | "LayoutGrid"
  | "ClipboardCheck"
  | "SquarePen";

export interface NavItem {
  id: string;
  label: string;
  // El nombre en la barra inferior, cuando el completo no cabe.
  shortLabel?: string;
  path: string;
  iconName: NavIconName;
}

export interface ProfessionalArea {
  // El rótulo bajo el logotipo.
  label: string;
  // Lo que se le suma a la navegación de siempre y a Usuario.
  entry: NavItem;
  entryHint: string;
  sections: NavItem[];
}

const DIARY: NavItem = { id: "mi-diario", label: "Mi diario", path: "/", iconName: "SquarePen" };

const PANEL: NavItem = {
  id: "panel",
  label: "Panel profesional",
  shortLabel: "Panel",
  path: "/profesional/dashboard",
  iconName: "LayoutGrid",
};

const REQUESTS: NavItem = {
  id: "solicitudes",
  label: "Solicitudes",
  path: "/profesional/admin",
  iconName: "ClipboardCheck",
};

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
  // El área de cada rol (DESIGN-WEB.md §10).
  areas: {
    psychologist: {
      label: "Área profesional",
      entry: PANEL,
      entryHint: "Tus pacientes, tus mensajes y tu agenda",
      sections: [
        { ...PANEL, label: "Panel", shortLabel: undefined },
        { id: "mensajes", label: "Mensajes", path: "/profesional/mensajes", iconName: "MessageCircle" },
        DIARY,
      ],
    },
    admin: {
      label: "Administración",
      entry: REQUESTS,
      entryHint: "Revisa las solicitudes de verificación",
      sections: [REQUESTS, DIARY],
    },
  } as Record<"psychologist" | "admin", ProfessionalArea>,
  footerLinks: {
    playground: "Abrir Playground de UI",
  },
} as const;
