import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

/** Lo que tarda en irse (DESIGN.md §7.1, duration.exit). */
const EXIT_MS = 180;

// Ventanas abiertas, de la más vieja a la más nueva: Escape cierra solo la de arriba, y el resto
// de la página vuelve a ser interactiva cuando se cierra la última.
const stack: symbol[] = [];

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Acciones al pie (por ejemplo, Cancelar y Guardar). */
  footer?: React.ReactNode;
  size?: DialogSize;
  closeLabel?: string;
  /**
   * `side`: el panel lateral del área profesional (DESIGN-WEB.md §10). En el teléfono, una hoja a
   * pantalla completa; desde 768 px, pegado a la derecha y a toda la altura (hasta 440 px).
   */
  variant?: "center" | "side";
}

const WIDTHS: Record<DialogSize, string> = {
  sm: "md:max-w-md",
  md: "md:max-w-lg",
  lg: "md:max-w-2xl",
};

/**
 * Ventana y hoja de Replica (DESIGN-WEB.md §5): en el teléfono sube desde abajo como una hoja; desde
 * 768 px es una ventana centrada. Se monta fuera de la página (portal), deja el resto inerte, se
 * cierra con Escape o tocando el fondo y devuelve el foco a donde estaba.
 *
 * Para enfocar un campo al abrir, márcalo con `data-autofocus`.
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeLabel = "Cerrar",
  variant = "center",
}) => {
  const side = variant === "side";
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Sigue montada mientras hace su salida.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const closing = present && !open;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setPresent(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    const token = Symbol("dialog");
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.getElementById("root");

    stack.push(token);
    root?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === token) {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      stack.splice(stack.indexOf(token), 1);
      if (stack.length === 0) {
        root?.removeAttribute("inert");
        document.body.style.overflow = "";
      }
      previous?.focus();
    };
  }, [open]);

  if (!present) return null;

  return createPortal(
    <div
      className={`dialog-root fixed inset-0 z-[60] flex ${side ? "justify-end" : "items-end justify-center md:items-center md:p-6"}`}
      data-state={closing ? "closed" : "open"}
      data-variant={variant}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="dialog-backdrop absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`dialog-panel relative flex w-full flex-col border-border/40 bg-surface-raised shadow-raised focus:outline-none dark:shadow-none ${
          side
            ? "h-[100dvh] md:max-w-[27.5rem] md:border-l"
            : `max-h-[88vh] rounded-t-xl border md:max-h-[85vh] md:rounded-lg ${WIDTHS[size]}`
        }`}
      >
        <header className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="font-replica text-xl font-normal text-foreground md:text-2xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-[15px] leading-[21px] text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-small hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {children ? <div className={`min-h-0 overflow-y-auto px-6 pb-6 ${side ? "flex-1" : ""}`}>{children}</div> : null}

        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2.5 border-t border-border/30 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Solo para borrar algo: el botón va en `destructive`. */
  destructive?: boolean;
}

/** Una pregunta antes de una acción que importa. Reemplaza a `window.confirm`. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive = false,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    size="sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? "destructive" : "primary"}
          size="sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </>
    }
  />
);
