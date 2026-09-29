import React from "react";
import { Search, X } from "lucide-react";
import { NOTAS_CONTENT } from "../../../data/notasContent";

interface NotesHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  query,
  onQueryChange,
}) => {
  const { header, search } = NOTAS_CONTENT;

  return (
    <div className="space-y-4">
      {/* Título de sección */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-replica text-3xl md:text-4xl font-normal tracking-tight text-foreground">
            {header.title}
          </h1>
          <p className="font-voice text-sm md:text-base text-muted-foreground mt-1">
            {header.description}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda interactiva */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3.5 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={search.placeholder}
          aria-label={search.inputAria}
          className="w-full h-11 pl-10 pr-10 rounded-full bg-surface-raised border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-voice/50 focus:border-voice transition-all shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label={search.clearAria}
            className="absolute right-3.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotesHeader;
