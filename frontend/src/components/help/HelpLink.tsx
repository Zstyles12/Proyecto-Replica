import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LifeBuoy } from "lucide-react";

/**
 * Lo que acompaña a una réplica o a una respuesta de Replica cuando lo escrito muestra riesgo (RF-61,
 * RN-10): una frase calmada y el enlace a la ayuda en crisis. Sin rojo y sin alarma.
 */
export const HelpLink: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`space-y-1 rounded-md bg-surface px-4 py-3 ${className}`}>
    <p className="text-[15px] leading-[21px] text-foreground">Si lo necesitas, hay personas que pueden escucharte hoy.</p>
    <Link
      to="/ayuda"
      className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-[15px] font-semibold text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
    >
      <LifeBuoy size={16} aria-hidden="true" />
      Ver ayuda en crisis
      <ChevronRight size={16} aria-hidden="true" />
    </Link>
  </div>
);
