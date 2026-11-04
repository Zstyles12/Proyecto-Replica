// Gemini solo se llama desde aquí. Se le manda lo mínimo: el texto de las notas no privadas, el primer
// nombre y el tono. Los registros nunca guardan el texto de una nota.

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// Se puede cambiar sin desplegar de nuevo: npx supabase secrets set GEMINI_MODEL=...
const MODEL = () => Deno.env.get("GEMINI_MODEL") ?? "gemini-3.5-flash-lite";
const TIMEOUT_MS = 30_000;

// Gemini se negó por sus filtros de seguridad. Pasa justo con las notas más difíciles: quien llama
// responde con la réplica fija, nunca con un error.
export class GeminiBlocked extends Error {}

type Schema = Record<string, unknown>;
export type Turn = { role: string; text: string };

type GeminiResponse = {
  promptFeedback?: { blockReason?: string };
  candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[];
};

// prompt es un mensaje o, en el chat, la conversación entera, turno por turno.
export async function askGemini(system: string, prompt: string | Turn[], schema: Schema): Promise<unknown> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("Falta GEMINI_API_KEY");

  const res = await fetch(`${BASE}/${MODEL()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: (typeof prompt === "string" ? [{ role: "user", text: prompt }] : prompt).map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });
  if (!res.ok) {
    // Solo códigos: el mensaje de Google es texto libre y estos registros no deben guardar texto.
    const failure = (await res.json().catch(() => null)) as { error?: { status?: string; details?: { reason?: string }[] } } | null;
    const reason = failure?.error?.details?.find((d) => d.reason)?.reason ?? "";
    throw new Error(`Gemini respondió ${res.status} ${failure?.error?.status ?? ""} ${reason}`.trim());
  }

  const data = (await res.json()) as GeminiResponse;
  const candidate = data.candidates?.[0];
  if (data.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
    throw new GeminiBlocked("Gemini bloqueó la respuesta");
  }
  const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new Error(`Gemini no devolvió texto (${candidate?.finishReason ?? "sin motivo"})`);
  return JSON.parse(text);
}
