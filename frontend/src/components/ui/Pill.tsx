import React from "react";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  moodColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Pastilla según especificaciones de DESIGN.md:
 * - Altura: 32–36 px (h-[34px]) (Sección 5).
 * - Radio: totalmente redondeado (rounded-full) (Sección 5).
 * - Con valor activo: tinte suave del 13% y borde al 40% del color (Sección 6).
 * - Siempre muestra su nombre escrito (Sección 3.2).
 */
export const Pill: React.FC<PillProps> = ({
  label,
  active = false,
  moodColor,
  icon,
  className = "",
  onClick,
  ...props
}) => {
  const dynamicStyle: React.CSSProperties =
    active && moodColor
      ? {
          backgroundColor: `color-mix(in srgb, ${moodColor} 13%, transparent)`,
          borderColor: `color-mix(in srgb, ${moodColor} 40%, transparent)`,
          color: "var(--foreground)",
        }
      : {};

  return (
    <button
      type="button"
      onClick={onClick}
      style={dynamicStyle}
      className={`inline-flex items-center gap-1.5 h-[34px] px-3.5 rounded-full text-xs font-medium select-none cursor-pointer border transition-all duration-small ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
        active && !moodColor
          ? "bg-voice-soft/30 border-voice/40 text-foreground"
          : !active
          ? "bg-surface border-border/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
          : ""
      } ${className}`}
      {...props}
    >
      {moodColor && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: moodColor }}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0 opacity-70">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};
