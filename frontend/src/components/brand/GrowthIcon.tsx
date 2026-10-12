import React from "react";

// Lo que crece con la racha: semilla, brote, plantita y flor (components/brand/growth-icon.tsx de la
// app). Mismo trazo que los íconos de Lucide (2 px, puntas redondeadas), todas sobre la misma línea de
// tierra. Solo la flor lleva malva: tu constancia (salvia) florece con lo que Replica te devuelve.
import { stageFor, type GrowthStage } from "./growth";

interface GrowthIconProps {
  stage: GrowthStage;
  size?: number;
  className?: string;
}

export const GrowthIcon: React.FC<GrowthIconProps> = ({ stage, size = 20, className }) => {
  const line = {
    stroke: "var(--voice)",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  const petal = { ...line, stroke: "var(--reply)" };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 20h14" {...line} />

      {stage === "semilla" ? (
        <g>
          <ellipse cx={12} cy={16.9} rx={3.5} ry={2.6} transform="rotate(-18 12 16.9)" fill="var(--voice)" />
          <path
            d="M10.3 16.3c.5-.7 1.3-1.1 2.2-1.2"
            stroke="var(--background)"
            strokeWidth={1.1}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ) : null}

      {stage === "brote" ? (
        <g>
          <path d="M8.8 20a3.2 3.2 0 0 1 6.4 0" {...line} />
          <path d="M12 16.8V10" {...line} />
          <path d="M12 11.6C9.9 11.6 8.6 10.3 8.6 8.2c2.1 0 3.4 1.3 3.4 3.4z" {...line} />
          <path d="M12 10.6c0-1.9 1.2-3.1 3.1-3.1 0 1.9-1.2 3.1-3.1 3.1z" {...line} />
        </g>
      ) : null}

      {stage === "plantita" ? (
        <g>
          <path d="M12 20V6.5" {...line} />
          <path d="M12 16.2c-3 0-4.9-1.9-4.9-4.9 3 0 4.9 1.9 4.9 4.9z" {...line} />
          <path d="M12 12.4c0-3 1.9-4.9 4.9-4.9 0 3-1.9 4.9-4.9 4.9z" {...line} />
          <path d="M12 7.6c-1.8 0-2.9-1.1-2.9-2.9 1.8 0 2.9 1.1 2.9 2.9z" {...line} />
        </g>
      ) : null}

      {stage === "flor" ? (
        <g>
          <path d="M12 20v-9.5" {...line} />
          <path d="M12 17.2c-2.7 0-4.5-1.8-4.5-4.5 2.7 0 4.5 1.8 4.5 4.5z" {...line} />
          <path d="M12 19c.3-3.3 2.1-5.3 4.9-5.9.1 3-1.8 5.2-4.9 5.9z" {...line} />
          <path
            d="M9.93 4.15A2.1 2.1 0 1 1 14.07 4.15A2.1 2.1 0 1 1 15.35 8.09A2.1 2.1 0 1 1 12 10.52A2.1 2.1 0 1 1 8.65 8.09A2.1 2.1 0 1 1 9.93 4.15Z"
            {...petal}
            strokeWidth={1.8}
            fill="var(--reply)"
            fillOpacity={0.22}
          />
          <circle cx={12} cy={7} r={1} fill="var(--reply)" />
        </g>
      ) : null}
    </svg>
  );
};

/**
 * La racha junto a la fecha: la planta y "12 días". Aparece desde el primer día y nunca reprocha: si
 * se corta, vuelve a ser semilla. Cuando pasa a la etapa siguiente, la nueva brota desde la tierra.
 */
export const GrowthStreak = React.forwardRef<HTMLDivElement, { days: number }>(({ days }, ref) => {
  const stage = stageFor(days);
  // Solo brota al cambiar de etapa con la pantalla a la vista; al aparecer ya está en su lugar.
  const [shown, setShown] = React.useState(stage);
  const [sprouting, setSprouting] = React.useState(false);
  if (stage !== shown) {
    setShown(stage);
    setSprouting(true);
  }
  if (days < 1) return null;
  const label = `${days} ${days === 1 ? "día" : "días"}`;
  return (
    <div
      ref={ref}
      className="inline-flex items-center gap-1.5 text-[13px] leading-[18px] text-muted-foreground"
      aria-label={`${label} seguidos escribiendo`}
    >
      <GrowthIcon key={stage} stage={stage} size={20} className={`-mt-1 ${sprouting ? "growth-sprout" : ""}`} />
      <span aria-hidden="true">{label}</span>
    </div>
  );
});
GrowthStreak.displayName = "GrowthStreak";
