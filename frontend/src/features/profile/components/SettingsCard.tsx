import React, { useId, useState } from "react";
import { ChevronDown, ChevronRight, type LucideIcon } from "lucide-react";

type Tint = "voice" | "reply" | "emotion" | "neutral";

const TINTS: Record<Tint, string> = {
  voice: "bg-voice-soft text-voice",
  reply: "bg-reply-soft text-reply",
  emotion: "bg-emotion-soft text-emotion",
  neutral: "bg-surface-sunken text-muted-foreground",
};

/**
 * Tarjeta de ajustes plegable (DESIGN.md §6): ícono en círculo, título y el resumen de cómo está. Empieza
 * cerrada y se cierra al salir de la pantalla. Cerrada, lo de adentro no recibe el foco. El recorrido de
 * Usuario la abre con `expanded`.
 */
export const SettingsCard = React.forwardRef<
  HTMLDivElement,
  {
    icon: LucideIcon;
    tint?: Tint;
    title: string;
    subtitle: string;
    summary?: string;
    expanded?: boolean;
    children: React.ReactNode;
  }
>(({ icon: Icon, tint = "voice", title, subtitle, summary, expanded = false, children }, ref) => {
  const [open, setOpen] = useState(expanded);
  const panelId = useId();

  // El recorrido abre la de su paso y cierra la anterior.
  const [lastExpanded, setLastExpanded] = useState(expanded);
  if (expanded !== lastExpanded) {
    setLastExpanded(expanded);
    setOpen(expanded);
  }

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border border-border/40 bg-surface-raised shadow-raised dark:shadow-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3.5 p-4 text-left transition-colors hover:bg-surface/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-voice sm:p-5"
      >
        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TINTS[tint]}`}>
          <Icon size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-replica text-[19px] font-medium leading-6 text-foreground">{title}</span>
          <span className="block truncate text-[13px] leading-[18px] text-muted-foreground">{open ? subtitle : summary ?? subtitle}</span>
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 text-subtle transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={panelId}
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t border-border/30 p-4 sm:p-5">{children}</div>
        </div>
      </div>
    </div>
  );
});
SettingsCard.displayName = "SettingsCard";

/** Una fila dentro de una tarjeta de ajustes: ícono salvia a la izquierda y el control a la derecha. */
export const SettingRow: React.FC<{ icon: LucideIcon; title: string; subtitle?: string; right?: React.ReactNode }> = ({
  icon: Icon,
  title,
  subtitle,
  right,
}) => (
  <div className="flex items-center gap-3 rounded-md bg-surface-sunken p-3.5">
    <Icon size={18} className="shrink-0 text-voice" aria-hidden="true" />
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-semibold leading-5 text-foreground">{title}</p>
      {subtitle ? <p className="text-[13px] leading-[18px] text-muted-foreground">{subtitle}</p> : null}
    </div>
    {right}
  </div>
);

/** Una fila que lleva a otra pantalla o ejecuta algo (Tu cuenta, Soy psicólogo…). */
export const LinkRow: React.FC<{
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tint?: "voice" | "emotion" | "neutral";
  onClick: () => void;
}> = ({ icon: Icon, title, subtitle, tint = "neutral", onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
  >
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        tint === "voice" ? "bg-voice-soft text-voice" : tint === "emotion" ? "bg-emotion-soft text-emotion" : "bg-muted text-muted-foreground"
      }`}
    >
      <Icon size={17} />
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block text-[15px] font-semibold leading-5 ${tint === "emotion" ? "text-emotion" : "text-foreground"}`}>{title}</span>
      {subtitle ? <span className="block text-[13px] leading-[18px] text-muted-foreground">{subtitle}</span> : null}
    </span>
    <ChevronRight size={16} className="text-subtle" aria-hidden="true" />
  </button>
);
