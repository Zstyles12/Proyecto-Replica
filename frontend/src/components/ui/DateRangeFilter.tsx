import React, { useId } from "react";
import { inputDate } from "../../lib/format";
import type { DateRange } from "./dateRange";

// Atajos: los últimos 7 o 30 días, contando hoy, o todo.
function lastDays(days: number): DateRange {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: inputDate(from), to: inputDate(new Date()) };
}

/**
 * Un rango de fechas (DESIGN-WEB.md §10): "Desde" y "Hasta" con su `label`, y atajos para lo de siempre.
 * Las fechas van en hora local, como `YYYY-MM-DD`; vacío quiere decir sin límite.
 */
export const DateRangeFilter: React.FC<{ value: DateRange; onChange: (value: DateRange) => void; className?: string }> = ({
  value,
  onChange,
  className = "",
}) => {
  const fromId = useId();
  const toId = useId();
  const shortcuts: [string, DateRange][] = [
    ["7 días", lastDays(7)],
    ["30 días", lastDays(30)],
    ["Todo", { from: "", to: "" }],
  ];
  const input =
    "h-11 w-full rounded-md border border-border/70 bg-surface-raised px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice";

  return (
    <fieldset className={`space-y-2 ${className}`}>
      <legend className="sr-only">Fechas</legend>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor={fromId} className="text-[13px] text-muted-foreground">
            Desde
          </label>
          <input id={fromId} type="date" className={input} value={value.from} max={value.to || undefined} onChange={(e) => onChange({ ...value, from: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label htmlFor={toId} className="text-[13px] text-muted-foreground">
            Hasta
          </label>
          <input id={toId} type="date" className={input} value={value.to} min={value.from || undefined} onChange={(e) => onChange({ ...value, to: e.target.value })} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {shortcuts.map(([label, range]) => {
          const active = range.from === value.from && range.to === value.to;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(range)}
              className={`min-h-11 rounded-full border px-4 text-[13px] transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                active ? "border-voice/50 bg-voice/10 text-voice" : "border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
