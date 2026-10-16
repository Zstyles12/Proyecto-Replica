import { BOX, FLOWER_CENTER_R, FLOWER_IN, FLOWER_OUT, WORD } from "../../components/brand/logoGeometry";
import type { Phrase } from "./store";

// La imagen para compartir (DESIGN.md, "Imagen para compartir"; features/cofre/components/share-card.tsx
// de la app): 9:16, 1080 × 1920, con fondos fijos que no dependen del tema. La frase manda, sobre
// renglones finísimos que van a la mitad de su interlineado (apoya en uno de cada dos, como escrita en
// el cuaderno); arriba la etiqueta, debajo el autor si es una cita y abajo solo el logotipo, apoyado en
// el último renglón. Nunca nada de la nota de la que salió.
//
// Son colores de una imagen que sale de la app, no de la interfaz: por eso van fijos aquí.
export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1920;
const W = 360;
const H = 640;
const SCALE = SHARE_WIDTH / W;

export type ShareStyle = "salvia" | "malva" | "noche" | "papel";

// El logotipo en la versión de cada fondo (docs/marca de la app, Fondos): claro en Papel y Malva,
// oscuro en Noche, blanco de una tinta en Salvia. Los valores son los de los tokens de DESIGN.md.
type WordPaint = { word: string; reply: string; soft: string } | { ink: string };
const LOGO_CLARO: WordPaint = { word: "#171D1A", reply: "#655975", soft: "#ECDCFD" };
const LOGO_OSCURO: WordPaint = { word: "#E5E1E4", reply: "#D0C1E0", soft: "#2E2638" };

export const SHARE_STYLES: Record<ShareStyle, { label: string; background: string; text: string; accent: string; muted: string; logo: WordPaint }> = {
  salvia: { label: "Salvia", background: "#325346", text: "#F4FAF6", accent: "#C6EAD8", muted: "rgba(244,250,246,0.7)", logo: { ink: "#FFFFFF" } },
  malva: { label: "Malva", background: "#ECDCFD", text: "#171D1A", accent: "#655975", muted: "rgba(23,29,26,0.62)", logo: LOGO_CLARO },
  noche: { label: "Noche", background: "#131315", text: "#E5E1E4", accent: "#A7CFBE", muted: "rgba(229,225,228,0.6)", logo: LOGO_OSCURO },
  papel: { label: "Papel", background: "#F5FBF6", text: "#171D1A", accent: "#325346", muted: "rgba(23,29,26,0.6)", logo: LOGO_CLARO },
};
export const SHARE_ORDER: ShareStyle[] = ["salvia", "malva", "noche", "papel"];

const KIND_LABEL: Record<Phrase["kind"], string> = {
  replica: "Destilado por Replica",
  aliento: "Frase del día",
  cita: "Cita del día",
};

// Letra más grande cuanto más corta es la frase, para que siempre llene la imagen con aire.
// El interlineado es el doble del renglón: la frase apoya en uno de cada dos.
function textSize(text: string) {
  if (text.length <= 40) return { size: 36, line: 48 };
  if (text.length <= 80) return { size: 31, line: 42 };
  if (text.length <= 120) return { size: 27, line: 36 };
  return { size: 24, line: 32 };
}

const PAD = 36;
// El renglón pasa justo bajo la línea base.
const ON_LINE = 4;
// Los renglones parten del logotipo, que va siempre en el mismo lugar.
const LOGO_RULE = H - 52;
const LOGO_WIDTH = 84;
// La frase se centra entre la etiqueta y el logotipo.
const BLOCK_TOP = 120;
const BLOCK_BOTTOM = H - 96;
const SYSTEM = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// El logotipo con la geometría del kit: la palabra a curvas y la nomeolvides sobre la i.
function drawWordmark(ctx: CanvasRenderingContext2D, paint: WordPaint) {
  ctx.fillStyle = "ink" in paint ? paint.ink : paint.word;
  ctx.fill(new Path2D(WORD.glyphs.join("")));
  ctx.save();
  ctx.translate(WORD.flower.x, WORD.flower.y);
  ctx.scale(WORD.flower.scale, WORD.flower.scale);
  const center = new Path2D();
  center.arc(60, 60, FLOWER_CENTER_R, 0, Math.PI * 2);
  if ("ink" in paint) {
    // Una tinta: el contorno de la flor (sin relleno) y su centro.
    ctx.fillStyle = paint.ink;
    ctx.fill(new Path2D(FLOWER_OUT + FLOWER_IN), "evenodd");
    ctx.fill(center);
  } else {
    ctx.fillStyle = paint.reply;
    ctx.fill(new Path2D(FLOWER_OUT));
    ctx.fillStyle = paint.soft;
    ctx.fill(new Path2D(FLOWER_IN));
    ctx.fillStyle = paint.reply;
    ctx.fill(center);
  }
  ctx.restore();
}

export async function drawShareImage(canvas: HTMLCanvasElement, phrase: Phrase, variant: ShareStyle) {
  const s = SHARE_STYLES[variant];
  const { size, line } = textSize(phrase.text);
  await document.fonts.load(`italic 400 ${size * SCALE}px Alegreya`).catch(() => undefined);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = SHARE_WIDTH;
  canvas.height = SHARE_HEIGHT;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, W, H);

  // Los renglones del cuaderno, muy tenues (el texto al 8 %).
  const pitch = line / 2;
  const phase = LOGO_RULE % pitch;
  const ruleNear = (y: number) => phase + Math.round((y - phase) / pitch) * pitch;
  ctx.fillStyle = s.text;
  ctx.globalAlpha = 0.08;
  for (let y = phase; y < H; y += pitch) ctx.fillRect(0, y, W, 0.6);
  ctx.globalAlpha = 1;

  // La etiqueta.
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = s.accent;
  ctx.font = `600 12px ${SYSTEM}`;
  ctx.letterSpacing = "1.6px";
  ctx.fillText(KIND_LABEL[phrase.kind].toUpperCase(), PAD, 98);
  ctx.letterSpacing = "0px";

  // La frase, centrada entre la etiqueta y el logotipo, con cada línea apoyada en un renglón.
  ctx.font = `italic 400 ${size}px Alegreya, serif`;
  const lines = wrap(ctx, phrase.text, W - PAD * 2);
  const height = lines.length * line + (phrase.author ? line : 0);
  const baselineInLine = (line - size) / 2 + size * 0.86;
  const centered = (BLOCK_TOP + BLOCK_BOTTOM) / 2 - height / 2;
  let y = ruleNear(centered + baselineInLine + ON_LINE) - ON_LINE;
  ctx.fillStyle = s.text;
  for (const text of lines) {
    ctx.fillText(text, PAD, y);
    y += line;
  }
  if (phrase.author) {
    ctx.fillStyle = s.muted;
    ctx.font = `500 15px ${SYSTEM}`;
    ctx.letterSpacing = "0.3px";
    ctx.fillText(`— ${phrase.author}`, PAD, y);
    ctx.letterSpacing = "0px";
  }

  // La marca: solo el logotipo, con su línea base apoyada en el último renglón.
  const [bx, , bw] = BOX.logotipo;
  const k = LOGO_WIDTH / bw;
  ctx.save();
  // El mismo lugar que en la app: su caja empieza en PAD - bx·k, así que el origen va bx·k más a la izquierda.
  ctx.translate(PAD - 2 * bx * k, LOGO_RULE - ON_LINE);
  ctx.scale(k, k);
  drawWordmark(ctx, s.logo);
  ctx.restore();
}
