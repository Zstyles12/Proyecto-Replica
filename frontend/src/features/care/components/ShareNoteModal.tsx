import React from "react";
import { X, NotebookText, ArrowRight } from "lucide-react";
import { journalService, type Entry } from "../../../services/journal";
import { CHAT_CONTENT } from "../../../data/chatContent";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareNote: (entry: Entry) => void;
}

export const ShareNoteModal: React.FC<ShareNoteModalProps> = ({
  isOpen,
  onClose,
  onShareNote,
}) => {
  if (!isOpen) return null;

  const { shareNoteModal } = CHAT_CONTENT;
  const moods = PLAYGROUND_CONTENT.moods;

  // Solo notas públicas (las notas privadas nunca se comparten)
  const publicEntries = journalService
    .getEntries()
    .filter((e) => !e.is_private);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-section-enter">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-surface-raised border border-border/50 p-6 md:p-8 space-y-5 shadow-raised relative">
        <div className="flex items-center justify-between pb-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <NotebookText size={18} className="text-voice" />
            <h2 className="font-replica text-xl font-medium text-foreground">
              {shareNoteModal.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="font-voice text-xs text-muted-foreground">
          {shareNoteModal.description}
        </p>

        {publicEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-surface-sunken border border-border/20 text-center">
            <p className="font-voice text-xs text-subtle">
              {shareNoteModal.emptyNotes}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {publicEntries.map((entry) => {
              const moodObj = moods.find((m) => m.id === entry.mood);
              const formattedDate = new Intl.DateTimeFormat("es-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(entry.created_at));

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    onShareNote(entry);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onShareNote(entry);
                      onClose();
                    }
                  }}
                  className="p-4 rounded-xl bg-surface border border-border/40 hover:border-voice/60 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs text-subtle">
                    <div className="flex items-center gap-2">
                      {moodObj && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: moodObj.colorVar }}
                        />
                      )}
                      <span className="font-medium text-foreground">
                        {moodObj?.name || entry.mood}
                      </span>
                      <span>·</span>
                      <span>#{entry.tag}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-voice opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                      <span>{shareNoteModal.shareButton}</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  <p className="font-voice text-xs text-foreground line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>

                  <span className="block text-[10px] text-subtle font-mono">
                    {formattedDate}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 text-xs text-foreground font-medium transition-colors cursor-pointer"
          >
            {shareNoteModal.cancelButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareNoteModal;
