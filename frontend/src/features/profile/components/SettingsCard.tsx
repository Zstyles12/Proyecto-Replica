import React, { useState } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

interface SettingsCardProps {
  icon: LucideIcon;
  tint?: "voice" | "reply" | "emotion" | "neutral";
  title: string;
  subtitle: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  icon: Icon,
  tint = "voice",
  title,
  subtitle,
  summary,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const tintClasses = {
    voice: "bg-voice-soft text-voice",
    reply: "bg-reply-soft text-reply",
    emotion: "bg-emotion-soft text-emotion",
    neutral: "bg-surface-sunken text-muted-foreground",
  }[tint];

  return (
    <div className="rounded-2xl bg-surface-raised border border-border/40 shadow-xs overflow-hidden select-none transition-all">
      {/* Cabecera clicable para desplegar/plegar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${tintClasses}`}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-replica text-lg font-medium text-foreground truncate">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground font-voice truncate">
              {isOpen ? subtitle : summary ?? subtitle}
            </p>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`text-subtle shrink-0 transition-transform duration-200 ease-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenido desplegable con animación fluida en CSS grid */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 border-t border-border/20"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 sm:p-5 pt-4 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsCard;
