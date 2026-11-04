// Una línea de atención o un número de emergencias (RF-60). Cada una con su página oficial y la fecha
// en que se comprobó: un número sin fuente comprobada no se publica.
export type HelpResource = {
  id: string;
  // Código del país (ISO 3166-1), como "VE".
  country: string;
  kind: "line" | "emergency";
  name: string;
  // El número tal como se marca o se lee ("0800-29832-01", "*4141").
  contact: string;
  description: string;
  sourceUrl: string;
  // "2026-11-03"
  checkedAt: string;
};

export interface HelpService {
  resources(): Promise<HelpResource[]>;
}
