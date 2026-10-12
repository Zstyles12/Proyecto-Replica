import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";

const DOTS = 6;
const BREAK_MS = 460;

export interface AnimatedHeartProps {
  active: boolean;
  size?: number;
  color?: string;
  outlineColor?: string;
}

function BurstDot({
  index,
  size,
  color,
}: {
  index: number;
  size: number;
  color: string;
}) {
  const angle = (index / DOTS) * Math.PI * 2 - Math.PI / 2;
  const reach = size * 0.95;
  const dot = Math.max(3, Math.round(size * 0.2));
  const burstX = Math.cos(angle) * reach;
  const burstY = Math.sin(angle) * reach;
  const burstXMid = Math.cos(angle) * reach * 0.3;
  const burstYMid = Math.sin(angle) * reach * 0.3;

  return (
    <span
      className="absolute rounded-full pointer-events-none animate-burst-dot"
      style={
        {
          width: `${dot}px`,
          height: `${dot}px`,
          backgroundColor: color,
          left: `${size / 2 - dot / 2}px`,
          top: `${size / 2 - dot / 2}px`,
          "--burst-x": `${burstX}px`,
          "--burst-y": `${burstY}px`,
          "--burst-x-mid": `${burstXMid}px`,
          "--burst-y-mid": `${burstYMid}px`,
        } as React.CSSProperties
      }
    />
  );
}

function Half({
  side,
  size,
  color,
}: {
  side: "left" | "right";
  size: number;
  color: string;
}) {
  return (
    <div
      className={`absolute top-0 pointer-events-none overflow-hidden ${
        side === "left" ? "animate-heart-break-left" : "animate-heart-break-right"
      }`}
      style={{
        left: side === "left" ? 0 : `${size / 2}px`,
        width: `${size / 2}px`,
        height: `${size}px`,
        transformOrigin: side === "left" ? "100% 85%" : "0% 85%",
      }}
    >
      <div
        className="absolute top-0"
        style={{ left: side === "left" ? 0 : `-${size / 2}px` }}
      >
        <Heart size={size} color={color} fill={color} />
      </div>
    </div>
  );
}

/**
 * AnimatedHeart:
 * - 1:1 con replica mobile/zairo/components/motion/heart.tsx
 * - Al activar (favorito): Late (scale 1.3 con rebote) y suelta 6 puntos radiales (burst).
 * - Al desactivar (quitar favorito): El corazón se rompe en dos mitades (Half) que se separan,
 *   caen y se desvanecen, mientras el contorno vacío emerge suavemente.
 */
export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  active,
  size = 18,
  color = "var(--emotion)",
  outlineColor = "var(--voice)",
}) => {
  const [breakId, setBreakId] = useState(0);
  const [doneId, setDoneId] = useState(0);
  const [prevActive, setPrevActive] = useState(active);
  const [burstKey, setBurstKey] = useState(0);

  const mounted = useRef(false);

  if (prevActive !== active) {
    setPrevActive(active);
    if (!active) {
      setBreakId((id) => id + 1);
    } else {
      setBurstKey((k) => k + 1);
    }
  }

  const breaking = !active && breakId > 0 && doneId !== breakId;

  // Limpiar mitades cuando terminan de caer
  useEffect(() => {
    if (!breakId) return;
    const t = setTimeout(() => setDoneId(breakId), BREAK_MS);
    return () => clearTimeout(t);
  }, [breakId]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
  }, []);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Estallido de 6 puntos al marcar favorito */}
      {active && burstKey > 0 && (
        <React.Fragment key={`burst-${burstKey}`}>
          {Array.from({ length: DOTS }, (_, i) => (
            <BurstDot key={i} index={i} size={size} color={color} />
          ))}
        </React.Fragment>
      )}

      {/* Corazón activo con latido */}
      {active && (
        <div key={`active-${burstKey}`} className="animate-heart-pop flex items-center justify-center">
          <Heart size={size} color={color} fill={color} />
        </div>
      )}

      {/* Contorno inactivo (emerge suavemente si viene de rotura) */}
      {!active && (
        <div
          key={`outline-${breakId}`}
          className={
            breakId > 0
              ? "animate-heart-outline-in flex items-center justify-center"
              : "flex items-center justify-center"
          }
        >
          <Heart size={size} color={outlineColor} fill="transparent" />
        </div>
      )}

      {/* Las dos mitades rompiéndose */}
      {breaking && (
        <React.Fragment key={`break-${breakId}`}>
          <Half side="left" size={size} color={color} />
          <Half side="right" size={size} color={color} />
        </React.Fragment>
      )}
    </div>
  );
};

export default AnimatedHeart;
