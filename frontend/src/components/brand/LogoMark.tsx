import React from "react";

// La marca provisional (components/brand/logo-mark.tsx de la app): un hilo que va (salvia), da la
// vuelta y regresa (malva), pasando por encima y por debajo de cuatro hilos de urdimbre.
// Retícula de 120 × 120. Con `weave`, la ida y la vuelta se tejen (DESIGN.md §7.3).
const WARP_X = [36, 52, 68, 84];
const IDA_Y = 50;
const VUELTA_Y = 74;
const IDA = `M14 ${IDA_Y} L86 ${IDA_Y} C102 ${IDA_Y} 102 ${VUELTA_Y} 86 ${VUELTA_Y}`;
const VUELTA = `M86 ${VUELTA_Y} L20 ${VUELTA_Y}`;
// Cruces donde la urdimbre pasa por encima del hilo: alternan entre la ida y la vuelta.
const OVER = [
  { x: 52, y: IDA_Y },
  { x: 84, y: IDA_Y },
  { x: 36, y: VUELTA_Y },
  { x: 68, y: VUELTA_Y },
];

interface LogoMarkProps {
  size: number;
  weave?: boolean;
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ size, weave = false, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    aria-hidden="true"
    className={`${weave ? "logo-weave" : ""} ${className ?? ""}`}
  >
    {WARP_X.map((x) => (
      <line key={x} x1={x} y1={32} x2={x} y2={88} stroke="var(--border)" strokeWidth={1.5} strokeLinecap="round" />
    ))}
    <path className="logo-ida" d={IDA} pathLength={1} stroke="var(--voice)" strokeWidth={5} strokeLinecap="round" />
    <path className="logo-vuelta" d={VUELTA} pathLength={1} stroke="var(--reply)" strokeWidth={5} strokeLinecap="round" />
    {OVER.map(({ x, y }) => (
      <g key={`${x}-${y}`} className="logo-over">
        <rect x={x - 3.5} y={y - 4.5} width={7} height={9} fill="var(--background)" />
        <line x1={x} y1={y - 4.5} x2={x} y2={y + 4.5} stroke="var(--border)" strokeWidth={1.5} />
      </g>
    ))}
  </svg>
);
