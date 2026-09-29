import React from "react";

export type CardVariant = "raised" | "flat" | "sunken";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta según especificaciones de DESIGN.md:
 * - Radio: 24 px (rounded-lg) para raised y flat; 16 px (rounded-md) para sunken (Sección 5).
 * - Sombra: 0 6px 14px rgba(27,58,46,0.06) solo en claro para raised; en oscuro borde fino (Sección 5).
 * - Bordes: siempre finos con transparencia (Sección 3.1 y 5).
 */
export const Card: React.FC<CardProps> = ({
  variant = "raised",
  children,
  className = "",
  ...props
}) => {
  const variantClasses = {
    raised:
      "bg-surface-raised rounded-lg border border-border/40 shadow-raised dark:shadow-none dark:border-border/60",
    flat: "bg-surface rounded-lg border border-border/30",
    sunken: "bg-surface-sunken rounded-md border border-border/20",
  }[variant];

  return (
    <div className={`p-6 transition-colors duration-small ${variantClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};
