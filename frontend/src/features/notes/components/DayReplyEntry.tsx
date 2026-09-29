import React from "react";
import { MoonStar, ChevronRight } from "lucide-react";
import type { DayReply } from "../../../services/journal";
import { NOTAS_CONTENT } from "../../../data/notasContent";

interface DayReplyEntryProps {
  dayReply: DayReply;
  onOpenDetails: () => void;
}

export const DayReplyEntry: React.FC<DayReplyEntryProps> = ({
  dayReply,
  onOpenDetails,
}) => {
  const { dayReply: copy } = NOTAS_CONTENT;

  return (
    <div
      onClick={onOpenDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails();
        }
      }}
      aria-label={`${copy.badge}: ${dayReply.headline}`}
      className="p-4 rounded-2xl bg-surface-raised border border-reply/40 hover:border-reply/70 transition-all duration-small cursor-pointer shadow-xs active:scale-[0.99] space-y-2 select-none"
    >
      <div className="flex items-center justify-between text-xs text-reply font-semibold">
        <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <MoonStar size={14} className="shrink-0" />
          <span>{copy.badge}</span>
        </div>
        <ChevronRight size={16} className="text-reply/70" />
      </div>

      <p className="font-replica italic text-base md:text-lg text-foreground leading-snug">
        "{dayReply.headline}"
      </p>

      <div className="flex items-center justify-between text-xs text-subtle font-voice pt-1">
        <span>
          {copy.notesCountPrefix} {dayReply.notes_count} {copy.notesCountSuffix}
          {dayReply.has_late_reply ? ` ${copy.lateReplySuffix}` : ""}
        </span>
        <span className="text-reply hover:underline text-[11px]">
          {copy.viewComplete}
        </span>
      </div>
    </div>
  );
};

export default DayReplyEntry;
