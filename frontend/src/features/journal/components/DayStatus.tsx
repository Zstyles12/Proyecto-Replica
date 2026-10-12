import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoonStar } from "lucide-react";
import type { ReplyStatus } from "../types";

type Arrived = {
  kind: "day" | "late";
  status: ReplyStatus;
  // Día de la réplica (clave de dayKey): abre su pantalla.
  day: string;
};

function Line({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[13px] leading-[18px] text-muted-foreground" aria-live="polite">
      <MoonStar size={14} className="shrink-0 text-reply" aria-hidden="true" />
      {text}
    </p>
  );
}

/**
 * Una línea bajo el saludo: cuándo llega la réplica del día y, cuando llegó, un aviso que la abre. La
 * réplica completa se lee en su pantalla (y en Notas): Inicio es para escribir. Sin notas todavía no
 * dice nada (features/journal/components/day-status.tsx de la app).
 */
export const DayStatus: React.FC<{
  // Notas de hoy que leerá la réplica del día (sin las privadas).
  count: number;
  hour: number;
  // La réplica del día ya llegó (o está llegando).
  replied: boolean;
  // Notas escritas después de la réplica de la noche: las lee la última réplica, a medianoche.
  late?: number;
  arrived?: Arrived | null;
}> = ({ count, hour, replied, late = 0, arrived = null }) => {
  if (replied && late) return <Line text="Tu última réplica llega a medianoche" />;

  if (arrived) {
    if (arrived.status === "streaming") {
      return (
        <Line
          text={arrived.kind === "late" ? "Replica está leyendo lo que escribiste anoche…" : "Replica está leyendo tu día…"}
        />
      );
    }
    if (arrived.status !== "done") return null;
    return (
      <Link
        to={`/replica-dia/${arrived.day}`}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full text-[13px] leading-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
      >
        <MoonStar size={14} className="text-reply" aria-hidden="true" />
        <span className="text-muted-foreground">
          {arrived.kind === "late" ? "Llegó tu última réplica de anoche" : "Llegó tu réplica del día"}
        </span>
        <span className="font-medium text-reply">Leer</span>
        <ChevronRight size={14} className="-ml-1 text-reply" aria-hidden="true" />
      </Link>
    );
  }

  if (count === 0 || replied) return null;
  if (count >= 2 && new Date().getHours() >= hour) return null;
  const at = `${hour}:00`;
  return (
    <Line
      text={
        count === 1
          ? // Con una sola nota no hay réplica del día: ya tuvo la suya.
            `Si escribes más hoy, Replica lo leerá todo a las ${at}`
          : `Tu réplica del día llega a las ${at}`
      }
    />
  );
};
