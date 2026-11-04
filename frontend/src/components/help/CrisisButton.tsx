import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

const LABEL = "Ayuda en crisis";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice";

/**
 * El acceso a la ayuda en crisis (RF-59, DESIGN-WEB.md §11): discreto, sin rojo ni animación, y siempre
 * a la vista con sesión. Cada lugar tiene su forma:
 * - `sidebar`: al pie de la barra lateral, con texto.
 * - `floating`: en el teléfono, el círculo junto a la barra inferior.
 * - `header`: en la cabecera de una pantalla sin barra (solo ícono) o del área profesional (`withText`).
 */
export const CrisisButton: React.FC<{ variant: "sidebar" | "floating" | "header"; withText?: boolean; className?: string }> = ({
  variant,
  withText = false,
  className = "",
}) => {
  const { pathname } = useLocation();
  const current = pathname === "/ayuda" ? "page" : undefined;

  if (variant === "sidebar") {
    return (
      <Link
        to="/ayuda"
        aria-current={current}
        className={`flex min-h-11 items-center gap-3 rounded-full px-3.5 text-sm text-muted-foreground transition-colors duration-small hover:bg-surface hover:text-foreground ${FOCUS} ${className}`}
      >
        <LifeBuoy size={18} strokeWidth={2} className="ml-1 shrink-0" aria-hidden="true" />
        <span>{LABEL}</span>
      </Link>
    );
  }

  if (variant === "floating") {
    return (
      <Link
        to="/ayuda"
        aria-label={LABEL}
        aria-current={current}
        title={LABEL}
        className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border/40 bg-surface-raised/85 text-muted-foreground shadow-raised backdrop-blur-md transition-colors duration-small hover:text-foreground dark:shadow-none ${FOCUS} ${className}`}
      >
        <LifeBuoy size={21} strokeWidth={2} aria-hidden="true" />
      </Link>
    );
  }

  return withText ? (
    <Link
      to="/ayuda"
      aria-current={current}
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border/40 bg-surface-raised px-4 text-[13px] font-semibold text-foreground transition-colors duration-small hover:bg-surface ${FOCUS} ${className}`}
    >
      <LifeBuoy size={16} aria-hidden="true" />
      {LABEL}
    </Link>
  ) : (
    <Link
      to="/ayuda"
      aria-label={LABEL}
      title={LABEL}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-small hover:bg-surface hover:text-foreground ${FOCUS} ${className}`}
    >
      <LifeBuoy size={20} aria-hidden="true" />
    </Link>
  );
};
