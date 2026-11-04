import type { HelpResource } from "../services/help/types";

// Los países con líneas comprobadas. Por ahora solo Venezuela: la persona responsable solo puede
// comprobar las de allí. Desde cualquier otro país se ve "Otro país", sin ningún número.
export const HELP_COUNTRIES: { code: string; name: string }[] = [{ code: "VE", name: "Venezuela" }];

// La zona horaria del navegador sugiere el país al entrar; la persona lo cambia en el selector.
const ZONES: [RegExp, string][] = [[/^America\/Caracas$/, "VE"]];

export function countryOfZone(zone: string): string | null {
  return ZONES.find(([re]) => re.test(zone))?.[1] ?? null;
}

// La web simulada muestra la misma lista que la migración 20261103000001_ayuda_y_chat_con_la_ia.sql,
// comprobada en su fuente oficial el 3 de noviembre de 2026. Si cambia una, cambian las dos.
const CHECKED = "2026-11-03";

export const HELP_RESOURCES: HelpResource[] = [
  {
    id: "ve-orientacion",
    country: "VE",
    kind: "line",
    name: "Línea de orientación psicológica",
    contact: "0800-29832-01",
    description: "0800-AYUDA-01, del Ministerio de Salud. Gratuita, de lunes a viernes de 8:00 a 20:00.",
    sourceUrl: "https://mpps.gob.ve/salud-mental-post-sismo-un-esfuerzo-colectivo-para-una-buena-recuperacion-emocional/",
    checkedAt: CHECKED,
  },
  {
    id: "ve-fpv-lapsi",
    country: "VE",
    kind: "line",
    name: "Línea de Atención Psicológica (LAPSI)",
    contact: "0424-2907338",
    description: "De la Federación de Psicólogos de Venezuela. Primeros auxilios psicológicos e intervención en crisis.",
    // La publicación de la cuenta oficial de la Federación (fpv_ve), del 29 de junio de 2026.
    sourceUrl: "https://www.instagram.com/p/DaK-Eovpdo2/",
    checkedAt: CHECKED,
  },
];
