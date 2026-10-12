import React, { useEffect, useRef, useState, useId } from "react";

/**
 * Sol de Bienvenida de Replica (1:1 con replica mobile/zairo/welcome-garden.tsx y docs/DESIGN.md).
 *
 * Ubicado en la esquina superior izquierda de la pantalla de bienvenida.
 * Emerge armónicamente en la etapa de flor (etapa 2):
 * - Interpolación orgánica suave sincronizada con la floración (1700 ms).
 * - Asoma su cuarto de círculo desde la esquina con relleno cálido translúcido (var(--sun-soft)).
 * - Cuarto de anillo exterior trazado con textura sutil de crayón (var(--sun)).
 * - 16 rayos alternados (8 largos y 8 cortos) que brotan hacia afuera, giran lentamente a 5°/s y
 *   respiran en longitud suavemente (ciclo de 3.2 s).
 * - En modo 'prefers-reduced-motion', se dibuja estático sin giro, traslación ni respiración.
 */

const SCALE_MOBILE = 7;
const SCALE_DESKTOP = 19; // Escala ~35% mayor en escritorio (14 * 1.35 = 18.9 -> 19)
const LINE = 2.6;
const SUN = { r: 6.9, long: [9.3, 12.7] as const, short: [9.7, 11.5] as const, rays: 16 } as const;
const SUN_SPIN = 5; // Grados por segundo
const SUN_BREATH = 3.2; // Segundos por respiración

const GROW_MS = 1700;
const SHRINK_MS = 800;
const REDUCED_MS = 900;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function segment(v: number, from: number, to: number, soft = true): number {
  if (v <= from) return 0;
  if (v >= to) return 1;
  const t = (v - from) / (to - from);
  return soft ? 1 - Math.pow(1 - t, 3) : t;
}

function generateSunRays(offset: number, [rIn, rOut]: readonly [number, number]): string {
  return Array.from({ length: SUN.rays / 2 }, (_, k) => {
    const a = ((offset + (k * 720) / SUN.rays) * Math.PI) / 180;
    const [c, n] = [Math.cos(a), Math.sin(a)];
    const p = (val: number) => val.toFixed(3);
    return `M${p(c * rIn)} ${p(n * rIn)}L${p(c * rOut)} ${p(n * rOut)}`;
  }).join("");
}

const SUN_PATHS = {
  wedge: `M0 0 L${SUN.r} 0 A${SUN.r} ${SUN.r} 0 0 1 0 ${SUN.r} Z`,
  ring: `M${SUN.r} 0 A${SUN.r} ${SUN.r} 0 0 1 0 ${SUN.r}`,
  long: generateSunRays(9, SUN.long),
  short: generateSunRays(9 + 360 / SUN.rays, SUN.short),
};

export interface WelcomeSunProps {
  growth: number; // 0 (semilla), 1 (brote), 2 (flor)
  active?: boolean;
  className?: string;
  isDesktop?: boolean;
}

export const WelcomeSun: React.FC<WelcomeSunProps> = ({
  growth: targetGrowth,
  active = true,
  className = "",
  isDesktop: propIsDesktop,
}) => {
  const filterId = useId().replace(/:/g, "_");
  const crayonId = `sun-crayon-${filterId}`;

  // Detección de vista de escritorio (>= 1100 px)
  const [desktopMedia, setDesktopMedia] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1100px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1100px)");
    const handler = (e: MediaQueryListEvent) => setDesktopMedia(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const isDesktop = propIsDesktop !== undefined ? propIsDesktop : desktopMedia;
  const currentScale = isDesktop ? SCALE_DESKTOP : SCALE_MOBILE;
  const currentSunSize = 14 * currentScale; // 196 px en escritorio (rango 180–220 px), 98 px en móvil

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Crecimiento interpolado biológico (0 -> 1 -> 2)
  const [currentGrowth, setCurrentGrowth] = useState<number>(targetGrowth);
  const currentGrowthRef = useRef<number>(targetGrowth);
  const animRef = useRef<{
    fromGrowth: number;
    toGrowth: number;
    startTime: number;
    duration: number;
  }>({
    fromGrowth: targetGrowth,
    toGrowth: targetGrowth,
    startTime: 0,
    duration: 1,
  });

  // Animación del giro y respiración continua de los rayos
  const [time, setTime] = useState<number>(0);
  const timeRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);

  // Reaccionar a cambios en targetGrowth
  useEffect(() => {
    if (targetGrowth !== animRef.current.toGrowth) {
      const from = currentGrowthRef.current;
      const steps = Math.abs(targetGrowth - from);
      const forward = targetGrowth > from;
      const perStep = reducedMotion ? REDUCED_MS : forward ? GROW_MS : SHRINK_MS;
      const duration = Math.max(120, steps * perStep);

      animRef.current = {
        fromGrowth: from,
        toGrowth: targetGrowth,
        startTime: performance.now(),
        duration,
      };
    }
  }, [targetGrowth, reducedMotion]);

  // Bucle de animación unificado para crecimiento, rotación y respiración
  useEffect(() => {
    let animId: number;

    const frame = (timestamp: number) => {
      const dt = lastFrameRef.current
        ? Math.min((timestamp - lastFrameRef.current) / 1000, 0.064)
        : 0.016;
      lastFrameRef.current = timestamp;

      // 1. Avance del crecimiento interpolado
      const { fromGrowth, toGrowth, startTime, duration } = animRef.current;
      let newGrowth = toGrowth;
      if (duration > 0 && timestamp >= startTime) {
        const elapsed = timestamp - startTime;
        const p = clamp01(elapsed / duration);
        const easeOutCubic = 1 - Math.pow(1 - p, 3);
        newGrowth = fromGrowth + (toGrowth - fromGrowth) * easeOutCubic;
        if (p >= 1) {
          animRef.current.fromGrowth = toGrowth;
        }
      }
      currentGrowthRef.current = newGrowth;
      setCurrentGrowth(newGrowth);

      // 2. Reloj de rayos (solo corre cuando la flor está casi abierta o abierta)
      if (!reducedMotion && active && newGrowth >= 1.95) {
        timeRef.current += dt;
        setTime(timeRef.current);
      }

      // Continuar loop mientras se anime el crecimiento o esté girando el sol
      const isAnimating = animRef.current.fromGrowth !== animRef.current.toGrowth;
      const isShining = !reducedMotion && active && newGrowth >= 1.95;

      if (isAnimating || isShining) {
        animId = requestAnimationFrame(frame);
      }
    };

    lastFrameRef.current = performance.now();
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion, active, targetGrowth]);

  // Transición botánica hacia etapa 2 (sol amaneciendo)
  const toCare = clamp01(currentGrowth - 1);
  const rise = segment(toCare, 0.5, 0.95);
  const ring = segment(toCare, 0.5, 0.85);
  const fill = segment(toCare, 0.6, 0.9);
  const rays = segment(toCare, 0.7, 1);

  const opacity = Math.min(1, ring * 3);
  const out = reducedMotion ? 0 : (1 - rise) * -16;

  // Si aún no empieza a nacer el sol, no renderizamos nada
  if (opacity <= 0.001) {
    return null;
  }

  // Dinámica de rayos
  const raysOpacity = Math.min(1, rays * 2);
  const burst = reducedMotion ? 1 : 0.6 + 0.4 * rays;
  const breathLong = reducedMotion
    ? 1
    : 1 + 0.06 * Math.sin((time / SUN_BREATH) * 2 * Math.PI);
  const breathShort = reducedMotion
    ? 1
    : 1 - 0.06 * Math.sin((time / SUN_BREATH) * 2 * Math.PI);
  const spinAngle = reducedMotion ? 0 : (time * SUN_SPIN) % 360;

  return (
    <div
      className={`pointer-events-none select-none overflow-visible ${className}`}
      style={{ width: currentSunSize, height: currentSunSize }}
      aria-hidden="true"
    >
      <svg
        width={currentSunSize}
        height={currentSunSize}
        viewBox={`0 0 ${currentSunSize} ${currentSunSize}`}
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Filtro sutil de textura de crayón para el sol (1:1 con la planta) */}
          <filter id={crayonId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.45"
              numOctaves="2"
              result="noise"
              seed="99"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g
          transform={`translate(${(out * currentScale).toFixed(2)}, ${(out * currentScale).toFixed(2)}) scale(${currentScale})`}
          opacity={opacity}
        >
          {/* Relleno translúcido del cuarto de sol */}
          <path
            d={SUN_PATHS.wedge}
            fill="var(--sun-soft)"
            opacity={fill}
          />

          {/* Cuarto de anillo exterior y rayos con textura de crayón */}
          <g filter={`url(#${crayonId})`}>
            {/* Cuarto de anillo exterior */}
            <path
              d={SUN_PATHS.ring}
              fill="none"
              stroke="var(--sun)"
              strokeWidth={LINE / currentScale}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${ring * 100} 100`}
            />

            {/* Rayos alternados */}
            {raysOpacity > 0.01 && (
              <g opacity={raysOpacity}>
                {/* Rayos largos */}
                <g
                  transform={`rotate(${spinAngle.toFixed(2)}) scale(${(burst * breathLong).toFixed(4)})`}
                >
                  <path
                    d={SUN_PATHS.long}
                    fill="none"
                    stroke="var(--sun)"
                    strokeWidth={LINE / currentScale}
                    strokeLinecap="round"
                  />
                </g>

                {/* Rayos cortos a contratiempo */}
                <g
                  transform={`rotate(${spinAngle.toFixed(2)}) scale(${(burst * breathShort).toFixed(4)})`}
                >
                  <path
                    d={SUN_PATHS.short}
                    fill="none"
                    stroke="var(--sun)"
                    strokeWidth={LINE / currentScale}
                    strokeLinecap="round"
                  />
                </g>
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
