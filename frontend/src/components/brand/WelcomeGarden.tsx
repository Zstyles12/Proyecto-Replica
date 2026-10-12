import React, { useEffect, useRef, useState, useId } from "react";

/**
 * Ilustración Botánica de Bienvenida de Replica (1:1 con replica mobile/zairo/welcome-garden.tsx y docs/DESIGN.md).
 *
 * Una sola planta que germina y florece a su propio ritmo:
 * - Etapa 0 (Semilla): Renglón de cuaderno trazado y una semilla apoyada sobre él con su brillo.
 * - Etapa 1 (Brote y Viento): La semilla se abre como un libro, sube el tallo, se despliegan las
 *   hojas con sus nervaduras y nace el capullo; la planta se mece con ráfagas de viento periódicas.
 * - Etapa 2 (Flor y Sol): El capullo florece en la nomeolvides malva, el viento se serena y
 *   amanece el sol dorado en la esquina.
 */

// Trazos vectoriales exactos en el espacio 24 × 24 (tierra en y = 20)
const PATHS = {
  seedLeft: "M12 17.85A1.55 1.1 0 0 0 12 20.05Z",
  seedRight: "M12 17.85A1.55 1.1 0 0 1 12 20.05Z",
  stem: "M12 20v-9.5",
  leafLeft: "M12 17.2c-2.7 0-4.5-1.8-4.5-4.5 2.7 0 4.5 1.8 4.5 4.5z",
  leafRight: "M12 19c.3-3.3 2.1-5.3 4.9-5.9.1 3-1.8 5.2-4.9 5.9z",
  veinLeft: "M12 17.2Q10.1 15.9 8.9 14.1",
  veinRight: "M12 19Q14 17.2 15.4 14.9",
  bud: "M12 10.6c-1.4-.9-2-2.3-1.6-3.7.3-.9.9-1.6 1.6-2.2.7.6 1.3 1.3 1.6 2.2.4 1.4-.2 2.8-1.6 3.7z",
  budSeam: "M12 10.6C11.7 9.5 11.7 8.6 12 7.7S12.3 5.8 12 4.7",
  flower:
    "M9.93 4.15A2.1 2.1 0 1 1 14.07 4.15A2.1 2.1 0 1 1 15.35 8.09A2.1 2.1 0 1 1 12 10.52A2.1 2.1 0 1 1 8.65 8.09A2.1 2.1 0 1 1 9.93 4.15Z",
  shine: "M11.25 18.7c.3-.35.7-.5 1.1-.5",
} as const;

const SCALE_MOBILE = 7;
const SCALE_DESKTOP = 16.2; // Escala ~35% mayor para escritorio (12 * 1.35 = 16.2)
const LINE = 2.6;
const SEED = { cx: 12, cy: 18.95, rx: 1.55, ry: 1.1 };
const HALF_TURN = 75; // Grados que se abre cada mitad de la semilla

// Constantes físicas del viento
const SWAY = 3.2; // Grados de vaivén en reposo
const SWAY_PERIOD = 4; // Segundos por ciclo
const FIRST_GUST = 4; // Segundos tras brotar hasta primera ráfaga
const GUST_EVERY = 10; // Segundos entre ráfagas
const GUST_LINES = 1.8; // Segundos que tardan las líneas en cruzar
const GUST_PUSH = 8.5; // Grados de empuje antes de amortiguarse (~4.5° práctico)
const GUST_SWING = 2.2; // Segundos de oscilación
const WIND_LINE = 1.8;

// Duraciones de crecimiento
const GROW_MS = 1700;
const SHRINK_MS = 800;
const REDUCED_MS = 900;
const INTRO_MS = 700;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function segment(v: number, from: number, to: number, soft = true): number {
  if (v <= from) return 0;
  if (v >= to) return 1;
  const t = (v - from) / (to - from);
  return soft ? 1 - Math.pow(1 - t, 3) : t;
}

function calcGustLine(gust: number, amp: number, delay: number) {
  if (gust < 0) return { start: 0, end: 0, opacity: 0 };
  const q = (gust - delay) / 0.72;
  const end = 1 - Math.pow(1 - clamp01(q / 0.6), 3);
  const t = clamp01((q - 0.4) / 0.6);
  const start = t * t * (3 - 2 * t);
  const opacity = q > 0 && q < 1 ? 0.5 * amp : 0;
  return { start, end, opacity };
}

function buildWindPath(x0: number, x1: number, y: number, curl: -1 | 0 | 1, r = 7): string {
  const len = x1 - x0;
  let d = `M${x0.toFixed(1)} ${y.toFixed(1)}C${(x0 + len * 0.4).toFixed(1)} ${(y - 5).toFixed(1)} ${(x1 - len * 0.25).toFixed(1)} ${y.toFixed(1)} ${x1.toFixed(1)} ${y.toFixed(1)}`;
  if (curl === -1) d += `A${r} ${r} 0 1 0 ${(x1 - r).toFixed(1)} ${(y - r).toFixed(1)}`;
  if (curl === 1) d += `A${r} ${r} 0 1 1 ${(x1 - r).toFixed(1)} ${(y + r).toFixed(1)}`;
  return d;
}

export interface WelcomeGardenProps {
  growth: number; // 0 (semilla), 1 (brote), 2 (flor)
  active?: boolean;
  width?: number;
  height?: number;
  className?: string;
  isDesktop?: boolean;
}

export const WelcomeGarden: React.FC<WelcomeGardenProps> = ({
  growth: targetGrowth,
  active = true,
  width: propWidth,
  height = 190,
  className = "",
  isDesktop: propIsDesktop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number>(640);
  const containerWidth = propWidth ?? measuredWidth;

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

  // Detección de puntero fino para paralaje sutil
  const [isPointerFine, setIsPointerFine] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(pointer: fine)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    const handler = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Detección de movimiento reducido
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

  // Observador de ancho responsivo
  useEffect(() => {
    if (propWidth !== undefined) return;
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      if (el.clientWidth > 0) setMeasuredWidth(el.clientWidth);
    };
    updateWidth();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setMeasuredWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [propWidth]);

  // Métricas de alineación con el renglón de fondo (24 px) y ancho completo de ventana
  const [layoutMetrics, setLayoutMetrics] = useState<{
    containerLeft: number;
    viewportWidth: number;
    gridAlignedGround: number;
  }>({
    containerLeft: 0,
    viewportWidth: typeof window !== "undefined" ? window.innerWidth : 1200,
    gridAlignedGround: height - 16,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const el = containerRef.current;
      if (!el || typeof window === "undefined") return;
      const rect = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth || window.innerWidth;

      // Alineación vertical estricta a la cuadrícula de renglones de 24 px (.bg-warp-lines)
      // La regla CSS de .bg-warp-lines repite líneas cada 24 px centradas en 24 * k - 0.5 px
      const warpParent = (el.closest(".bg-warp-lines") as HTMLElement) || document.body;

      // Calcular relativeContainerTop usando la cadena de offsetTop para evitar distorsión
      // producida por transformaciones CSS temporales (e.g. translateY(8px) en animate-section-enter).
      let relativeContainerTop = 0;
      let foundInOffsetChain = false;
      let curr: HTMLElement | null = el;

      while (curr && curr !== warpParent && curr !== document.body) {
        relativeContainerTop += curr.offsetTop;
        curr = curr.offsetParent as HTMLElement | null;
        if (curr === warpParent) {
          foundInOffsetChain = true;
          break;
        }
      }

      // Si warpParent no está en la cadena de offsetParent, recurrir a getBoundingClientRect()
      if (!foundInOffsetChain) {
        const warpParentTop = warpParent.getBoundingClientRect().top;
        relativeContainerTop = rect.top - warpParentTop;
      }

      const baseGround = height - 16;

      let finalGround = baseGround;
      if (isDesktop) {
        const currentAbsoluteY = relativeContainerTop + baseGround;
        const nearestK = Math.round((currentAbsoluteY + 0.5) / 24);
        const alignedAbsoluteY = nearestK * 24 - 0.5;
        finalGround = alignedAbsoluteY - relativeContainerTop;
      }

      setLayoutMetrics({
        containerLeft: rect.left,
        viewportWidth: vw,
        gridAlignedGround: finalGround,
      });
    };

    updateMetrics();

    // Actualizaciones ante cambio de tamaño, desplazamiento, fin de animaciones CSS o carga de fuentes
    window.addEventListener("resize", updateMetrics);
    window.addEventListener("scroll", updateMetrics, { passive: true });
    window.addEventListener("animationend", updateMetrics);
    window.addEventListener("transitionend", updateMetrics);

    const timer1 = setTimeout(updateMetrics, 100);
    const timer2 = setTimeout(updateMetrics, 300);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateMetrics).catch(() => {});
    }

    // Observar tanto el contenedor como el padre con .bg-warp-lines para reajustes de layout
    const el = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && el) {
      observer = new ResizeObserver(() => {
        updateMetrics();
      });
      observer.observe(el);
      const warpParent = el.closest(".bg-warp-lines");
      if (warpParent) {
        observer.observe(warpParent);
      }
    }

    return () => {
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("scroll", updateMetrics);
      window.removeEventListener("animationend", updateMetrics);
      window.removeEventListener("transitionend", updateMetrics);
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (observer) observer.disconnect();
    };
  }, [height, isDesktop]);

  // Paralaje sutil con el cursor (solo puntero fino, no en reduced-motion, hasta ±3°)
  const targetCursorTiltRef = useRef<number>(0);
  const currentCursorTiltRef = useRef<number>(0);

  useEffect(() => {
    if (!isDesktop || !isPointerFine || reducedMotion || !active) {
      targetCursorTiltRef.current = 0;
      return;
    }

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const plantScreenX = rect.left + containerWidth / 2;
      const deltaX = e.clientX - plantScreenX;
      // Normalizar en el rango del semiancho de pantalla, tope ±3°
      const maxRange = Math.max(300, (window.innerWidth || 1200) * 0.45);
      const normalized = Math.max(-1, Math.min(1, deltaX / maxRange));
      targetCursorTiltRef.current = normalized * 3.0;
    };

    const handleMouseLeave = () => {
      targetCursorTiltRef.current = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDesktop, isPointerFine, reducedMotion, active, containerWidth]);

  // Identificadores únicos para clips y filtros SVG
  const filterId = useId().replace(/:/g, "_");
  const clipId = `above-ground-${filterId}`;
  const crayonId = `crayon-${filterId}`;
  const windMaskId = `wind-mask-${filterId}`;
  const windGradId = `wind-grad-${filterId}`;

  // Estado animado sincronizado vía requestAnimationFrame
  const [currentGrowth, setCurrentGrowth] = useState<number>(targetGrowth);
  const [intro, setIntro] = useState<number>(() => (reducedMotion ? 1 : 0));
  const [windState, setWindState] = useState<{
    bend: number;
    gustA: { start: number; end: number; opacity: number };
    gustB: { start: number; end: number; opacity: number };
    gustC: { start: number; end: number; opacity: number };
  }>({
    bend: 0,
    gustA: { start: 0, end: 0, opacity: 0 },
    gustB: { start: 0, end: 0, opacity: 0 },
    gustC: { start: 0, end: 0, opacity: 0 },
  });

  // Animación del intro en montaje (trazo del renglón desde donde cae la semilla y caída de semilla)
  useEffect(() => {
    let startTime: number | null = null;
    let animId: number;

    const animateIntro = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = clamp01(elapsed / INTRO_MS);
      // Easing out cúbico (1 - (1 - p)^3) según especificación (~700 ms, easing.out)
      const eased = 1 - Math.pow(1 - progress, 3);
      setIntro(eased);

      if (progress < 1) {
        animId = requestAnimationFrame(animateIntro);
      }
    };

    animId = requestAnimationFrame(animateIntro);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Interpolación biológica de growth hacia targetGrowth
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

  // Bucle rAF continuo para mecida por viento y crecimiento suave
  const windTimerRef = useRef({
    time: 0,
    amp: 0,
    gustAmp: 0,
    lastFrame: 0,
  });

  useEffect(() => {
    let animId: number;

    const frame = (timestamp: number) => {
      const dt = windTimerRef.current.lastFrame
        ? Math.min((timestamp - windTimerRef.current.lastFrame) / 1000, 0.064)
        : 0.016;
      windTimerRef.current.lastFrame = timestamp;

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

      // 2. Física del viento
      // 2. Física del viento y paralaje por cursor
      if (!reducedMotion && isPointerFine && isDesktop) {
        const lerpFactor = 1 - Math.exp(-dt * 4.5);
        currentCursorTiltRef.current +=
          (targetCursorTiltRef.current - currentCursorTiltRef.current) * lerpFactor;
      } else {
        currentCursorTiltRef.current = 0;
      }

      if (!reducedMotion && active) {
        const gRound = Math.round(newGrowth);
        const isSprout = gRound === 1;
        const isFlower = gRound === 2;

        const easeVal = (val: number, on: boolean) => {
          return on ? Math.min(1, val + dt / 1.5) : Math.max(0, val - dt / 0.35);
        };

        const gAmp = easeVal(windTimerRef.current.gustAmp, isSprout);
        const wAmp = easeVal(windTimerRef.current.amp, isSprout || isFlower);

        windTimerRef.current.gustAmp = gAmp;
        windTimerRef.current.amp = wAmp;

        if (wAmp === 0 && gAmp === 0) {
          windTimerRef.current.time = 0;
          setWindState({
            bend: currentCursorTiltRef.current,
            gustA: { start: 0, end: 0, opacity: 0 },
            gustB: { start: 0, end: 0, opacity: 0 },
            gustC: { start: 0, end: 0, opacity: 0 },
          });
        } else {
          windTimerRef.current.time += dt;
          const t = windTimerRef.current.time;

          const since = t - FIRST_GUST;
          let gust = -1;
          if (since >= 0) {
            const cycleTime = since % GUST_EVERY;
            if (cycleTime < GUST_LINES) {
              gust = cycleTime / GUST_LINES;
            }
          }

          let push = 0;
          if (since > 0) {
            const tau = (since % GUST_EVERY) - 0.3;
            if (tau > 0) {
              push =
                GUST_PUSH *
                Math.sin((tau / GUST_SWING) * 2 * Math.PI) *
                Math.exp(-1.4 * tau);
            }
          }

          const sway = Math.sin((t / SWAY_PERIOD) * 2 * Math.PI) * SWAY;
          const totalBend = wAmp * sway + gAmp * push + currentCursorTiltRef.current;

          setWindState({
            bend: totalBend,
            gustA: calcGustLine(gust, gAmp, 0.08),
            gustB: calcGustLine(gust, gAmp, 0),
            gustC: calcGustLine(gust, gAmp, 0.18),
          });
        }
      } else {
        setWindState({
          bend: 0,
          gustA: { start: 0, end: 0, opacity: 0 },
          gustB: { start: 0, end: 0, opacity: 0 },
          gustC: { start: 0, end: 0, opacity: 0 },
        });
      }

      // En reducedMotion o cuando active=false, pausar rAF una vez concluida la interpolación de crecimiento
      const shouldContinue =
        (!reducedMotion && active) ||
        animRef.current.fromGrowth !== animRef.current.toGrowth;

      if (shouldContinue) {
        animId = requestAnimationFrame(frame);
      }
    };

    windTimerRef.current.lastFrame = performance.now();
    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion, active, isDesktop, isPointerFine, targetGrowth]);

  // Cálculos geométricos del lienzo
  const ground = isDesktop ? layoutMetrics.gridAlignedGround : height - 16;
  const cx = containerWidth / 2;
  const plantTranslateX = cx - 12 * currentScale;
  const plantTranslateY = ground - 20 * currentScale;

  // Coordenadas de la línea de tierra (local en móvil, 100vw extendida en escritorio)
  const groundX1 = isDesktop ? -layoutMetrics.containerLeft - 2 : LINE;
  const groundX2 = isDesktop
    ? -layoutMetrics.containerLeft + layoutMetrics.viewportWidth + 2
    : containerWidth - LINE;

  // Segmentos botánicos
  const toReply = clamp01(currentGrowth);
  const toCare = clamp01(currentGrowth - 1);

  // Paso 0: Trazo del renglón desde donde cae la semilla hacia ambos bordes (~700 ms, easing.out)
  const lineProgress = reducedMotion ? 1 : segment(intro, 0, 0.95, true);
  const currentGroundX1 = reducedMotion ? groundX1 : cx - (cx - groundX1) * lineProgress;
  const currentGroundX2 = reducedMotion ? groundX2 : cx + (groundX2 - cx) * lineProgress;
  const seedIn = reducedMotion ? intro : segment(intro, 0.45, 1, true);

  // Paso 0 -> 1: Germinación
  const crack = segment(toReply, 0.03, 0.16);
  const split = segment(toReply, 0.12, 0.42);
  const husk = segment(toReply, 0.34, 0.56, false);
  const seedOpacity = seedIn * (1 - husk);
  const seedDrop = (1 - seedIn) * -3;
  const seedTilt = reducedMotion ? -18 : -18 * (1 - crack);
  const shineOpacity = 1 - crack;
  const whole = crack <= 0;

  // Transformaciones de las mitades de la semilla
  const aRad = (HALF_TURN * split * Math.PI) / 180;
  const lift =
    Math.hypot(SEED.rx * Math.sin(aRad), SEED.ry * Math.cos(aRad)) - SEED.ry;
  const halfLeftTx = -(0.1 * crack + 1.3 * split);
  const halfRightTx = 0.1 * crack + 1.3 * split;
  const rotLeft = -HALF_TURN * split;
  const rotRight = HALF_TURN * split;

  // Tallo y hojas
  const stemProgress = segment(toReply, 0.14, 0.52);
  const leafLeftProgress = segment(toReply, 0.3, 0.62);
  const leafRightProgress = segment(toReply, 0.4, 0.72);
  const budProgress = segment(toReply, 0.6, 0.95);

  // Despliegue de hojas (unfurl)
  const calcUnfurl = (u: number, fold: number) => {
    const rot = reducedMotion ? 0 : fold * (1 - u);
    const scale = reducedMotion ? 1 : 0.15 + 0.85 * u;
    const opacity = Math.min(1, u * 3);
    const strokeWidth = (LINE / currentScale) / (reducedMotion ? 1 : 0.15 + 0.85 * u);
    const vein = clamp01((u - 0.35) / 0.65);
    return { rot, scale, opacity, strokeWidth, vein };
  };

  const leafL = calcUnfurl(leafLeftProgress, 45);
  const leafR = calcUnfurl(leafRightProgress, -45);

  // Capullo
  const swell = segment(toCare, 0, 0.3);
  const budFade = segment(toCare, 0.22, 0.38, false);
  const budScale = reducedMotion
    ? 1
    : Math.max(0.001, budProgress * (1 + 0.18 * swell));
  const budOpacity =
    budProgress > 0
      ? (reducedMotion ? budProgress : 1) * (1 - budFade)
      : 0;
  const budStroke = (LINE / currentScale) / budScale;
  const budTint = 0.45 + 0.5 * swell;
  const budSeamProgress = clamp01((budProgress - 0.3) / 0.7);

  // Flor nomeolvides (forget-me-not)
  const openProgress = segment(toCare, 0.28, 0.85);
  const centerProgress = segment(toCare, 0.65, 1);
  const flowerScale = reducedMotion ? 1 : 0.5 + 0.5 * openProgress;
  const flowerY = reducedMotion ? 7 : 7.6 - 0.6 * openProgress;
  const flowerRot = reducedMotion ? 0 : -30 * (1 - openProgress);
  const flowerOpacity = reducedMotion
    ? openProgress
    : Math.min(1, openProgress * 3);
  const flowerStroke = (LINE / currentScale) / flowerScale;
  const centerRadius = reducedMotion ? 0.85 : 0.85 * centerProgress;
  const centerOpacity = reducedMotion ? centerProgress : 1;

  // Rutas de viento responsivas (confinadas estrictamente al escenario en escritorio)
  const screenLeft = isDesktop ? -layoutMetrics.containerLeft : 0;
  const windMaxX = isDesktop ? containerWidth - 48 : containerWidth * 0.84;
  const scaleRatio = currentScale / 7;
  const curlR = isDesktop ? 12 : 7;

  // Línea A: ráfaga superior dentro del escenario, rizo hacia arriba (-1)
  const windEndX_A = isDesktop ? containerWidth - 64 : containerWidth * 0.58;
  const windPathA = isDesktop
    ? buildWindPath(
        screenLeft,
        windEndX_A,
        ground - 104 * scaleRatio,
        -1,
        curlR
      )
    : buildWindPath(
        containerWidth * 0.04,
        containerWidth * 0.58,
        ground - 104,
        -1,
        7
      );

  // Línea B: ráfaga intermedia dentro del escenario, rizo hacia abajo (1)
  const windEndX_B = isDesktop ? containerWidth - 48 : containerWidth * 0.84;
  const windPathB = isDesktop
    ? buildWindPath(
        screenLeft + 30,
        windEndX_B,
        ground - 70 * scaleRatio,
        1,
        curlR
      )
    : buildWindPath(
        containerWidth * 0.16,
        containerWidth * 0.84,
        ground - 70,
        1,
        7
      );

  // Línea C: ráfaga inferior suave sin rizo (0), no sobrepasa la planta
  const windEndX_C = isDesktop
    ? Math.min(containerWidth - 80, cx + 110)
    : containerWidth * 0.4;
  const windPathC = isDesktop
    ? buildWindPath(
        screenLeft,
        windEndX_C,
        ground - 36 * scaleRatio,
        0,
        curlR
      )
    : buildWindPath(
        containerWidth * 0.02,
        containerWidth * 0.4,
        ground - 36,
        0,
        7
      );

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none overflow-visible pointer-events-none ${className}`}
      style={{ height }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${containerWidth} ${height}`}
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Límite del suelo: la semilla no se hunde por debajo del renglón (1:1 con ABOVE_GROUND rect(0, 0, 24, 20)) */}
          <clipPath id={clipId}>
            <rect x="0" y="0" width="24" height="20" />
          </clipPath>

          {/* Filtro sutil de textura de crayón / papel artesanal (1:1 con la desviación de 0.05 en Skia) */}
          <filter id={crayonId} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.45"
              numOctaves="2"
              result="noise"
              seed="42"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Máscara de viento en escritorio: desvanece el último 20% del trazo y bloquea cualquier desborde */}
          {isDesktop && (
            <>
              <linearGradient
                id={windGradId}
                gradientUnits="userSpaceOnUse"
                x1={screenLeft}
                y1="0"
                x2={windMaxX}
                y2="0"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="80%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <mask
                id={windMaskId}
                maskUnits="userSpaceOnUse"
                x="-5000"
                y="-1000"
                width="10000"
                height={height + 2000}
              >
                <rect
                  x={screenLeft - 100}
                  y="-1000"
                  width={Math.max(10, windMaxX - screenLeft + 100)}
                  height={height + 2000}
                  fill={`url(#${windGradId})`}
                />
              </mask>
            </>
          )}
        </defs>

        {/* 1. Renglón de cuaderno trazado desde donde cae la semilla hacia ambos bordes */}
        <line
          x1={currentGroundX1}
          y1={ground}
          x2={currentGroundX2}
          y2={ground}
          stroke="var(--voice)"
          strokeWidth={LINE}
          strokeLinecap="round"
          opacity={reducedMotion ? intro : 1}
        />

        {/* 2. Ráfagas de viento detrás de la planta en la etapa 1 */}
        <g mask={isDesktop ? `url(#${windMaskId})` : undefined}>
          {windState.gustA.opacity > 0 && (
            <path
              d={windPathA}
              fill="none"
              stroke="var(--voice)"
              strokeWidth={WIND_LINE}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.max(0, (windState.gustA.end - windState.gustA.start) * 100)} 100`}
              strokeDashoffset={`${-windState.gustA.start * 100}`}
              opacity={windState.gustA.opacity}
            />
          )}
          {windState.gustB.opacity > 0 && (
            <path
              d={windPathB}
              fill="none"
              stroke="var(--voice)"
              strokeWidth={WIND_LINE}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.max(0, (windState.gustB.end - windState.gustB.start) * 100)} 100`}
              strokeDashoffset={`${-windState.gustB.start * 100}`}
              opacity={windState.gustB.opacity}
            />
          )}
          {windState.gustC.opacity > 0 && (
            <path
              d={windPathC}
              fill="none"
              stroke="var(--voice)"
              strokeWidth={WIND_LINE}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.max(0, (windState.gustC.end - windState.gustC.start) * 100)} 100`}
              strokeDashoffset={`${-windState.gustC.start * 100}`}
              opacity={windState.gustC.opacity}
            />
          )}
        </g>

        {/* 3. La Planta Ilustrada (Escalada en su espacio 24x24) */}
        <g
          transform={`translate(${plantTranslateX.toFixed(2)}, ${plantTranslateY.toFixed(2)}) scale(${currentScale})`}
          filter={`url(#${crayonId})`}
        >
          {/* SEMILLA Y CÁSCARA */}
          <g clipPath={`url(#${clipId})`}>
            <g
              opacity={seedOpacity}
              transform={`translate(0, ${seedDrop.toFixed(3)})`}
            >
              <g
                transform={`rotate(${seedTilt.toFixed(2)}, ${SEED.cx}, ${SEED.cy})`}
              >
                {/* Semilla entera */}
                {whole && (
                  <ellipse
                    cx={SEED.cx}
                    cy={SEED.cy}
                    rx={SEED.rx}
                    ry={SEED.ry}
                    fill="var(--voice)"
                  />
                )}

                {/* Mitades al abrirse */}
                {!whole && (
                  <g>
                    <path
                      d={PATHS.seedLeft}
                      fill="var(--voice)"
                      transform={
                        reducedMotion
                          ? undefined
                          : `translate(${halfLeftTx.toFixed(3)}, ${(-lift).toFixed(3)}) rotate(${rotLeft.toFixed(2)}, ${SEED.cx}, ${SEED.cy})`
                      }
                    />
                    <path
                      d={PATHS.seedRight}
                      fill="var(--voice)"
                      transform={
                        reducedMotion
                          ? undefined
                          : `translate(${halfRightTx.toFixed(3)}, ${(-lift).toFixed(3)}) rotate(${rotRight.toFixed(2)}, ${SEED.cx}, ${SEED.cy})`
                      }
                    />
                  </g>
                )}

                {/* Brillo de la semilla */}
                {shineOpacity > 0.01 && (
                  <path
                    d={PATHS.shine}
                    fill="none"
                    stroke="var(--background)"
                    strokeWidth={0.35}
                    strokeLinecap="round"
                    opacity={shineOpacity}
                  />
                )}
              </g>
            </g>
          </g>

          {/* TALLO, HOJAS Y FLOR CON VAIVÉN DEL VIENTO */}
          <g
            transform={
              reducedMotion
                ? undefined
                : `translate(12, 20) skewX(${(-windState.bend).toFixed(2)}) translate(-12, -20)`
            }
          >
            {/* Silueta opaca para tapar el viento detrás de la planta (solo en escritorio) */}
            {isDesktop && (
              <g aria-hidden="true">
                {/* Tallo opaco */}
                {stemProgress > 0.001 && (
                  <path
                    d={PATHS.stem}
                    fill="none"
                    stroke="var(--background)"
                    strokeWidth={LINE / currentScale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={100}
                    strokeDasharray={`${stemProgress * 100} 100`}
                  />
                )}

                {/* Silueta de hoja izquierda */}
                {leafL.opacity > 0.01 && (
                  <g
                    opacity={leafL.opacity}
                    transform={
                      reducedMotion
                        ? undefined
                        : `translate(12, 17.2) rotate(${leafL.rot.toFixed(2)}) scale(${leafL.scale.toFixed(4)}) translate(-12, -17.2)`
                    }
                  >
                    <path
                      d={PATHS.leafLeft}
                      fill="var(--background)"
                      stroke="none"
                    />
                  </g>
                )}

                {/* Silueta de hoja derecha */}
                {leafR.opacity > 0.01 && (
                  <g
                    opacity={leafR.opacity}
                    transform={
                      reducedMotion
                        ? undefined
                        : `translate(12, 19) rotate(${leafR.rot.toFixed(2)}) scale(${leafR.scale.toFixed(4)}) translate(-12, -19)`
                    }
                  >
                    <path
                      d={PATHS.leafRight}
                      fill="var(--background)"
                      stroke="none"
                    />
                  </g>
                )}

                {/* Silueta del capullo */}
                <g
                  transform={
                    reducedMotion
                      ? undefined
                      : `translate(12, 10.5) rotate(${(windState.bend * 1.2).toFixed(2)}) translate(-12, -10.5)`
                  }
                >
                  {budOpacity > 0.01 && (
                    <g
                      opacity={budOpacity}
                      transform={
                        reducedMotion
                          ? undefined
                          : `translate(12, 10.6) scale(${budScale.toFixed(4)}) translate(-12, -10.6)`
                      }
                    >
                      <path
                        d={PATHS.bud}
                        fill="var(--background)"
                        stroke="none"
                      />
                    </g>
                  )}
                </g>
              </g>
            )}

            {/* Tallo que crece de la tierra */}
            {stemProgress > 0.001 && (
              <path
                d={PATHS.stem}
                fill="none"
                stroke="var(--voice)"
                strokeWidth={LINE / currentScale}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                strokeDasharray={`${stemProgress * 100} 100`}
              />
            )}

            {/* Hoja izquierda */}
            {leafL.opacity > 0.01 && (
              <g
                opacity={leafL.opacity}
                transform={
                  reducedMotion
                    ? undefined
                    : `translate(12, 17.2) rotate(${leafL.rot.toFixed(2)}) scale(${leafL.scale.toFixed(4)}) translate(-12, -17.2)`
                }
              >
                <path
                  d={PATHS.leafLeft}
                  fill="none"
                  stroke="var(--voice)"
                  strokeWidth={leafL.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {leafL.vein > 0.001 && (
                  <path
                    d={PATHS.veinLeft}
                    fill="none"
                    stroke="var(--voice)"
                    strokeWidth={leafL.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={100}
                    strokeDasharray={`${leafL.vein * 100} 100`}
                  />
                )}
              </g>
            )}

            {/* Hoja derecha */}
            {leafR.opacity > 0.01 && (
              <g
                opacity={leafR.opacity}
                transform={
                  reducedMotion
                    ? undefined
                    : `translate(12, 19) rotate(${leafR.rot.toFixed(2)}) scale(${leafR.scale.toFixed(4)}) translate(-12, -19)`
                }
              >
                <path
                  d={PATHS.leafRight}
                  fill="none"
                  stroke="var(--voice)"
                  strokeWidth={leafR.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {leafR.vein > 0.001 && (
                  <path
                    d={PATHS.veinRight}
                    fill="none"
                    stroke="var(--voice)"
                    strokeWidth={leafR.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={100}
                    strokeDasharray={`${leafR.vein * 100} 100`}
                  />
                )}
              </g>
            )}

            {/* Cabeza (Capullo o Flor) con cabeceo extra por el viento */}
            <g
              transform={
                reducedMotion
                  ? undefined
                  : `translate(12, 10.5) rotate(${(windState.bend * 1.2).toFixed(2)}) translate(-12, -10.5)`
              }
            >
              {/* Capullo en etapa de brote */}
              {budOpacity > 0.01 && (
                <g
                  opacity={budOpacity}
                  transform={
                    reducedMotion
                      ? undefined
                      : `translate(12, 10.6) scale(${budScale.toFixed(4)}) translate(-12, -10.6)`
                  }
                >
                  <path
                    d={PATHS.bud}
                    fill="var(--reply-soft)"
                    opacity={budTint}
                  />
                  <path
                    d={PATHS.bud}
                    fill="none"
                    stroke="var(--voice)"
                    strokeWidth={budStroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {budSeamProgress > 0.001 && (
                    <path
                      d={PATHS.budSeam}
                      fill="none"
                      stroke="var(--voice)"
                      strokeWidth={budStroke}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={100}
                      strokeDasharray={`${budSeamProgress * 100} 100`}
                    />
                  )}
                </g>
              )}

              {/* Flor Nomeolvides en etapa final */}
              {flowerOpacity > 0.01 && (
                <g
                  opacity={flowerOpacity}
                  transform={
                    reducedMotion
                      ? undefined
                      : `translate(12, ${flowerY.toFixed(3)}) rotate(${flowerRot.toFixed(2)}) scale(${flowerScale.toFixed(4)}) translate(-12, -7)`
                  }
                >
                  <path
                    d={PATHS.flower}
                    fill="var(--reply-soft)"
                  />
                  <path
                    d={PATHS.flower}
                    fill="none"
                    stroke="var(--reply)"
                    strokeWidth={flowerStroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Botón central de la flor */}
              {centerOpacity > 0.01 && centerRadius > 0.01 && (
                <circle
                  cx={12}
                  cy={7}
                  r={centerRadius}
                  fill="var(--reply)"
                  opacity={centerOpacity}
                />
              )}
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
