import React from "react";

/**
 * Lo que viene, con su forma (DESIGN-WEB.md §10): filas o tarjetas de `surface-sunken` con un brillo
 * lento que se apaga con "reducir movimiento". La región avisa que está cargando con un `role="status"`
 * oculto; lo de adentro es decorativo.
 */
export const Skeleton: React.FC<{ rows?: number; shape?: "row" | "card"; label?: string; className?: string }> = ({
  rows = 3,
  shape = "row",
  label = "Cargando…",
  className = "",
}) => (
  <div aria-busy="true" className={`space-y-3 ${className}`}>
    <span role="status" className="sr-only">
      {label}
    </span>
    {Array.from({ length: rows }, (_, i) => (
      <div
        key={i}
        aria-hidden="true"
        className={`skeleton rounded-md bg-surface-sunken ${shape === "card" ? "h-28 rounded-lg" : "h-14"}`}
        style={{ opacity: 1 - i * 0.18 }}
      />
    ))}
  </div>
);
