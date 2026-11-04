// Señales claras de riesgo para la web simulada (RF-61). Es la misma lista que la red del servidor
// (supabase/functions/_shared/risk.ts); con Supabase, lo decide el servidor y esto no se usa.
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
