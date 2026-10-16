import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Note } from "../../journal/types";
import { capitalize, dayKey } from "../../../lib/format";

export interface MonthCalendarProps {
  notes: Note[];
  onSelectDay: (dayKeyStr: string) => void;
}

const WEEK_DAYS = ["L", "M", "X", "J", "V", "S", "D"] as const;

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ notes, onSelectDay }) => {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const notesCountByDayKey = useMemo(() => {
    const map: Record<string, number> = {};
    for (const note of notes) {
      const k = dayKey(new Date(note.createdAt));
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [notes]);

  const handlePrevMonth = () => {
    setViewDate(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 };
      return { year, month: month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewDate(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 };
      return { year, month: month + 1 };
    });
  };

  const monthName = capitalize(
    new Date(viewDate.year, viewDate.month, 1).toLocaleDateString("es", { month: "long" })
  );
  const monthLabel = `${monthName} ${viewDate.year}`;

  const { startOffset, days } = useMemo(() => {
    const firstDay = new Date(viewDate.year, viewDate.month, 1);
    // Lunes = 0, Domingo = 6
    const offset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
    const today = dayKey(new Date());

    const list = [];
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const date = new Date(viewDate.year, viewDate.month, dayNum);
      const key = dayKey(date);
      const count = notesCountByDayKey[key] || 0;
      const isToday = key === today;
      const dateFormatted = date.toLocaleDateString("es", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const countText = count === 1 ? "1 nota" : `${count} notas`;
      const ariaLabel = `${dateFormatted}, ${countText}`;

      list.push({
        dayNum,
        key,
        count,
        isToday,
        ariaLabel,
      });
    }

    return { startOffset: offset, days: list };
  }, [viewDate.year, viewDate.month, notesCountByDayKey]);

  return (
    <div className="space-y-3">
      {/* Cabecera con mes, año y botones de navegación de 44x44px */}
      <div className="flex items-center justify-between">
        <h3 className="font-replica text-base font-medium text-foreground">
          {monthLabel}
        </h3>
        <div className="flex items-center">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-press active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors duration-press active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7" aria-hidden="true">
        {WEEK_DAYS.map((d, i) => (
          <span key={i} className="flex h-8 items-center justify-center text-[12px] font-semibold uppercase text-muted-foreground select-none">
            {d}
          </span>
        ))}
      </div>

      {/* Rejilla de días: cada celda ocupa su columna y 44 px de alto (área táctil), con el día dibujado
          en un cuadro de 32 px. Sin notas no es interactiva. */}
      <div className="grid grid-cols-7">
        {Array.from({ length: startOffset }, (_, i) => (
          <span key={`empty-${i}`} aria-hidden="true" className="h-11" />
        ))}
        {days.map(({ dayNum, key, count, isToday, ariaLabel }) => {
          const todayRing = isToday ? "ring-1 ring-voice ring-offset-1 ring-offset-surface-raised" : "";

          if (count === 0) {
            return (
              <span key={key} aria-current={isToday ? "date" : undefined} className="flex h-11 items-center justify-center select-none">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-xs text-muted-foreground ${todayRing}`}>
                  {dayNum}
                </span>
              </span>
            );
          }

          // La escala de la tela; el número siempre con contraste suficiente sobre su fondo.
          const colorClasses =
            count === 1
              ? "bg-cloth-1 text-foreground"
              : count === 2
                ? "bg-cloth-2 text-background"
                : "bg-cloth-3 text-voice-foreground";

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(key)}
              aria-label={ariaLabel}
              aria-current={isToday ? "date" : undefined}
              className="group flex h-11 items-center justify-center focus-visible:outline-none"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-transform duration-press group-active:scale-95 motion-reduce:transition-none group-focus-visible:ring-2 group-focus-visible:ring-voice group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-surface-raised ${colorClasses} ${todayRing}`}
              >
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leyenda sutil al pie */}
      <div className="flex items-center justify-between text-[12px] text-muted-foreground pt-2 border-t border-border/20">
        <span>Menos</span>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-3 h-3 rounded-[3px] border border-border/60 bg-transparent" />
          <span className="w-3 h-3 rounded-[3px] bg-cloth-1 border border-cloth-1" />
          <span className="w-3 h-3 rounded-[3px] bg-cloth-2 border border-cloth-2" />
          <span className="w-3 h-3 rounded-[3px] bg-cloth-3 border border-cloth-3" />
        </div>
        <span>Más notas</span>
      </div>
    </div>
  );
};

export default MonthCalendar;
