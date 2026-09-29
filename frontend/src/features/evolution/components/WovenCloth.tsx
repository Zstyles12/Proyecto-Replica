import React, { useState, useMemo } from "react";
import type { ClothDay } from "../../../services/metrics";
import { PLAYGROUND_CONTENT } from "../../../data/playgroundContent";
import { EVOLUCION_CONTENT } from "../../../data/evolucionContent";

interface WovenClothProps {
  columns: ClothDay[][];
}

export const WovenCloth: React.FC<WovenClothProps> = ({ columns }) => {
  const [hoveredDay, setHoveredDay] = useState<ClothDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<ClothDay | null>(null);

  const moods = PLAYGROUND_CONTENT.moods;
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
  const totalNotes = useMemo(
    () =>
      columns
        .flat()
        .filter((d) => !d.future)
        .reduce((acc, d) => acc + d.count, 0),
    [columns]
  );

  const activeDay = hoveredDay || selectedDay;

  // Color de la celda según cantidad de notas (escala de hilos salvia sin penalización)
  const getCellColor = (day: ClothDay, isActive: boolean) => {
    if (day.future) return "bg-surface-sunken/40 border-border/10 opacity-30 cursor-default";
    const base =
      day.count === 0
        ? "bg-surface-sunken border-border/30 hover:border-border"
        : day.count === 1
        ? "bg-voice-soft/60 border-voice/40 hover:border-voice"
        : day.count === 2
        ? "bg-voice-soft border-voice/60 hover:border-voice"
        : "bg-voice border-voice shadow-xs";

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
            <div className="inline-flex gap-1.5 min-w-[320px]">
              {/* Etiquetas de fila (L, X, V, D) perfectamente alineadas con las celdas */}
              <div className="flex flex-col gap-1.5 text-[10px] text-subtle font-mono select-none pr-1">
                {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                  <span key={row} className="h-4 flex items-center justify-center">
                    {rowLabels[row] || ""}
                  </span>
                ))}
              </div>

              {/* 12 Columnas de Semanas */}
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
                      className={`w-4 h-4 rounded-[4px] border transition-all duration-150 cursor-pointer active:scale-95 disabled:cursor-default disabled:pointer-events-none disabled:active:scale-100 ${getCellColor(
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
              <span className="w-3 h-3 rounded-[3px] bg-surface-sunken border border-border/30" />
              <span className="w-3 h-3 rounded-[3px] bg-voice-soft/60 border border-voice/40" />
              <span className="w-3 h-3 rounded-[3px] bg-voice-soft border border-voice/60" />
              <span className="w-3 h-3 rounded-[3px] bg-voice border border-voice" />
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
                  {selectedDay === activeDay ? "Hilo fijado" : "Detalle del hilo"}
                </span>
                {selectedDay === activeDay && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Restablecer
                  </button>
                )}
              </div>
              <h4 className="font-replica text-base md:text-lg font-normal text-foreground">
                {formatDate(activeDay.date)}
              </h4>
              <p className="font-voice text-xs text-muted-foreground">
                {activeDay.future
                  ? "Día futuro en el telar"
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
              <span className="text-[11px] font-semibold text-voice uppercase tracking-wider">
                Telar de constancia
              </span>
              <h4 className="font-replica text-base md:text-lg font-normal text-foreground">
                {totalNotes} {totalNotes === 1 ? "nota tejida" : "notas tejidas"}
              </h4>
              <p className="font-voice text-xs text-muted-foreground leading-relaxed">
                {activeDaysCount} {activeDaysCount === 1 ? "día con escritura" : "días con escritura"} en las últimas 12 semanas.
              </p>
              <p className="font-voice text-[11px] text-subtle pt-1">
                Posa el cursor o pulsa cualquier hilo para ver el detalle de ese día.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WovenCloth;
