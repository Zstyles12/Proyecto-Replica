import React, { useState, useEffect } from "react";
import { PenLine } from "lucide-react";
import { EVOLUCION_CONTENT } from "../../../data/evolucionContent";

interface WritingSummaryProps {
  words: number;
  notes: number;
  days: number;
}

export const WritingSummary: React.FC<WritingSummaryProps> = ({
  words,
  notes,
  days,
}) => {
  const [animatedWords, setAnimatedWords] = useState(0);
  const { writing: copy } = EVOLUCION_CONTENT;

  // Animación progresiva del conteo numérico (900 ms)
  useEffect(() => {
    let start = 0;
    const duration = 900;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedWords(Math.round(start + (words - start) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [words]);

  return (
    <div className="p-5 rounded-2xl bg-surface-raised border border-border/40 shadow-xs flex items-center gap-4 select-none">
      <div className="w-12 h-12 rounded-2xl bg-voice text-voice-foreground flex items-center justify-center shrink-0 shadow-xs">
        <PenLine size={22} />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <h4 className="font-replica text-xl md:text-2xl font-medium text-foreground tracking-tight">
          {animatedWords.toLocaleString("es-ES")} {copy.wordsWritten}
        </h4>
        <p className="text-xs text-muted-foreground font-voice">
          {notes} {notes === 1 ? copy.notePrefix : copy.notesPrefix} {days} {copy.daysSuffix}
        </p>
      </div>
    </div>
  );
};

export default WritingSummary;
