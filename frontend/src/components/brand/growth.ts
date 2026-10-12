// Las etapas de la racha (components/brand/growth-icon.tsx de la app).
export type GrowthStage = "semilla" | "brote" | "plantita" | "flor";

// Semilla de 1 a 9 días, brote de 10 a 19, plantita de 20 a 49 y flor desde 50.
export function stageFor(days: number): GrowthStage {
  if (days >= 50) return "flor";
  if (days >= 20) return "plantita";
  if (days >= 10) return "brote";
  return "semilla";
}
