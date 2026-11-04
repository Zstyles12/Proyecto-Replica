import React, { useEffect, useRef } from "react";
import { Download, Search, X } from "lucide-react";

/**
 * El título de Notas y su búsqueda comparten la misma fila (features/notes/components/notes-header.tsx
 * de la app): al buscar, el campo toma el lugar del título y la lista de abajo no se mueve. Escape la
 * cierra.
 */
export const NotesHeader: React.FC<{
  query: string;
  onQueryChange: (q: string) => void;
  searching: boolean;
  onSearchingChange: (searching: boolean) => void;
  // Abre la hoja de exportar (DESIGN-WEB.md §11). Mientras se busca, el campo ocupa la fila.
  onExport?: () => void;
}> = ({ query, onQueryChange, searching, onSearchingChange, onExport }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  const close = () => {
    onQueryChange("");
    onSearchingChange(false);
  };

  return (
    <div className="flex h-12 items-center gap-2">
      {searching ? (
        <div className="enter flex h-12 flex-1 items-center rounded-full border border-border/40 bg-surface-raised pl-4 pr-1 shadow-xs focus-within:ring-2 focus-within:ring-voice/40">
          <Search size={17} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="notes-search" className="sr-only">
            Buscar en tus notas y réplicas
          </label>
          <input
            ref={inputRef}
            id="notes-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
            placeholder="Buscar en tus notas y réplicas"
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground placeholder:text-subtle focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      ) : (
        <>
          <h1 className="flex-1 font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">Notas</h1>
          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              aria-label="Exportar tus notas"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              <Download size={19} aria-hidden="true" />
            </button>
          ) : null}
        </>
      )}
      <button
        type="button"
        onClick={searching ? close : () => onSearchingChange(true)}
        aria-label={searching ? "Cerrar la búsqueda" : "Buscar en tus notas"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
      >
        {searching ? <X size={19} aria-hidden="true" /> : <Search size={19} aria-hidden="true" />}
      </button>
    </div>
  );
};
