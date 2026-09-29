import React from "react";

export type IconCircleVariant = "voice" | "reply" | "emotion" | "surface";
export type IconCircleSize = "sm" | "md" | "lg";

export interface IconCircleProps {
  icon: React.ReactNode;
  variant?: IconCircleVariant;
  size?: IconCircleSize;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

/**
 * Círculo para íconos según DESIGN.md:
 * - Tamaños: 36 px (sm), 40 px (md, estándar), 44 px (lg, cofre/notas) (Sección 5 y 6).
 * - Fondos suaves correspondientes al color fuerte: voice-soft, reply-soft, emotion-soft, surface.
 * - Accesibilidad: aria-label obligatorio para interactivos (Sección 12).
 */
export const IconCircle: React.FC<IconCircleProps> = ({
  icon,
  variant = "voice",
  size = "md",
  className = "",
  onClick,
  ariaLabel,
}) => {
  const sizeClasses = {
    sm: "w-[36px] h-[36px]",
    md: "w-[40px] h-[40px]",
    lg: "w-[44px] h-[44px]",
  }[size];

  const variantClasses = {
    voice: "bg-voice-soft text-voice",
    reply: "bg-reply-soft text-reply",
    emotion: "bg-emotion-soft text-emotion",
    surface: "bg-surface text-foreground border border-border/40 hover:bg-surface-sunken",
  }[variant];

  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none transition-all duration-small ${
        onClick
          ? "cursor-pointer active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          : ""
      } ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon}
    </Component>
  );
};
