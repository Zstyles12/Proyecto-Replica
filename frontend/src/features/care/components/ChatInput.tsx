import React, { useState } from "react";
import { Send, NotebookText } from "lucide-react";
import { CHAT_CONTENT } from "../../../data/chatContent";

interface ChatInputProps {
  onSend: (text: string) => void;
  onOpenShareNote: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onOpenShareNote,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const { input } = CHAT_CONTENT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-surface-raised border border-border/40 rounded-2xl flex items-center gap-2 shadow-sm"
    >
      {/* Botón para compartir nota del diario */}
      <button
        type="button"
        onClick={onOpenShareNote}
        title={input.shareNoteTooltip}
        aria-label={input.shareNoteTooltip}
        className="w-10 h-10 rounded-full bg-surface hover:bg-surface-sunken border border-border/30 flex items-center justify-center text-voice transition-colors shrink-0 cursor-pointer active:scale-[0.96]"
      >
        <NotebookText size={18} strokeWidth={2} />
      </button>

      {/* Campo de texto */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={input.placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label={input.sendAria}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-small shrink-0 cursor-pointer active:scale-[0.96] ${
          text.trim() && !disabled
            ? "bg-voice text-voice-foreground shadow-xs hover:bg-voice-hover"
            : "bg-surface-sunken text-subtle border border-border/30 cursor-not-allowed opacity-60"
        }`}
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default ChatInput;
