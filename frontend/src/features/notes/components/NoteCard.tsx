import React from "react";
import { Lock } from "lucide-react";
import type { Entry, AIReply } from "../../../services/journal";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";
import { AnimatedHeart } from "../../../components/motion/AnimatedHeart";
import { playSound } from "../../../lib/sounds";

interface NoteCardProps {
  entry: Entry;
  reply?: AIReply | null;
  onToggleFavorite: (id: string) => void;
  onOpenDetail: (entry: Entry) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  entry,
  reply,
  onToggleFavorite,
  onOpenDetail,
}) => {
  const moods = PLAYGROUND_CONTENT.moods;
  const moodObj = moods.find((m) => m.id === entry.mood);

  // Formato de hora
  const timeFormatted = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(entry.created_at));

  // Extraer título (primera oración o frase) y cuerpo restante
  const parts = entry.content.split("\n").filter((p) => p.trim());
  const title = parts[0] || entry.content;
  const bodyRest = parts.slice(1).join(" ") || "";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !entry.is_favorite;
    onToggleFavorite(entry.id);
    playSound(next ? "favorito" : "favoritoQuitar");
  };

  return (
    <div
      onClick={() => onOpenDetail(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(entry);
        }
      }}
      aria-label={`Nota sobre ${entry.tag}, ánimo ${moodObj?.name || entry.mood}`}
      className="p-4 rounded-2xl bg-surface-raised border border-border/40 hover:border-border/80 transition-all duration-small cursor-pointer shadow-xs active:scale-[0.99] space-y-2.5 select-none"
    >
      {/* Cabecera de la tarjeta: Ánimo, Hora, Insignia privada y Corazón */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {moodObj && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: `color-mix(in srgb, ${moodObj.colorVar} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${moodObj.colorVar} 35%, transparent)`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: moodObj.colorVar }}
              />
              <span className="text-foreground">{moodObj.name}</span>
            </div>
          )}
          <span className="text-subtle font-voice">{timeFormatted}</span>
        </div>

        <div className="flex items-center gap-2">
          {entry.is_private && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-sunken text-[11px] font-medium text-subtle border border-border/30"
              title="Nota privada: no compartida con la IA ni terapeuta"
            >
              <Lock size={11} className="text-voice" />
              <span>Privada</span>
            </span>
          )}

          {/* Botón de favorito con física AnimatedHeart y sonidos */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={
              entry.is_favorite ? "Quitar de favoritas" : "Marcar como favorita"
            }
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-small active:scale-[0.92] cursor-pointer ${
              entry.is_favorite
                ? "bg-emotion-soft/40 border-emotion/40"
                : "bg-surface hover:bg-surface-sunken border-border/30"
            }`}
          >
            <AnimatedHeart
              active={entry.is_favorite}
              size={16}
              color="var(--emotion)"
              outlineColor="var(--voice)"
            />
          </button>
        </div>
      </div>

      {/* Título y cuerpo de la nota */}
      <div className="space-y-1">
        <h3 className="font-replica text-base md:text-lg font-normal text-foreground leading-snug line-clamp-2">
          {title}
        </h3>
        {bodyRest && (
          <p className="font-voice text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {bodyRest}
          </p>
        )}
      </div>

      {/* Bloque extracto de réplica (si tiene) */}
      {reply && !entry.is_private && (
        <div className="p-2.5 rounded-xl bg-reply-soft/25 border border-reply/25 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-reply shrink-0" />
          <p className="font-replica italic text-xs text-reply truncate">
            "{reply.title}"
          </p>
        </div>
      )}

      {/* Pie con etiqueta de tema */}
      <div className="pt-1 flex items-center justify-between text-xs text-subtle font-voice">
        <span>#{entry.tag}</span>
      </div>
    </div>
  );
};

export default NoteCard;
