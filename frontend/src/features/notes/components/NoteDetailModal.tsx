import React from "react";
import { X, Lock, Trash2, MoonStar } from "lucide-react";
import type { Entry, AIReply, DayReply } from "../../../services/journal";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";
import { NOTAS_CONTENT } from "../../../data/notasContent";
import { AnimatedHeart } from "../../../components/motion/AnimatedHeart";
import { playSound } from "../../../lib/sounds";

interface NoteDetailModalProps {
  entry: Entry | null;
  reply: AIReply | null;
  dayReply: DayReply | null;
  onClose: () => void;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  entry,
  reply,
  dayReply,
  onClose,
  onToggleFavorite,
  onDelete,
}) => {
  if (!entry && !dayReply) return null;

  const { noteDetail, dayReply: dayReplyCopy } = NOTAS_CONTENT;
  const moods = PLAYGROUND_CONTENT.moods;

  // Si es un modal para la réplica del día
  if (dayReply && !entry) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-section-enter">
        <div className="w-full max-w-lg rounded-3xl bg-surface-raised border border-reply/40 p-6 md:p-8 space-y-6 shadow-raised relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-reply">
              <MoonStar size={16} />
              <span>{dayReplyCopy.badge}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="font-replica text-2xl md:text-3xl font-normal text-foreground leading-snug">
            "{dayReply.headline}"
          </h2>

          <div className="p-4 rounded-2xl bg-reply-soft/30 border border-reply/30 space-y-3">
            <p className="font-replica italic text-base md:text-lg text-reply leading-relaxed">
              {dayReply.synthesis}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-subtle pt-2 border-t border-border/20">
            <span>
              {dayReplyCopy.notesCountPrefix} {dayReply.notes_count} {dayReplyCopy.notesCountSuffix}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 text-xs font-medium text-foreground cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal para una nota individual
  if (!entry) return null;

  const moodObj = moods.find((m) => m.id === entry.mood);
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(entry.created_at));

  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      const next = !entry.is_favorite;
      onToggleFavorite(entry.id);
      playSound(next ? "favorito" : "favoritoQuitar");
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(noteDetail.confirmDelete)) {
      if (onDelete) onDelete(entry.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-section-enter">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface-raised border border-border/50 p-6 md:p-8 space-y-6 shadow-raised relative">
        {/* Barra superior con metadatos y botones */}
        <div className="flex items-center justify-between pb-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            {moodObj && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: `color-mix(in srgb, ${moodObj.colorVar} 14%, transparent)`,
                  borderColor: `color-mix(in srgb, ${moodObj.colorVar} 40%, transparent)`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: moodObj.colorVar }}
                />
                <span className="text-foreground">{moodObj.name}</span>
              </span>
            )}
            <span className="text-xs text-muted-foreground font-voice">
              #{entry.tag}
            </span>
            {entry.is_private && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-sunken text-xs font-medium text-subtle border border-border/30">
                <Lock size={12} className="text-voice" />
                <span>{noteDetail.privateBadge}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={handleFavoriteClick}
                aria-label={noteDetail.favoriteAria}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-small active:scale-[0.92] cursor-pointer ${
                  entry.is_favorite
                    ? "bg-emotion-soft/40 border-emotion/40"
                    : "bg-surface hover:bg-surface-sunken border-border/30"
                }`}
              >
                <AnimatedHeart
                  active={entry.is_favorite}
                  size={17}
                  color="var(--emotion)"
                  outlineColor="var(--voice)"
                />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={noteDetail.closeAria}
              className="w-9 h-9 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Fecha */}
        <p className="text-xs text-subtle font-voice">{capitalizedDate}</p>

        {/* Texto completo de la nota */}
        <div className="font-voice text-base md:text-lg text-foreground leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </div>

        {/* Bloque de réplica de IA (si existe y no es privada) */}
        {reply && !entry.is_private && (
          <div className="p-5 rounded-2xl bg-reply-soft/25 border border-reply/30 space-y-4 pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-reply uppercase tracking-wider">
              <span>🌱</span>
              <span>{noteDetail.replySectionTitle}</span>
            </div>

            <h3 className="font-replica text-xl font-normal text-foreground leading-snug">
              {reply.title}
            </h3>

            <p className="font-replica italic text-base text-reply leading-relaxed">
              {reply.content}
            </p>

            {reply.questions && reply.questions.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-reply/20">
                <span className="text-[11px] font-semibold text-subtle uppercase tracking-wider block">
                  {noteDetail.reflectionQuestionsTitle}
                </span>
                <ul className="space-y-1.5 text-xs text-foreground font-voice list-disc list-inside">
                  {reply.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Pie con botón de eliminar */}
        <div className="flex items-center justify-between pt-4 border-t border-border/20 text-xs">
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="text-destructive/80 hover:text-destructive flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <Trash2 size={14} />
              <span>{noteDetail.deleteNote}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-surface-raised hover:bg-surface border border-border/40 text-foreground font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteDetailModal;
