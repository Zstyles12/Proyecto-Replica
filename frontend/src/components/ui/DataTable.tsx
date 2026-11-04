import React, { useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

// Desde cuánto espacio propio se dibuja la tabla, y desde cuánto caben las columnas secundarias.
const TABLE_MIN = 560;
const SECONDARY_MIN = 760;

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  // Se oculta cuando la tabla tiene poco espacio.
  secondary?: boolean;
  // Si se puede ordenar por esta columna, el orden en que está ahora.
  sort?: "ascending" | "descending" | "none";
  onSort?: () => void;
  className?: string;
};

/**
 * Una tabla de datos (DESIGN-WEB.md §10): con espacio, una `<table>` con su título, encabezados
 * `scope="col"` y `aria-sort`; con poco, una lista de tarjetas, una por fila. Decide por el ancho que
 * tiene de verdad, no por el de la ventana: en el área profesional el panel contextual le quita sitio.
 * Se dibuja solo una de las dos, para que el lector de pantalla no lea dos veces lo mismo.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  card,
  selected,
}: {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  // La tarjeta de cada fila en los anchos menores.
  card: (row: T) => React.ReactNode;
  selected?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visible = columns.filter((c) => !c.secondary || width >= SECONDARY_MIN);

  return (
    <div ref={ref}>
      {width < TABLE_MIN ? (
        <ul aria-label={caption} className="space-y-3">
          {rows.map((row) => (
            <li key={rowKey(row)}>{card(row)}</li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/40 bg-surface-raised">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-border/40">
                {visible.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={c.sort}
                    className={`px-4 py-3 text-[13px] font-medium text-muted-foreground ${c.className ?? ""}`}
                  >
                    {c.onSort ? (
                      <button
                        type="button"
                        onClick={c.onSort}
                        className="-mx-1 inline-flex min-h-11 items-center gap-1 rounded px-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
                      >
                        {c.header}
                        {c.sort === "ascending" ? <ArrowUp size={14} aria-hidden="true" /> : c.sort === "descending" ? <ArrowDown size={14} aria-hidden="true" /> : null}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const key = rowKey(row);
                return (
                  <tr
                    key={key}
                    aria-current={selected === key || undefined}
                    className={`border-b border-border/30 last:border-b-0 ${selected === key ? "bg-voice-soft/20" : ""}`}
                  >
                    {visible.map((c) => (
                      <td key={c.key} className={`px-4 py-3 align-middle text-[15px] text-foreground ${c.className ?? ""}`}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
