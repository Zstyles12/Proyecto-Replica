import React, { useId } from "react";
import { CrisisButton } from "../help/CrisisButton";

/**
 * Una pantalla del área profesional (DESIGN-WEB.md §10, "Anchos"): el contenido y, desde 1024 px, el
 * panel contextual fijo a la derecha, de 360 a 440 px. Por debajo, el panel no se dibuja: lo que lleve
 * se abre como hoja o panel superpuesto.
 */
export const ProfessionalPage: React.FC<{
  title: string;
  description?: string;
  panelTitle?: string;
  panel?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, description, panelTitle, panel, children }) => {
  const panelTitleId = useId();

  return (
    <div className={panel ? "lg:grid lg:grid-cols-[minmax(0,1fr)_clamp(22.5rem,30vw,27.5rem)]" : undefined}>
      <div className="min-w-0 space-y-6 px-4 pb-28 pt-8 sm:px-6 md:pb-12 lg:px-8">
        <header className="space-y-2">
          {/* En el teléfono, Ayuda en crisis va a la derecha del título; desde 768 px, en la barra lateral. */}
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h1 className="min-w-0 break-words font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">{title}</h1>
            <CrisisButton variant="header" withText className="md:hidden" />
          </div>
          {description ? <p className="text-[15px] leading-[21px] text-muted-foreground">{description}</p> : null}
        </header>
        {children}
      </div>

      {panel ? (
        <aside
          aria-labelledby={panelTitleId}
          className="sticky top-0 hidden h-screen self-start overflow-y-auto border-l border-border/30 bg-surface-raised p-6 lg:block"
        >
          <h2 id={panelTitleId} className="font-replica text-xl font-medium leading-[26px] text-foreground">
            {panelTitle}
          </h2>
          {panel}
        </aside>
      ) : null}
    </div>
  );
};
