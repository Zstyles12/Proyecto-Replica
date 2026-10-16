import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "../../../components/ui/Dialog";
import { Button } from "../../../components/ui/Button";
import { usePhrase } from "../store";
import { closeShare, useSharingKey } from "../share";
import { playSound } from "../../../lib/sounds";
import { SHARE_ORDER, SHARE_STYLES, drawShareImage, type ShareStyle } from "../shareImage";

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
    if (phrase && canvasRef.current) drawShareImage(canvasRef.current, phrase, variant);
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
          {SHARE_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={variant === s}
              aria-label={`Fondo ${SHARE_STYLES[s].label}`}
              onClick={() => setVariant(s)}
              className="flex flex-col items-center gap-1 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              <span
                className={`h-10 w-10 rounded-full border-2 ${variant === s ? "border-voice" : "border-border/60"}`}
                style={{ backgroundColor: SHARE_STYLES[s].background }}
              />
              <span className={`text-xs ${variant === s ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{SHARE_STYLES[s].label}</span>
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
