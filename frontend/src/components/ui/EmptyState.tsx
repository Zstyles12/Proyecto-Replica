import React from "react";
import type { LucideIcon } from "lucide-react";

/** Nada que mostrar (DESIGN-WEB.md §10): un ícono de Lucide, una frase con la voz de Replica y una acción cuando la hay. */
export const EmptyState: React.FC<{ icon: LucideIcon; title: string; children?: React.ReactNode; action?: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
  action,
}) => (
  <div className="space-y-3 rounded-lg bg-surface-sunken px-6 py-10 text-center">
    <Icon size={26} className="mx-auto text-muted-foreground" aria-hidden="true" />
    <p className="font-replica text-lg font-medium leading-6 text-foreground">{title}</p>
    {children ? <div className="mx-auto max-w-sm text-[15px] leading-[21px] text-muted-foreground">{children}</div> : null}
    {action ? <div className="pt-1">{action}</div> : null}
  </div>
);
