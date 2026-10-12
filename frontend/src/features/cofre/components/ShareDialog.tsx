import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { usePhrase, type Phrase } from "../store";
import { closeShare, useSharingKey } from "../share";
import { playSound } from "../../../lib/sounds";

// La imagen para compartir (DESIGN.md §6 y features/cofre/components/share-card.tsx): 9:16, 1080 × 1920,
// con fondos fijos que no dependen del tema. La frase, el autor si es una cita y la marca de Replica;
// nunca nada de la nota de la que salió.
const WIDTH = 1080;
const HEIGHT = 1920;
const SCALE = WIDTH / 360;

type ShareStyle = "salvia" | "malva" | "noche" | "papel";
const STYLES: Record<ShareStyle, { label: string; background: string; text: string; accent: string; muted: string; glow: string }> = {
  salvia: { label: "Salvia", background: "#325346", text: "#F4FAF6", accent: "#C6EAD8", muted: "rgba(244,250,246,0.7)", glow: "#A7CFBE" },
  malva: { label: "Malva", background: "#ECDCFD", text: "#171D1A", accent: "#655975", muted: "rgba(23,29,26,0.62)", glow: "#FFFFFF" },
  noche: { label: "Noche", background: "#131315", text: "#E5E1E4", accent: "#A7CFBE", muted: "rgba(229,225,228,0.6)", glow: "#2E2638" },
  papel: { label: "Papel", background: "#F5FBF6", text: "#171D1A", accent: "#325346", muted: "rgba(23,29,26,0.6)", glow: "#C6EAD8" },
};
const ORDER: ShareStyle[] = ["salvia", "malva", "noche", "papel"];

const KIND_LABEL: Record<Phrase["kind"], string> = {
  replica: "Destilado por Replica",
  aliento: "Frase del día",
  cita: "Cita del día",
};

// Letra más grande cuanto más corta es la frase, para que siempre llene la imagen con aire.
function textSize(text: string) {
  if (text.length <= 40) return 36;
  if (text.length <= 80) return 31;
  if (text.length <= 120) return 27;
  return 24;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
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

async function draw(canvas: HTMLCanvasElement, phrase: Phrase, variant: ShareStyle) {
  const s = STYLES[variant];
  const size = textSize(phrase.text);
  await Promise.all([
    document.fonts.load(`italic 400 ${size * SCALE}px Alegreya`),
    document.fonts.load(`500 ${20 * SCALE}px Alegreya`),
  ]).catch(() => undefined);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  ctx.fillStyle = s.background;
  ctx.fillRect(0, 0, 360, 640);

  // La urdimbre de la app, muy tenue.
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = s.text;
  for (let i = 0; i < 15; i += 1) ctx.fillRect(12 + i * 24, 0, 0.5, 640);
  ctx.globalAlpha = 1;

  // Dos halos suaves.
  ctx.fillStyle = s.glow;
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  ctx.arc(360 + 10, 40, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.09;
  ctx.beginPath();
  ctx.arc(-30, 640 - 190 - 120, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = s.accent;
  ctx.font = `600 12px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.letterSpacing = "1.6px";
  ctx.fillText(KIND_LABEL[phrase.kind].toUpperCase(), 36, 108);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = s.text;
  ctx.font = `italic 400 ${size}px Alegreya, serif`;
  const lines = wrap(ctx, `“${phrase.text}”`, 288);
  const lineHeight = size * 1.32;
  const blockHeight = lines.length * lineHeight;
  let y = 140 + (640 - 140 - 150 - blockHeight) / 2 + size;
  for (const line of lines) {
    ctx.fillText(line, 36, y);
    y += lineHeight;
  }
  if (phrase.kind === "cita" && phrase.author) {
    ctx.fillStyle = s.muted;
    ctx.font = `500 15px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(`— ${phrase.author}`, 36, y + 14);
  }

  // La marca: el hilo que va y vuelve, y el nombre.
  ctx.lineCap = "round";
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = s.accent;
  ctx.beginPath();
  ctx.moveTo(36, 584);
  ctx.lineTo(58, 584);
  ctx.bezierCurveTo(66, 584, 66, 596, 58, 596);
  ctx.stroke();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(58, 596);
  ctx.lineTo(40, 596);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = s.text;
  ctx.font = `500 20px Alegreya, serif`;
  ctx.fillText("Replica", 74, 597);
}

function toBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}

/** Compartir una frase como imagen (app/compartir-frase.tsx): una sola hoja para toda la web. */
export const ShareDialog: React.FC = () => {
  const key = useSharingKey();
  const phrase = usePhrase(key ?? undefined);
  const [variant, setVariant] = useState<ShareStyle>("salvia");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canShareFiles] = useState(() => {
    try {
      const probe = new File([new Blob()], "replica.png", { type: "image/png" });
      return typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] });
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (phrase && canvasRef.current) draw(canvasRef.current, phrase, variant);
  }, [phrase, variant]);

  // Otra frase: el aviso de la anterior se va.
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setStatus("idle");
  }

  const file = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const blob = await toBlob(canvas);
    return blob ? new File([blob], "replica-frase.png", { type: "image/png" }) : null;
  };

  const share = async () => {
    const f = await file();
    if (!f) return setStatus("error");
    try {
      await navigator.share({ files: [f] });
    } catch {
      // Cancelado por la persona: no es un error.
    }
  };

  const save = async () => {
    const f = await file();
    if (!f) return setStatus("error");
    const url = URL.createObjectURL(f);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
    playSound("guardado");
    setStatus("saved");
  };

  return (
    <Dialog
      open={!!phrase}
      onClose={closeShare}
      title="Compartir frase"
      description="Una imagen para tus estados e historias. Solo lleva la frase, nunca lo que escribiste."
      size="md"
      footer={
        <div className="flex w-full flex-wrap gap-2">
          {canShareFiles ? (
            <Button className="flex-1" onClick={share}>
              Compartir
            </Button>
          ) : null}
          <Button variant={canShareFiles ? "secondary" : "primary"} className="flex-1" onClick={save}>
            {status === "saved" ? "Imagen guardada" : "Guardar imagen"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={phrase ? `Imagen con la frase: ${phrase.text}` : undefined}
          className="mx-auto block aspect-[9/16] w-[180px] rounded-md shadow-raised"
        />
        <div role="radiogroup" aria-label="Fondo" className="flex justify-center gap-3">
          {ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={variant === s}
              aria-label={`Fondo ${STYLES[s].label}`}
              onClick={() => setVariant(s)}
              className="flex flex-col items-center gap-1 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              <span
                className={`h-10 w-10 rounded-full border-2 ${variant === s ? "border-voice" : "border-border/60"}`}
                style={{ backgroundColor: STYLES[s].background }}
              />
              <span className={`text-xs ${variant === s ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{STYLES[s].label}</span>
            </button>
          ))}
        </div>
        {status === "error" ? (
          <p role="alert" className="text-center text-[13px] text-emotion">
            No pudimos crear la imagen. Intenta de nuevo.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
};
