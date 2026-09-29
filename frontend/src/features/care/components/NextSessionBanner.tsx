import React from "react";
import { Video, ExternalLink } from "lucide-react";
import type { Appointment } from "../../../services/care";
import { CHAT_CONTENT } from "../../../data/chatContent";

interface NextSessionBannerProps {
  appointment: Appointment | null;
}

export const NextSessionBanner: React.FC<NextSessionBannerProps> = ({
  appointment,
}) => {
  if (!appointment) return null;

  const { nextSession } = CHAT_CONTENT;

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(appointment.starts_at));

  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="p-3.5 rounded-2xl bg-surface-raised border border-border/40 flex items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-voice-soft flex items-center justify-center text-voice shrink-0">
          <Video size={18} />
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-voice block">
            {nextSession.title}
          </span>
          <p className="text-xs md:text-sm text-foreground font-voice font-medium">
            {capitalizedDate} · {nextSession.platform}
          </p>
        </div>
      </div>

      <a
        href={appointment.meet_link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={nextSession.joinAria}
        className="px-3.5 py-1.5 rounded-full bg-voice hover:bg-voice-hover text-voice-foreground text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.97] shrink-0"
      >
        <span>{nextSession.joinButton}</span>
        <ExternalLink size={12} />
      </a>
    </div>
  );
};

export default NextSessionBanner;
