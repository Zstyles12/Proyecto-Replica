import React from "react";
import {
  BOX,
  FLOWER_CENTER_R,
  FLOWER_IN,
  FLOWER_IN_MARK,
  FLOWER_OUT,
  HOLES,
  LOCKUP,
  PAGE,
  RIBBON,
  RINGS,
  WORD,
} from "./logoGeometry";
import { LOGO_PAINT } from "./logoPaint";

// La marca de Replica: una hoja de cuaderno anillada con una cinta salvia y la nomeolvides al centro
// (docs/marca de la app, DESIGN-WEB.md §9). Las mismas piezas que components/brand/logo.tsx de la
// app, pintadas con los tokens: siguen el tema elegido, también cuando se fuerza claro u oscuro.
// La versión que se arma está en LogoMotion.tsx.

const p = LOGO_PAINT;

// ---------- formas (en su propia retícula) ----------

export const FlowerShapes: React.FC = () => (
  <>
    <path d={FLOWER_OUT} fill={p.reply} />
    <path d={FLOWER_IN} fill={p.soft} />
    <circle cx={60} cy={60} r={FLOWER_CENTER_R} fill={p.reply} />
  </>
);

const flowerInMark = `translate(${FLOWER_IN_MARK.x} ${FLOWER_IN_MARK.y}) scale(${FLOWER_IN_MARK.scale})`;
const flowerInWord = `translate(${WORD.flower.x} ${WORD.flower.y}) scale(${WORD.flower.scale})`;

const MarkShapes: React.FC = () => (
  <>
    <rect x={PAGE.x} y={PAGE.y} width={PAGE.width} height={PAGE.height} rx={PAGE.r} fill={p.page} stroke={p.border} strokeWidth={2} />
    <g fill={p.border}>
      {HOLES.map((h) => (
        <circle key={h.y} cx={h.x} cy={h.y} r={3.4} />
      ))}
    </g>
    <g fill="none" stroke={p.rings} strokeWidth={4.5} strokeLinecap="round">
      {RINGS.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <path d={RIBBON} fill={p.ribbon} />
    <g transform={flowerInMark}>
      <FlowerShapes />
    </g>
  </>
);

const WordShapes: React.FC = () => (
  <>
    <path d={WORD.glyphs.join("")} fill={p.word} />
    <g transform={flowerInWord}>
      <FlowerShapes />
    </g>
  </>
);

// ---------- piezas ----------

const viewBox = (b: readonly number[]) => b.join(" ");

// Las firmas y el logotipo dicen "Replica"; el ícono y la flor son decorativos (siempre van junto al
// nombre o dentro de un botón con su etiqueta). Con `decorative`, la firma también se oculta.
const label = (decorative?: boolean) =>
  decorative ? ({ "aria-hidden": true } as const) : ({ role: "img", "aria-label": "Replica" } as const);

type MarkProps = { size: number; className?: string };

/** El ícono: la hoja anillada con la cinta y la flor. `size` es su alto (mínimo 32 px). */
export const ReplicaMark: React.FC<MarkProps> = ({ size, className }) => {
  const b = BOX.icono;
  return (
    <svg width={(size * b[2]) / b[3]} height={size} viewBox={viewBox(b)} aria-hidden="true" className={className}>
      <MarkShapes />
    </svg>
  );
};

/** La nomeolvides sola, para tamaños chicos (16 a 24 px). `size` es su alto. */
export const ReplicaFlower: React.FC<MarkProps> = ({ size, className }) => {
  const b = BOX.flor;
  return (
    <svg width={(size * b[2]) / b[3]} height={size} viewBox={viewBox(b)} aria-hidden="true" className={className}>
      <FlowerShapes />
    </svg>
  );
};

/** La palabra «Replica» con la flor en el punto de la i. `width` es su ancho (mínimo 72 px). */
export const ReplicaWordmark: React.FC<{ width: number; decorative?: boolean; className?: string }> = ({ width, decorative, className }) => {
  const b = BOX.logotipo;
  return (
    <svg width={width} height={(width * b[3]) / b[2]} viewBox={viewBox(b)} className={className} {...label(decorative)}>
      <WordShapes />
    </svg>
  );
};

/** Ícono y palabra: horizontal por defecto, vertical para espacios altos. `width` es su ancho (mínimo 120 px). */
export const ReplicaLockup: React.FC<{
  width: number;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  className?: string;
}> = ({ width, orientation = "horizontal", decorative, className }) => {
  const b = orientation === "horizontal" ? BOX["firma-horizontal"] : BOX["firma-vertical"];
  const l = LOCKUP[orientation];
  return (
    <svg width={width} height={(width * b[3]) / b[2]} viewBox={viewBox(b)} className={className} {...label(decorative)}>
      <g transform={`translate(${l.mark.x} ${l.mark.y}) scale(${l.mark.scale})`}>
        <MarkShapes />
      </g>
      <g transform={`translate(${l.word.x} ${l.word.y})`}>
        <WordShapes />
      </g>
    </svg>
  );
};
