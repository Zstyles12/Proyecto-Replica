// Señales claras de riesgo en lo que escribió la persona (RF-61, RN-10). Gemini decide con la
// instrucción de seguridad; esto solo es la red por si no lo marca. Nunca diagnostica: si coincide, la
// web enlaza a la ayuda en crisis, nada más. La web simulada usa la misma lista (frontend/src/lib/risk.ts).

const SIGNALS = [
  /\bsuicid/,
  /\bmatarme\b/,
  /\bquitarme la vida\b/,
  /\bno quiero (seguir )?vivir\b/,
  /\bquiero morir(me)?\b/,
  /\bmorirme\b/,
  /\bhacerme da[nñ]o\b/,
  /\bautolesi/,
  /\bcortarme\b/,
  /\bno vale la pena vivir\b/,
  /\bdesaparecer para siempre\b/,
  /\bacabar con todo\b/,
  /\bme (pega|golpea|maltrata)\b/,
  /\babus(o|aron|a de m[ií])\b/,
];

export function showsRisk(text: string) {
  const plain = text.toLowerCase();
  return SIGNALS.some((signal) => signal.test(plain));
}
