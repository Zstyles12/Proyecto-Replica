import React from "react";
import type { MoodCount } from "../../profile/metrics";
import { MOOD_LABELS, moodColor } from "../../journal/moods";
import { EVOLUCION_CONTENT } from "../../../data/evolucionContent";

interface MoodBarsProps {
  counts: MoodCount[];
  periodDays: number;
}

// Cada barra es su parte del total de días con ánimo, sobre un riel, como la app
// (features/profile/components/mood-bars.tsx).
export const MoodBars: React.FC<MoodBarsProps> = ({ counts, periodDays }) => {
  const { moodBars: copy } = EVOLUCION_CONTENT;
  const total = Math.max(
    1,
    counts.reduce((sum, c) => sum + c.days, 0)
  );

  return (
    <div className="space-y-3 pt-2 select-none">
      <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
        {copy.title}
      </span>

      {counts.length === 0 ? (
        <p className="text-[13px] leading-[18px] text-muted-foreground">
          Todavía no elegiste un ánimo en estos {periodDays} días. Cuando lo hagas al escribir, aparecerá aquí.
        </p>
      ) : (
        <div role="list" className="space-y-2.5">
          {counts.map((c) => (
            <div
              key={c.mood}
              role="listitem"
              aria-label={`${MOOD_LABELS[c.mood]}: ${c.days} ${c.days === 1 ? copy.daySuffix : copy.daysSuffix}`}
              className="flex items-center gap-3"
            >
              <div className="w-[92px] shrink-0 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: moodColor(c.mood) }}
                />
                <span className="truncate text-sm text-foreground">
                  {MOOD_LABELS[c.mood]}
                </span>
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="h-full min-w-[8px] rounded transition-[width] duration-enter ease-out motion-reduce:transition-none"
                  style={{
                    width: `${(c.days / total) * 100}%`,
                    backgroundColor: moodColor(c.mood),
                  }}
                />
              </div>
              <span className="w-[52px] text-right text-[13px] leading-[18px] tabular-nums text-muted-foreground shrink-0">
                {c.days} {c.days === 1 ? copy.daySuffix : copy.daysSuffix}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodBars;
