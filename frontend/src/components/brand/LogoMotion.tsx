import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { FlowerShapes } from "./Logo";
import { LOGO_PAINT as p } from "./logoPaint";
import {
  BOX,
  EASE_LUT,
  FLOWER_IN_MARK,
  HOLES,
  LOCKUP,
  PAGE,
  RIBBON,
  RINGS,
  WORD,
  type Key,
  type Timeline,
} from "./logoGeometry";
import { WEB_TIMELINES } from "./logoTimelines";

// La firma que se arma (docs/marca de la app, Movimiento; DESIGN-WEB.md §9). Las líneas de tiempo
// vienen del kit y se evalúan igual que en components/brand/logo-motion.tsx de la app, así la web se
// mueve como la app, los videos y el manual.
//
//   motion="ola"      la bienvenida: la firma horizontal con una ola que recorre la palabra
//   motion="escribe"  "Todo listo": la firma vertical que se escribe y florece

type Prop = "o" | "tx" | "ty" | "s" | "r" | "sy" | "dash";

function ease(lut: readonly number[], u: number) {
  const x = Math.min(1, Math.max(0, u)) * (lut.length - 1);
  const i = Math.floor(x);
  if (i >= lut.length - 1) return lut[lut.length - 1];
  return lut[i] + (lut[i + 1] - lut[i]) * (x - i);
}

// Valor de una propiedad en el instante t: interpola entre los cuadros clave que la definen.
function valueAt(keys: readonly Key[], prop: Prop, t: number, fallback: number) {
  let prev: Key | null = null;
  for (const k of keys) {
    const v = k[prop];
    if (v === undefined) continue;
    if (t <= k.t) {
      if (prev === null) return v;
      const pv = prev[prop] as number;
      const u = (t - prev.t) / (k.t - prev.t);
      return pv + (v - pv) * ease(EASE_LUT[prev.e ?? "out"], u);
    }
    prev = k;
  }
  return prev === null ? fallback : (prev[prop] as number);
}

const endOf = (tl: Timeline) => Math.max(...Object.values(tl).map((k) => k[k.length - 1].t));

// Una pieza que aparece, se mueve, crece o gira (alrededor de `origin`), o un trazo que se dibuja.
type Part = { el: SVGElement; keys: readonly Key[]; origin: readonly [number, number]; trace: boolean };

function paint(part: Part, t: number) {
  const { el, keys, origin } = part;
  if (part.trace) {
    // pathLength = 100: el desfase es el % oculto (positivo, al final; negativo, borrado desde el principio).
    el.setAttribute("stroke-dashoffset", String(valueAt(keys, "dash", t, 0)));
    return;
  }
  const [ox, oy] = origin;
  const s = Math.max(0.001, valueAt(keys, "s", t, 1));
  const sy = Math.max(0.001, valueAt(keys, "sy", t, 1));
  el.setAttribute("opacity", String(valueAt(keys, "o", t, 1)));
  el.setAttribute(
    "transform",
    `translate(${valueAt(keys, "tx", t, 0) + ox} ${valueAt(keys, "ty", t, 0) + oy}) scale(${s}) rotate(${valueAt(keys, "r", t, 0)}) scale(1 ${sy}) translate(${-ox} ${-oy})`
  );
}

type LogoMotionProps = {
  motion: keyof typeof WEB_TIMELINES;
  /** Ancho del dibujo, en px. */
  width: number;
  /** Cuándo arrancar. Antes de arrancar no se ve nada; al terminar queda la marca completa. */
  play: boolean;
  delay?: number;
  onDone?: () => void;
  className?: string;
};

export const LogoMotion: React.FC<LogoMotionProps> = ({ motion, width, play, delay = 0, onDone, className }) => {
  const reduced = useReducedMotion();
  const tl: Timeline = WEB_TIMELINES[motion];
  const end = useMemo(() => endOf(tl), [tl]);
  const orientation = motion === "ola" ? "horizontal" : "vertical";
  const box = orientation === "horizontal" ? BOX["firma-horizontal"] : BOX["firma-vertical"];
  const l = LOCKUP[orientation];

  const parts = useRef(new Map<string, Part>());
  // Cada pieza se registra con su nombre en la línea de tiempo; las que no tienen cuadros quedan quietas.
  const part = useCallback(
    (name: string, origin: readonly [number, number] = [0, 0], trace = false) =>
      (el: SVGElement | null) => {
        const keys = tl[name];
        if (el && keys) parts.current.set(name, { el, keys, origin, trace });
        else parts.current.delete(name);
      },
    [tl]
  );

  const draw = useCallback((t: number) => parts.current.forEach((pt) => paint(pt, t)), []);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Antes del primer dibujo: el estado inicial (o el final, si no hay movimiento).
  useLayoutEffect(() => {
    draw(reduced ? end : 0);
  }, [draw, reduced, end]);

  useEffect(() => {
    if (!play) return;
    if (reduced) {
      draw(end);
      onDoneRef.current?.();
      return;
    }
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const t = Math.max(0, now - start);
      draw(Math.min(t, end));
      if (t < end) frame = requestAnimationFrame(tick);
      else onDoneRef.current?.();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [play, reduced, delay, end, draw]);

  const flowerAt = (x: number, y: number, scale: number, name: string) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g ref={part(name, [60, 60])}>
        <FlowerShapes />
      </g>
    </g>
  );

  return (
    <svg
      width={width}
      height={(width * box[3]) / box[2]}
      viewBox={box.join(" ")}
      role="img"
      aria-label="Replica"
      className={className}
      overflow="visible"
    >
      <g transform={`translate(${l.mark.x} ${l.mark.y}) scale(${l.mark.scale})`}>
        <g ref={part("page")}>
          <rect x={PAGE.x} y={PAGE.y} width={PAGE.width} height={PAGE.height} rx={PAGE.r} fill={p.page} stroke={p.border} strokeWidth={2} />
        </g>
        {HOLES.map((h, i) => (
          <g key={h.y} ref={part(`hole${i}`)}>
            <circle cx={h.x} cy={h.y} r={3.4} fill={p.border} />
          </g>
        ))}
        {RINGS.map((d, i) => (
          <path
            key={d}
            ref={part(`ring${i}`, [0, 0], true)}
            d={d}
            pathLength={100}
            strokeDasharray="100 100"
            fill="none"
            stroke={p.rings}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        ))}
        <g ref={part("ribbon", [90, 10])}>
          <path d={RIBBON} fill={p.ribbon} />
        </g>
        {flowerAt(FLOWER_IN_MARK.x, FLOWER_IN_MARK.y, FLOWER_IN_MARK.scale, "flower")}
      </g>
      <g transform={`translate(${l.word.x} ${l.word.y})`}>
        {tl.thread ? (
          <path
            ref={part("thread", [0, 0], true)}
            d={`M4 15H${WORD.width - 4}`}
            pathLength={100}
            strokeDasharray="100 100"
            fill="none"
            stroke={p.ribbon}
            strokeWidth={2.5}
          />
        ) : null}
        {WORD.glyphs.map((d, k) => (
          <g key={k} ref={part(`g${k}`, [WORD.gx[k] + WORD.gw[k] / 2, 0])}>
            <path d={d} fill={p.word} />
          </g>
        ))}
        {flowerAt(WORD.flower.x, WORD.flower.y, WORD.flower.scale, "flowerI")}
      </g>
    </svg>
  );
};
