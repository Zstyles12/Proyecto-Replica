import React, { useState, useMemo } from "react";
import type { ClothDay } from "../../profile/metrics";
import { MOOD_ITEMS } from "../../journal/moods";
import { EVOLUCION_CONTENT } from "../../../data/evolucionContent";

interface WovenClothProps {
  columns: ClothDay[][];
}

export const WovenCloth: React.FC<WovenClothProps> = ({ columns }) => {
  const [hoveredDay, setHoveredDay] = useState<ClothDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<ClothDay | null>(null);

  const moods = MOOD_ITEMS;
  const { cloth: copy } = EVOLUCION_CONTENT;
  const rowLabels = copy.dayLabels || { 0: "L", 2: "X", 4: "V", 6: "D" };

  // Formato natural de fecha en español con primera letra mayúscula
  const formatDate = (d: Date) => {
    const formatted = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(d);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Métricas agregadas de la tela para el estado en reposo
  const activeDaysCount = useMemo(
    () => columns.flat().filter((d) => !d.future && d.count > 0).length,
    [columns]
  );

  const activeDay = hoveredDay || selectedDay;

  // Color de la celda según cantidad de notas (escala de hilos salvia sin penalización)
  const getCellColor = (day: ClothDay, isActive: boolean) => {
    if (day.future) return "bg-surface-sunken/40 border-border/10 opacity-30 cursor-default";
    const base =
      day.count === 0
        ? "bg-transparent border-border/60 hover:border-border"
        : day.count === 1
        ? "bg-cloth-1 border-cloth-1"
        : day.count === 2
        ? "bg-cloth-2 border-cloth-2"
        : "bg-cloth-3 border-cloth-3";

    if (isActive) {
      return `${base} ring-2 ring-voice ring-offset-2 ring-offset-surface-raised scale-110 z-10`;
    }
    return base;
  };

  return (
    <div className="space-y-5 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-replica text-lg font-medium text-foreground">
            {copy.title}
          </h3>
          <p className="text-xs text-muted-foreground font-voice">
            {copy.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
        {/* Columna Izquierda: Matriz de 12 semanas y leyenda */}
        <div className="space-y-3">
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <div className="inline-flex gap-1.5">
              {/* Etiquetas de fila (L, X, V, D) perfectamente alineadas con las celdas */}
              <div className="flex flex-col gap-1.5 text-[10px] text-subtle font-mono select-none pr-1">
                {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                  <span key={row} className="h-[18px] flex items-center justify-center">
                    {rowLabels[row] || ""}
                  </span>
                ))}
              </div>

              {/* 12 Columnas de Semanas. Celdas de 18 px a 6 px: 24 px entre centros (WCAG 2.5.8). Los 44 px
                  no caben en 12 semanas a 375 px. */}
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  {col.map((day, rowIdx) => (
                    <button
                      key={rowIdx}
                      type="button"
                      disabled={day.future}
                      aria-label={`Día ${formatDate(day.date)}: ${day.count} notas`}
                      title={`Día ${formatDate(day.date)}: ${day.count} notas`}
                      aria-pressed={selectedDay === day}
                      onClick={() => {
                        if (day.future) return;
                        setSelectedDay((prev) => (prev === day ? null : day));
                      }}
                      onMouseEnter={() => {
                        if (!day.future) setHoveredDay(day);
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      onFocus={() => {
                        if (!day.future) setHoveredDay(day);
                      }}
                      onBlur={() => setHoveredDay(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setSelectedDay(null);
                          setHoveredDay(null);
                        }
                      }}
                      className={`w-[18px] h-[18px] rounded-[4px] border transition-all duration-150 cursor-pointer active:scale-95 disabled:cursor-default disabled:pointer-events-none disabled:active:scale-100 ${getCellColor(
                        day,
                        activeDay === day
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Leyenda sutil al pie de la matriz */}
          <div className="flex items-center justify-between text-[11px] text-subtle pt-2 border-t border-border/20 max-w-[340px]">
            <span>Menos notas</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-[3px] border border-border/60" />
              <span className="w-3 h-3 rounded-[3px] bg-cloth-1" />
              <span className="w-3 h-3 rounded-[3px] bg-cloth-2" />
              <span className="w-3 h-3 rounded-[3px] bg-cloth-3" />
            </div>
            <span>Más notas</span>
          </div>
        </div>

        {/* Columna Derecha: Panel integrado aprovechando el espacio en blanco */}
        <div className="p-4 md:p-5 rounded-2xl bg-surface border border-border/40 shadow-xs min-h-[140px] flex flex-col justify-center space-y-2 transition-all duration-200">
          {activeDay ? (
            <div className="space-y-2 animate-section-enter">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-voice uppercase tracking-wider">
                  {selectedDay === activeDay ? "Día elegido" : "Este día"}
                </span>
                {selectedDay === activeDay && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <h4 className="font-replica text-base md:text-lg font-normal text-foreground">
                {formatDate(activeDay.date)}
              </h4>
              <p className="font-voice text-xs text-muted-foreground">
                {activeDay.future
                  ? ""
                  : activeDay.count === 0
                  ? "Sin notas escritas este día"
                  : activeDay.count === 1
                  ? copy.tooltipOneNote
                  : `${activeDay.count} ${copy.tooltipMultipleNotes}`}
              </p>
              {activeDay.moods.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {activeDay.moods.map((mId) => {
                    const moodObj = moods.find((m) => m.id === mId);
                    const name = moodObj?.name || mId;
                    const color = moodObj?.colorVar || "var(--voice)";
                    return (
                      <span
                        key={mId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-voice border"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
                          borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                          color: "var(--foreground)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                        <span>{name}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 animate-section-enter">
              <h4 className="font-replica text-base md:text-lg font-normal text-foreground">
                Escribiste {activeDaysCount} de los últimos 84 días.
              </h4>
              <p className="font-voice text-[11px] text-subtle pt-1">
                Pasa el cursor o toca un día para ver su detalle.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WovenCloth;
