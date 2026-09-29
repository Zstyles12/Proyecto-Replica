import React from "react";
import type { MoodCount } from "../../../services/metrics";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";
import { EVOLUCION_CONTENT } from "../../../data/evolucionContent";

interface MoodBarsProps {
  counts: MoodCount[];
  periodDays: number;
}

export const MoodBars: React.FC<MoodBarsProps> = ({ counts, periodDays }) => {
  const moods = PLAYGROUND_CONTENT.moods;
  const { moodBars: copy } = EVOLUCION_CONTENT;

  if (counts.length === 0) return null;

  const maxDays = Math.max(...counts.map((c) => c.days), 1);

  return (
    <div className="space-y-3 pt-2 select-none">
      <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
        {copy.title}
      </span>

      <div className="space-y-2.5">
        {counts.map(({ mood, days }) => {
          const moodObj = moods.find((m) => m.id === mood);
          const color = moodObj?.colorVar || "var(--voice)";
          const name = moodObj?.name || mood;
          const percentage = Math.round((days / periodDays) * 100);
          const barWidthPercent = Math.max((days / maxDays) * 100, 6);

          return (
            <div key={mood} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-foreground">{name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                  <span>
                    {days} {days === 1 ? copy.daySuffix : copy.daysSuffix}
                  </span>
                  <span className="text-subtle font-sans">({percentage}%)</span>
                </div>
              </div>

              {/* Pista de la barra */}
              <div className="h-2 w-full rounded-full bg-surface-sunken overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${barWidthPercent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodBars;
