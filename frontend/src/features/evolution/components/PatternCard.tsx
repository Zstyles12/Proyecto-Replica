import React from "react";
import { Sparkles, MoonStar } from "lucide-react";
import type { Pattern } from "../../profile/metrics";
import { MOOD_ITEMS } from "../../journal/moods";

interface PatternCardProps {
  pattern: Pattern;
}

export const PatternCard: React.FC<PatternCardProps> = ({ pattern }) => {
  const moods = MOOD_ITEMS;
  const moodObj = pattern.mood ? moods.find((m) => m.id === pattern.mood) : null;
  const color = moodObj?.colorVar || "var(--voice)";

  return (
    <div className="p-4 rounded-2xl bg-surface-raised border border-border/40 shadow-xs space-y-3 select-none">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            color,
          }}
        >
          {pattern.mood ? <Sparkles size={16} /> : <MoonStar size={16} />}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-replica text-base font-medium text-foreground truncate">
            {pattern.title}
          </h4>
          <p className="text-xs text-muted-foreground font-voice truncate">
            {pattern.subtitle}
          </p>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-surface-sunken border border-border/25">
        <p className="text-xs text-muted-foreground font-voice leading-relaxed">
          {pattern.detail}
        </p>
      </div>
    </div>
  );
};

export default PatternCard;
