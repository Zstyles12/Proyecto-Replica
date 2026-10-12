import { Compass, Feather, NotebookPen, ShieldCheck, Sprout, Wind, type LucideIcon } from "lucide-react";

// Qué te trae a Replica (features/auth/components/intention-picker.tsx de la app).
export const INTENTIONS: { title: string; line: string; icon: LucideIcon }[] = [
  { title: "Entenderme mejor", line: "Ver lo que siento", icon: Compass },
  { title: "Bajar la ansiedad", line: "Soltar lo que pesa", icon: Wind },
  { title: "Procesar mi día", line: "Ordenar lo vivido", icon: NotebookPen },
  { title: "Poner límites sin culpa", line: "Cuidar mi espacio", icon: ShieldCheck },
  { title: "Sanar algo que pasó", line: "Darle lugar al dolor", icon: Sprout },
  { title: "Solo quiero escribir", line: "Un rato para mí", icon: Feather },
];

export const INTENTION_TITLES = INTENTIONS.map((i) => i.title);
