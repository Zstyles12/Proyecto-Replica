import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  // Si dice que no se pudo enviar, el texto vuelve al campo.
  onSend: (text: string) => Promise<boolean>;
  disabled?: boolean;
  // Un botón antes del campo, como "Compartir una nota" en el chat con el psicólogo.
  leading?: React.ReactNode;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, leading }) => {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !disabled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const sent = text;
    setText("");
    onSend(sent).then((ok) => {
      if (!ok) setText((current) => current || sent);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-md border border-border/40 bg-surface-raised p-2 shadow-xs ${leading ? "" : "pl-4"}`}
    >
      {leading}
      <label htmlFor="chat-message" className="sr-only">
        Escribe un mensaje
      </label>
      <input
        id="chat-message"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Escribe un mensaje"}
        disabled={disabled}
        autoComplete="off"
        className="min-h-11 min-w-0 flex-1 bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
      />

      <button
        type="submit"
        disabled={!canSend}
        aria-label="Enviar"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-small active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
          canSend
            ? "cursor-pointer bg-voice text-voice-foreground shadow-xs hover:bg-voice/90"
            : "cursor-not-allowed border border-border/30 bg-surface-sunken text-subtle opacity-60"
        }`}
      >
        <Send size={16} aria-hidden="true" />
      </button>
    </form>
  );
};

export default ChatInput;
