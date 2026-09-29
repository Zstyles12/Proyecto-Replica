import React from "react";
import type { Message } from "../../../services/care";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";
import { NotebookText } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  psychologistInitials: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  psychologistInitials,
}) => {
  const isPsychologist = message.from === "psychologist";

  const timeFormatted = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.created_at));

  const moods = PLAYGROUND_CONTENT.moods;
  const moodObj = message.note_preview
    ? moods.find((m) => m.id === message.note_preview?.mood)
    : null;

  return (
    <div
      className={`flex items-end gap-2.5 my-2 animate-section-enter ${
        isPsychologist ? "justify-start" : "justify-end"
      }`}
    >
      {/* Avatar del psicólogo */}
      {isPsychologist && (
        <div className="w-8 h-8 rounded-full bg-voice-soft text-voice flex items-center justify-center text-xs font-semibold shrink-0 select-none shadow-xs border border-border/30">
          {psychologistInitials}
        </div>
      )}

      {/* Burbuja principal */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 space-y-1.5 shadow-xs ${
          isPsychologist
            ? "bg-surface-raised border border-border/40 text-foreground rounded-bl-sm"
            : "bg-voice text-voice-foreground rounded-br-sm"
        }`}
      >
        {/* Si es una nota compartida incrustada */}
        {message.kind === "shared_note" && message.note_preview && (
          <div
            className={`p-3 rounded-xl border mb-2 space-y-1.5 ${
              isPsychologist
                ? "bg-surface border-border/40"
                : "bg-surface text-foreground border-border/40"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-voice font-semibold">
              <NotebookText size={13} />
              <span>Nota compartida del diario</span>
            </div>
            <p className="font-voice text-xs italic text-foreground line-clamp-3">
              "{message.note_preview.content}"
            </p>
            <div className="flex items-center gap-2 text-[10px] text-subtle">
              {moodObj && <span>Ánimo: {moodObj.name}</span>}
              <span>·</span>
              <span>#{message.note_preview.tag}</span>
            </div>
          </div>
        )}

        {/* Texto del mensaje */}
        <p className="font-voice text-sm leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>

        {/* Hora del mensaje */}
        <span
          className={`block text-[10px] text-right ${
            isPsychologist ? "text-subtle" : "text-voice-foreground/75"
          }`}
        >
          {timeFormatted}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
