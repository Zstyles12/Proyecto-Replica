import React, { useState, useMemo } from "react";
import type { CurvePoint, CurveAxisLabel, CurvePeriod } from "../../profile/metrics";
import { MOOD_ITEMS } from "../../journal/moods";
import { EVOLUCION_CONTENT } from "../../../data/evolucionContent";

interface MoodCurveProps {
  points: CurvePoint[];
  axis: CurveAxisLabel[];
  period: CurvePeriod;
}

const HEIGHT = 180;
const PAD_TOP = 28;
const PAD_BOTTOM = 32;
const PAD_X = 24;

/**
 * Curva suave que pasa por cada punto sin sobrepasarse de ellos (cúbica monótona, Fritsch–Carlson, 1:1 con mobile curve-path.ts):
 * entre dos días "Agradable" la línea no sube por encima de Agradable ni baja de Difícil.
 */
function buildMonotoneSvgPath(coords: { x: number; y: number }[]): string {
  const n = coords.length;
  if (n < 2) return "";

  const secants = coords
    .slice(0, -1)
    .map((c, i) => (coords[i + 1].y - c.y) / (coords[i + 1].x - c.x || 1));

  const tangents = coords.map((_, i) => {
    if (i === 0) return secants[0] ?? 0;
    if (i === n - 1) return secants[n - 2] ?? 0;
    return secants[i - 1] * secants[i] <= 0 ? 0 : (secants[i - 1] + secants[i]) / 2;
  });

  secants.forEach((m, i) => {
    if (m === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      return;
    }
    const a = tangents[i] / m;
    const c = tangents[i + 1] / m;
    const s = a * a + c * c;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      tangents[i] = tau * a * m;
      tangents[i + 1] = tau * c * m;
    }
  });

  let d = `M ${coords[0].x.toFixed(2)} ${coords[0].y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i += 1) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const third = (p2.x - p1.x) / 3;
    const cp1x = (p1.x + third).toFixed(2);
    const cp1y = (p1.y + tangents[i] * third).toFixed(2);
    const cp2x = (p2.x - third).toFixed(2);
    const cp2y = (p2.y - tangents[i + 1] * third).toFixed(2);
    const p2x = p2.x.toFixed(2);
    const p2y = p2.y.toFixed(2);
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2x} ${p2y}`;
  }
  return d;
}

export const MoodCurve: React.FC<MoodCurveProps> = ({ points, axis, period }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const moods = MOOD_ITEMS;
  const { moodCurve: copy } = EVOLUCION_CONTENT;

  // Ancho virtual del SVG viewBox
  const VIEW_WIDTH = 640;
  const innerW = VIEW_WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const py = React.useCallback(
    (v: number) => PAD_TOP + (1 - (v + 2) / 4) * innerH,
    [innerH]
  );
  const px = React.useCallback(
    (x: number) => PAD_X + x * innerW,
    [innerW]
  );

  const coords = useMemo(() => {
    return points.map((p) => ({
      x: px(p.x),
      y: py(p.valence),
      point: p,
    }));
  }, [points, px, py]);

  // Generador de curva cúbica monótona suave Fritsch-Carlson para SVG
  const { linePath, areaPath } = useMemo(() => {
    if (coords.length < 2) return { linePath: "", areaPath: "" };

    const d = buildMonotoneSvgPath(coords);
    const last = coords[coords.length - 1];
    const first = coords[0];
    const bottomY = HEIGHT - PAD_BOTTOM;
    const a = `${d} L ${last.x.toFixed(2)} ${bottomY} L ${first.x.toFixed(2)} ${bottomY} Z`;

    return { linePath: d, areaPath: a };
  }, [coords]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activePoint = activeIndex !== null ? coords[activeIndex] : null;

  if (points.length === 0) {
    return (
      <div className="py-12 px-4 text-center space-y-2 select-none">
        <p className="font-voice text-sm text-muted-foreground leading-relaxed">
          {copy.emptyNotice}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative select-none">
      {/* Texto de estado superior 1:1 con la experiencia mobile */}
      <div className="min-h-[28px] flex items-center justify-between text-xs transition-colors py-0.5">
        {activePoint ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
              style={{
                backgroundColor:
                  moods.find((m) => m.id === activePoint.point.mood)?.colorVar ||
                  "var(--voice)",
              }}
            />
            <span className="font-semibold text-foreground">
              {activePoint.point.label}
            </span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground font-voice">
              {activePoint.point.detail}
            </span>
            {selectedIndex !== null && (
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="text-[11px] text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer"
              >
                Restablecer
              </button>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground font-voice">
            {copy.instructions?.[period] ||
              (period === "ano"
                ? "Desliza el ratón sobre la curva para ver cada mes."
                : period === "mes"
                ? "Desliza el ratón sobre la curva para ver cada semana."
                : "Desliza el ratón sobre la curva para ver cada día.")}
          </span>
        )}
      </div>

      {/* Contenedor SVG con desbordamiento visible para tooltips elegantes sin cortes */}
      <div className="relative w-full overflow-visible">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible cursor-default"
          onClick={() => setSelectedIndex(null)}
        >
          <defs>
            {/* Gradiente vertical para el área rellena */}
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--voice)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--voice)" stopOpacity="0.0" />
            </linearGradient>

            {/* Gradiente horizontal a lo largo del trazo con los colores de cada ánimo */}
            <linearGradient id="curveStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              {coords.map((c, i) => {
                const moodObj = moods.find((m) => m.id === c.point.mood);
                const color = moodObj?.colorVar || "var(--voice)";
                const pct = ((c.x / VIEW_WIDTH) * 100).toFixed(1);
                return <stop key={i} offset={`${pct}%`} stopColor={color} />;
              })}
            </linearGradient>
          </defs>

          {/* Líneas Guía Horizontales (+2 Agradable, 0 Neutro, -2 Difícil) */}
          <line
            x1={PAD_X}
            y1={py(2)}
            x2={VIEW_WIDTH - PAD_X}
            y2={py(2)}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.4}
          />
          <text
            x={PAD_X}
            y={py(2) - 6}
            fill="var(--subtle)"
            fontSize={10}
            fontFamily="system-ui"
          >
            {copy.pleasantLabel}
          </text>

          <line
            x1={PAD_X}
            y1={py(0)}
            x2={VIEW_WIDTH - PAD_X}
            y2={py(0)}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.25}
          />

          <line
            x1={PAD_X}
            y1={py(-2)}
            x2={VIEW_WIDTH - PAD_X}
            y2={py(-2)}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.4}
          />
          <text
            x={PAD_X}
            y={py(-2) + 14}
            fill="var(--subtle)"
            fontSize={10}
            fontFamily="system-ui"
          >
            {copy.difficultLabel}
          </text>

          {/* Área sombreada bajo la curva */}
          {areaPath && <path d={areaPath} fill="url(#curveGradient)" />}

          {/* Trazo continuo con interpolación cúbica monótona Fritsch-Carlson */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#curveStrokeGrad)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Línea vertical indicadora al interactuar con un punto */}
          {activePoint && (
            <g pointerEvents="none">
              <line
                x1={activePoint.x}
                y1={PAD_TOP - 8}
                x2={activePoint.x}
                y2={HEIGHT - PAD_BOTTOM + 4}
                stroke="var(--foreground)"
                strokeWidth={1.5}
                strokeOpacity={0.16}
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* Puntos de datos interactivos */}
          {coords.map((c, i) => {
            const moodObj = moods.find((m) => m.id === c.point.mood);
            const color = moodObj?.colorVar || "var(--voice)";
            const isActive = activeIndex === i;
            const isSelected = selectedIndex === i;

            return (
              <g
                key={i}
                className="cursor-pointer focus:outline-hidden"
                tabIndex={0}
                role="button"
                aria-label={`${c.point.label}: ${c.point.detail}`}
                aria-pressed={isSelected}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev === i ? null : i));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev === i ? null : i));
                  } else if (e.key === "Escape") {
                    setSelectedIndex(null);
                    setHoveredIndex(null);
                  } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    // Las flechas recorren la curva de un punto al siguiente.
                    e.preventDefault();
                    const points = Array.from(
                      e.currentTarget.parentElement?.querySelectorAll<SVGGElement>("g[role='button']") ?? []
                    );
                    const at = points.indexOf(e.currentTarget);
                    points[at + (e.key === "ArrowRight" ? 1 : -1)]?.focus();
                  }
                }}
              >
                {/* Zona de impacto táctil ampliada */}
                <circle cx={c.x} cy={c.y} r={18} fill="transparent" />

                {/* Halo sereno al interactuar (sin transformaciones descontroladas de SVG) */}
                {isActive && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isSelected ? 11 : 10}
                    fill={color}
                    opacity={isSelected ? 0.35 : 0.25}
                    className="transition-all duration-200 pointer-events-none"
                  />
                )}

                {/* Aro exterior */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isActive ? 6.5 : 4.5}
                  fill={color}
                  stroke="var(--surface-raised)"
                  strokeWidth={2.5}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Ejes inferiores con etiquetas de tiempo */}
          {axis.map((ax, i) => {
            const x = px(ax.x);
            return (
              <g key={i}>
                <text
                  x={x}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  fill="var(--subtle)"
                  fontSize={11}
                  fontWeight={500}
                  fontFamily="system-ui"
                >
                  {ax.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip inteligente con anclaje perimetral proporcional para NUNCA desalinearse ni cortarse */}
        {activePoint && (() => {
          const xPercent = (activePoint.x / VIEW_WIDTH) * 100;
          const yPercent = (activePoint.y / HEIGHT) * 100;
          const isNearTop = yPercent < 45;
          const moodColor =
            moods.find((m) => m.id === activePoint.point.mood)?.colorVar ||
            "var(--voice)";

          const inlineStyle: React.CSSProperties = {
            top: `${yPercent.toFixed(1)}%`,
          };
          let posClasses = "";

          // Anclaje horizontal responsivo
          if (xPercent > 70) {
            inlineStyle.right = "8px";
          } else if (xPercent < 30) {
            inlineStyle.left = "8px";
          } else {
            inlineStyle.left = `${xPercent.toFixed(1)}%`;
            posClasses += "-translate-x-1/2 ";
          }

          // Anclaje vertical proporcional según altura del punto
          if (isNearTop) {
            posClasses += "mt-3";
          } else {
            posClasses += "-translate-y-full -mt-3";
          }

          return (
            <div
              className={`absolute z-30 pointer-events-none p-3 rounded-2xl bg-surface-raised border border-border/70 shadow-raised text-xs space-y-1 transition-all duration-100 min-w-[170px] max-w-[260px] animate-section-enter ${posClasses}`}
              style={inlineStyle}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-1.5">
                <span className="font-semibold text-foreground truncate">
                  {activePoint.point.label}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: moodColor }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-voice leading-snug">
                {activePoint.point.detail}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Si solo hay 1 punto en el período, avisar amablemente */}
      {points.length === 1 && (
        <p className="text-[11px] text-subtle font-voice text-center">
          Se traza la curva continua al tener dos o más notas con ánimo en este período.
        </p>
      )}
    </div>
  );
};

export default MoodCurve;
