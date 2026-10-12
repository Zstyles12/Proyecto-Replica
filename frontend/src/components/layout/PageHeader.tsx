import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/**
 * Cabecera de una pantalla que se abre desde otra (el detalle de una nota, Tu día, Mi cofre…): volver,
 * el título y, si hace falta, una acción a la derecha. Volver usa el historial del navegador; si se
 * entró directo por el enlace, lleva a `fallback`.
 */
export const PageHeader: React.FC<{ title: string; fallback: string; action?: React.ReactNode }> = ({
  title,
  fallback,
  action,
}) => {
  const navigate = useNavigate();
  const back = () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
  return (
    <div className="flex h-12 items-center gap-1">
      <button
        type="button"
        onClick={back}
        aria-label="Volver"
        className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
      >
        <ChevronLeft size={26} aria-hidden="true" />
      </button>
      {title ? (
        <h1 className="min-w-0 flex-1 truncate text-[17px] font-semibold leading-[22px] text-foreground">{title}</h1>
      ) : (
        <span className="flex-1" />
      )}
      {action}
    </div>
  );
};
