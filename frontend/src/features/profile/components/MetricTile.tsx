import React from "react";
import type { LucideIcon } from "lucide-react";

interface MetricTileProps {
  icon: LucideIcon;
  tint?: "voice" | "reply" | "emotion" | "neutral";
  label: string;
  value: number | string;
  unit?: string;
  caption: string;
  dot?: string;
  onClick?: () => void;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  icon: Icon,
  tint = "voice",
  label,
  value,
  unit,
  caption,
  dot,
  onClick,
}) => {
  const tintClasses = {
    voice: "bg-voice-soft text-voice",
    reply: "bg-reply-soft text-reply",
    emotion: "bg-emotion-soft text-emotion",
    neutral: "bg-surface-sunken text-muted-foreground",
  }[tint];

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`p-4 rounded-2xl bg-surface-raised border border-border/40 shadow-xs space-y-2 select-none transition-all duration-small ${
        onClick
          ? "cursor-pointer hover:border-border/80 active:scale-[0.98]"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-voice pr-2">
          {label}
        </span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs ${tintClasses}`}
        >
          <Icon size={14} />
        </div>
      </div>

      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          {dot && (
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: dot }}
            />
          )}
          <span className="font-replica text-2xl font-medium text-foreground tracking-tight">
            {typeof value === "number" ? value.toLocaleString("es-ES") : value}
          </span>
          {unit && (
            <span className="text-xs text-muted-foreground font-voice">
              {unit}
            </span>
          )}
        </div>

        <p className="text-[11px] text-voice font-medium">
          {caption}
        </p>
      </div>
    </div>
  );
};

export default MetricTile;
