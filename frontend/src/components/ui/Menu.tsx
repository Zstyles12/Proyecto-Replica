import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type MenuItem = { label: string; onSelect: () => void; destructive?: boolean };

/**
 * Un menú desplegable ("Más acciones", DESIGN-WEB.md §10): un botón con `aria-haspopup` y una lista
 * `role="menu"`. Se mueve con las flechas, Inicio y Fin; Escape o Tab lo cierran y el foco vuelve al
 * botón. Tocar fuera también lo cierra.
 */
export const Menu: React.FC<{ label: string; items: MenuItem[]; align?: "start" | "end" }> = ({ label, items, align = "end" }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  const focusItem = (index: number) => {
    const all = listRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']");
    if (!all?.length) return;
    all[(index + all.length) % all.length].focus();
  };

  useEffect(() => {
    if (!open) return;
    focusItem(0);
    const onPointer = (e: PointerEvent) => {
      if (!listRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const all = [...(listRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? [])];
    const current = all.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") focusItem(current + 1);
    else if (e.key === "ArrowUp") focusItem(current - 1);
    else if (e.key === "Home") focusItem(0);
    else if (e.key === "End") focusItem(all.length - 1);
    else if (e.key === "Escape") close(true);
    else if (e.key === "Tab") return close(false);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((x) => !x)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-muted px-4 text-[15px] font-semibold text-foreground transition-colors duration-small hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {label}
        <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-small motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <ul
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className={`enter absolute top-full z-40 mt-2 min-w-[14rem] rounded-md border border-border/50 bg-surface-raised p-1 shadow-raised dark:shadow-none ${
            align === "end" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => {
                  close(true);
                  item.onSelect();
                }}
                className={`flex min-h-11 w-full items-center rounded px-3 text-left text-[15px] hover:bg-surface focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                  item.destructive ? "text-destructive" : "text-foreground"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
