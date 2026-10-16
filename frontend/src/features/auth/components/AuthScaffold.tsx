import React from "react";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { ReplicaMark } from "../../../components/brand/Logo";

type Action = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

interface AuthScaffoldProps {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  // 0–1: cuánto se ha tejido de la configuración. Sin valor, no se muestra.
  progress?: number;
  skip?: { label: string; onPress: () => void };
  // La acción principal, abajo. `Enter` la ejecuta.
  primary?: Action;
  // Una acción secundaria bajo la principal (un enlace).
  secondary?: { label: string; onPress: () => void };
  // Cambia cuando cambia el paso: el título y el contenido vuelven a entrar.
  stepKey?: string | number;
  children?: React.ReactNode;
}

/**
 * Base de las pantallas de cuenta y configuración (features/auth/components/auth-scaffold.tsx de la
 * app): la urdimbre de fondo, un título grande con su explicación y la acción siempre a mano. En el
 * teléfono ocupa la pantalla; en escritorio, una tarjeta centrada (DESIGN-WEB.md §4, Registro).
 */
export const AuthScaffold: React.FC<AuthScaffoldProps> = ({
  title,
  subtitle,
  onBack,
  progress,
  skip,
  primary,
  secondary,
  stepKey,
  children,
}) => {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (primary && !primary.disabled && !primary.loading) primary.onPress();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background bg-warp-lines">
      <form
        onSubmit={submit}
        noValidate
        className="mx-auto flex w-full max-w-[480px] flex-1 flex-col md:my-10 md:flex-none md:rounded-lg md:border md:border-border/40 md:bg-surface-raised md:shadow-raised md:dark:shadow-none"
      >
        <div className="flex h-14 items-center justify-between px-2 pt-2 md:px-3">
          <div className="flex w-24 items-center">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver"
                className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
              >
                <ChevronLeft size={26} aria-hidden="true" />
              </button>
            ) : (
              <span className="flex h-11 items-center pl-3" aria-hidden="true">
                <ReplicaMark size={36} />
              </span>
            )}
          </div>
          {progress !== undefined ? <Progress value={progress} /> : null}
          <div className="flex w-24 justify-end">
            {skip ? (
              <Button type="button" variant="ghost" size="sm" onClick={skip.onPress}>
                {skip.label}
              </Button>
            ) : null}
          </div>
        </div>

        <div key={stepKey} className="flex flex-1 flex-col gap-7 px-5 pb-6 pt-6 md:px-8">
          <header className="enter space-y-3">
            <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">
              {title}
            </h1>
            {typeof subtitle === "string" ? (
              <p className="text-[15px] leading-[21px] text-muted-foreground">{subtitle}</p>
            ) : (
              subtitle
            )}
          </header>
          {children ? (
            <div className="enter" style={{ "--enter-index": 1 } as React.CSSProperties}>
              {children}
            </div>
          ) : null}
        </div>

        {primary || secondary ? (
          <div className="sticky bottom-0 mt-auto space-y-1 bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:static md:bg-transparent md:px-8 md:pb-8">
            {primary ? (
              <Button
                type="submit"
                size="lg"
                disabled={primary.disabled || primary.loading}
                icon={primary.loading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : undefined}
                className="w-full"
              >
                {primary.label}
              </Button>
            ) : null}
            {secondary ? (
              <Button type="button" variant="ghost" onClick={secondary.onPress} className="w-full">
                {secondary.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
};

// El progreso de la configuración es un hilo que se va tejiendo, como la marca.
function Progress({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label="Progreso de la configuración"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="relative h-3 w-[120px]"
    >
      <span className="absolute inset-x-0 top-[5px] h-[2px] rounded-full bg-border/60" />
      <span
        className="absolute left-0 top-[5px] h-[2.5px] rounded-full bg-voice transition-[width] duration-[420ms] ease-out motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
