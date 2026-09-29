import React, { useState } from "react";
import { Share, Quote } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { AnimatedHeart } from "../../../components/motion/AnimatedHeart";
import { playSound } from "../../../lib/sounds";

interface DailyChestCardProps {
  tag: string;
  quote: string;
  author: string;
}

/**
 * Tarjeta de frase del cofre según Sección 6 de DESIGN.md y zairo-main/features/cofre/components/phrase-card.tsx:
 * - Etiqueta en malva ('FRASE DEL DÍA', 'DESTILADO POR REPLICA', 'CITA DEL DÍA').
 * - Comillas rellenas en malva (fill-reply text-reply) 1:1 con la app móvil.
 * - Frase en Alegreya Italic 20 px.
 * - Autor en pequeño al pie.
 * - Botones redondos de acción (40 px):
 *   1. Compartir con el ícono Share oficial en salvia (voice), con sonido 'guardado'.
 *   2. Corazón interactivo AnimatedHeart con sonido 'favorito' al activar y 'favoritoQuitar' al desactivar.
 */
export const DailyChestCard: React.FC<DailyChestCardProps> = ({
  tag,
  quote,
  author,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`"${quote}" — ${author} (vía Replica)`);
    setCopied(true);
    playSound("guardado");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    playSound(next ? "favorito" : "favoritoQuitar");
  };

  return (
    <Card variant="raised" className="space-y-4 relative overflow-hidden">
      {/* Etiqueta superior y comillas rellenas en malva (Sección 6 y phrase-card.tsx) */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-reply uppercase tracking-[0.7px]">
          {tag}
        </span>
        <Quote
          size={18}
          fill="currentColor"
          className="text-reply fill-reply shrink-0"
          aria-hidden="true"
        />
      </div>

      {/* Cita en Alegreya Italic 20 px */}
      <blockquote className="font-replica italic text-xl md:text-2xl font-normal text-foreground leading-snug">
        "{quote}"
      </blockquote>

      {/* Pie con autor y acciones redondas de 40 px */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <span className="text-xs text-subtle font-voice truncate pr-2">
          {author}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {/* Botón compartir con ícono oficial Share en salvia */}
          <button
            type="button"
            onClick={handleShare}
            title={copied ? "¡Copiado al portapapeles!" : "Compartir cita"}
            aria-label="Compartir cita"
            className="w-10 h-10 rounded-full bg-surface-sunken hover:bg-surface border border-border/30 flex items-center justify-center text-voice transition-all duration-small active:scale-[0.96] cursor-pointer"
          >
            <Share size={17} strokeWidth={2} className="text-voice" />
          </button>

          {/* Botón favorito con corazón animado (latido + rotura física) */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            title={isFavorite ? "Quitar de mi cofre" : "Guardar en mi cofre"}
            aria-label={isFavorite ? "Quitar de mi cofre" : "Guardar en mi cofre"}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-small active:scale-[0.96] cursor-pointer ${
              isFavorite
                ? "bg-emotion-soft/40 border-emotion/40"
                : "bg-surface-sunken hover:bg-surface border-border/30"
            }`}
          >
            <AnimatedHeart
              active={isFavorite}
              size={18}
              color="var(--emotion)"
              outlineColor="var(--voice)"
            />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DailyChestCard;
