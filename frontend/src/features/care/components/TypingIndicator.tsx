import React from "react";
import { CHAT_CONTENT } from "../../../data/chatContent";

interface TypingIndicatorProps {
  psychologistName: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  psychologistName,
}) => {
  const { input } = CHAT_CONTENT;

  return (
    <div className="flex items-center gap-2.5 my-2 animate-section-enter">
      <div className="p-3 rounded-2xl bg-surface-raised border border-border/40 rounded-bl-sm shadow-xs flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-voice">
          {psychologistName} {input.typingStatus}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-voice animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-voice animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-voice animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
