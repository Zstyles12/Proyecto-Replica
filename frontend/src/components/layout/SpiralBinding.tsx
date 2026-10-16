import React from "react";
import { HOLES, PAGE, RINGS } from "../brand/logoGeometry";

// El anillado del cuaderno (DESIGN-WEB.md §3): la barra lateral es el lomo y el contenido, la hoja.
// Cada anillo es el del ícono de la marca (la misma curva y el mismo agujero, de logoGeometry.ts),
// uno cada dos renglones. Va pegado a la hoja, no a la barra: se mueve con los renglones al hacer
// scroll y siempre queda alineado con ellos. Decorativo: no recibe foco ni toques, y no se anima.

// Tamaño del anillo respecto del ícono (retícula de 120) y separación: dos renglones de 24 px.
const K = 1.2;
const PITCH = 48;
const RING = RINGS[0];
const HOLE = HOLES[0];
// Cuánto del dibujo queda a cada lado del borde de la hoja.
const OUTSIDE = Math.ceil((PAGE.x - 11) * K);
const WIDTH = OUTSIDE + Math.ceil((HOLE.x + 4 - PAGE.x) * K);
// El agujero, a medio camino entre dos renglones (los renglones caen en 24·n − 0,5 px).
const HOLE_Y = 11.5;

export const SpiralBinding: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute bottom-0 top-0 z-[45] hidden md:block"
    style={{ left: `calc(15rem - ${OUTSIDE}px)`, width: WIDTH }}
  >
    <svg width={WIDTH} height="100%">
      <defs>
        <pattern id="anillado" width={WIDTH} height={PITCH} patternUnits="userSpaceOnUse">
          <g transform={`translate(${OUTSIDE - PAGE.x * K} ${HOLE_Y - HOLE.y * K}) scale(${K})`}>
            <circle cx={HOLE.x} cy={HOLE.y} r={3.4} fill="var(--border)" />
            <path d={RING} fill="none" stroke="var(--subtle)" strokeWidth={3.6} strokeLinecap="round" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#anillado)" />
    </svg>
  </div>
);
