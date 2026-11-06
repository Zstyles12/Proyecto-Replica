import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "normal" | "sm" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Botón con especificaciones de DESIGN.md:
 * - Radio: completo (rounded-full)
 * - Alturas de toque: normal 44 px, sm 36 px, lg 48 px (Sección 5)
 * - Presión: escala a 0.97 en 120 ms con curva ease-out (Sección 6 y 7.1)
 * - Foco accesible: anillo voice (Sección 12)
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "normal",
  children,
  icon,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-sans font-semibold rounded-full select-none cursor-pointer transition-all duration-small ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const sizeClasses = {
    // Se dibuja a 36 px, pero se toca en 44 (tap-area).
    sm: "relative tap-area h-[36px] px-4 text-xs gap-1.5 min-w-[36px]",
    normal: "h-[44px] px-6 text-[15px] gap-2 min-w-[44px]",
    lg: "h-[48px] px-7 text-base gap-2.5 min-w-[48px]",
  }[size];

  const variantClasses = {
    primary:
      "bg-voice text-voice-foreground hover:opacity-95 shadow-sm active:bg-voice",
    secondary:
      "bg-muted text-foreground hover:bg-muted/80 active:bg-muted",
    // Con recuadro: sin él, un botón de texto se confunde con texto suelto (DESIGN-WEB.md §7).
    ghost:
      "border border-border bg-transparent text-voice hover:border-voice/50 hover:bg-voice-soft/30 active:bg-voice-soft/50",
    destructive:
      "bg-destructive text-destructive-foreground hover:opacity-90 active:bg-destructive",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
