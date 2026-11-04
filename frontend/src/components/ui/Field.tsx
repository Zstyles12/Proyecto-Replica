import React, { useId } from "react";

const BOX =
  "w-full rounded-md border bg-surface px-4 py-3 text-base text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-voice/40";

type Common = {
  label: string;
  hint?: string;
  // El error va junto al campo, en emotion: nunca en rojo ni solo con color.
  error?: string | null;
  // El conteo de caracteres, como dato ("120 de 280").
  count?: { value: number; max: number };
};

/**
 * Un campo con su `<label htmlFor>`, su ayuda y su error enlazados con `aria-describedby` (AGENTS.md,
 * "Accesibilidad"). Con `multiline` es un `<textarea>`. Texto a 16 px, para que iOS no acerque la pantalla.
 */
export const Field = React.forwardRef<
  HTMLInputElement & HTMLTextAreaElement,
  Common & { multiline?: boolean; rows?: number } & React.InputHTMLAttributes<HTMLInputElement> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ label, hint, error, count, multiline, rows = 4, id: givenId, className = "", ...props }, ref) => {
  const ownId = useId();
  const id = givenId ?? ownId;
  const hintId = `${id}-ayuda`;
  const errorId = `${id}-error`;
  const countId = `${id}-conteo`;
  const describedBy = [hint ? hintId : null, count ? countId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const box = `${BOX} ${error ? "border-emotion" : "border-border"} ${className}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea ref={ref} id={id} rows={rows} aria-invalid={!!error || undefined} aria-describedby={describedBy} className={`${box} resize-none`} {...props} />
      ) : (
        <input ref={ref} id={id} aria-invalid={!!error || undefined} aria-describedby={describedBy} className={`${box} min-h-12`} {...props} />
      )}
      {hint || count ? (
        <div className="flex items-start justify-between gap-3 text-xs text-muted-foreground">
          {hint ? <p id={hintId}>{hint}</p> : <span />}
          {count ? (
            <p id={countId} className="shrink-0 tabular-nums">
              {count.value} de {count.max}
            </p>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-[13px] text-emotion">
          {error}
        </p>
      ) : null}
    </div>
  );
});
Field.displayName = "Field";
