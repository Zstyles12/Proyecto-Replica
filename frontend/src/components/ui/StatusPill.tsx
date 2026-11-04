import React from "react";
import { BadgeCheck, CircleX, FilePen, Hourglass, type LucideIcon } from "lucide-react";
import type { ApplicationStatus } from "../../services/professional";

const STATES: Record<ApplicationStatus, { icon: LucideIcon; label: string; className: string }> = {
  pending: { icon: Hourglass, label: "Pendiente", className: "bg-surface-sunken text-muted-foreground" },
  needs_changes: { icon: FilePen, label: "Por corregir", className: "bg-emotion-soft text-emotion" },
  approved: { icon: BadgeCheck, label: "Aprobada", className: "bg-voice-soft text-voice" },
  rejected: { icon: CircleX, label: "Rechazada", className: "bg-surface-sunken text-destructive" },
};

/**
 * El estado de una solicitud (DESIGN-WEB.md §10): la forma de `Pill`, pero un `<span>`, porque un estado
 * no se toca. Se reconoce por el ícono y el texto, nunca solo por el color.
 */
export const StatusPill: React.FC<{ status: ApplicationStatus; className?: string }> = ({ status, className = "" }) => {
  const { icon: Icon, label, className: tone } = STATES[status];
  return (
    <span className={`inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${tone} ${className}`}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
};
