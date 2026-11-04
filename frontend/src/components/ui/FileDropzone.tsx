import React, { useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { fileSize } from "../../lib/format";

export type DropItem = {
  key: string;
  name: string;
  sizeBytes: number;
  // De 0 a 1 mientras sube.
  progress: number;
  done: boolean;
  error?: string;
};

/**
 * Para arrastrar o elegir archivos (DESIGN-WEB.md §10): es un `<label>` de un `<input type="file">`, así
 * funciona con teclado (Tab y Enter) y al tocar. Por cada archivo, el nombre, el peso y su barra de
 * progreso; los errores van junto al archivo, y "Quitar" dice cuál quita.
 */
export const FileDropzone: React.FC<{
  label: string;
  hint: string;
  items: DropItem[];
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
  error?: string | null;
  accept?: string;
}> = ({ label, hint, items, onAdd, onRemove, error, accept = "application/pdf" }) => {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <p className="text-[13px] text-muted-foreground" id={`${inputId}-titulo`}>
        {label}
      </p>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (e.dataTransfer.files.length) onAdd([...e.dataTransfer.files]);
        }}
        className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors duration-small has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-voice ${
          over ? "border-voice bg-voice-soft/30" : error ? "border-emotion/60 bg-surface" : "border-border bg-surface hover:border-voice/50"
        }`}
      >
        <Upload size={22} className="text-voice" aria-hidden="true" />
        <span className="text-[15px] font-semibold text-foreground">Arrastra tus PDF o elígelos</span>
        <span id={hintId} className="text-[13px] text-muted-foreground">
          {hint}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          aria-labelledby={`${inputId}-titulo`}
          aria-describedby={[hintId, error ? errorId : null].filter(Boolean).join(" ")}
          aria-invalid={!!error || undefined}
          onChange={(e) => {
            const files = e.target.files ? [...e.target.files] : [];
            // Para poder elegir otra vez el mismo archivo después de quitarlo.
            e.target.value = "";
            if (files.length) onAdd(files);
          }}
        />
      </label>
      {error ? (
        <p id={errorId} role="alert" className="text-[13px] text-emotion">
          {error}
        </p>
      ) : null}
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="space-y-2 rounded-md border border-border/50 bg-surface-raised px-3 py-2.5">
              <div className="flex items-center gap-3">
                <FileText size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-[15px] text-foreground">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {fileSize(item.sizeBytes)}
                    {item.done && !item.error ? " · Listo" : ""}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onRemove(item.key);
                    // El botón desaparece con el archivo: el foco vuelve a la zona para elegir otro.
                    inputRef.current?.focus();
                  }}
                  aria-label={`Quitar ${item.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {item.error ? (
                <p role="alert" className="text-[13px] text-emotion">
                  {item.error}
                </p>
              ) : !item.done ? (
                <div
                  role="progressbar"
                  aria-label={`Subiendo ${item.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(item.progress * 100)}
                  className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
                >
                  <div className="h-full rounded-full bg-voice transition-[width] duration-small ease-out" style={{ width: `${item.progress * 100}%` }} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
