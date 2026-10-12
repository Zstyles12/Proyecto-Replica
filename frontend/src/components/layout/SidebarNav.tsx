import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Feather,
  NotebookText,
  ChartSpline,
  MessageCircle,
  CircleUserRound,
  Sun,
  Moon,
  Laptop,
  Code2,
} from "lucide-react";
import { NAVIGATION_CONTENT, type NavItem } from "../../data/navigationContent";
import { useTheme } from "../../hooks/useTheme";
import { LogoMark } from "../brand/LogoMark";

const ICON_MAP = {
  Feather,
  NotebookText,
  ChartSpline,
  MessageCircle,
  CircleUserRound,
};

/**
 * Barra lateral para escritorio según Sección 6 de DESIGN.md:
 * - Fija a la izquierda (240 px de ancho).
 * - Misma estructura de 5 secciones que la app.
 * - Indicador salvia activo de 2.5 px.
 * - Control de tema integrado al pie.
 */
export const SidebarNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme, setTheme } = useTheme();

  const sections = NAVIGATION_CONTENT.sections;

  return (
    <aside
      aria-label="Navegación principal de escritorio"
      className="hidden md:flex flex-col justify-between fixed left-0 top-0 bottom-0 w-60 z-40 bg-surface-raised border-r border-border/30 p-6 select-none"
    >
      {/* Cabecera / Marca */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <span className="font-replica text-2xl font-normal tracking-tight text-foreground block leading-tight">
              {NAVIGATION_CONTENT.brand.name}
            </span>
            
          </div>
        </div>

        {/* Lista de enlaces */}
        <nav className="space-y-1.5" aria-label="Secciones">
          {sections.map((item: NavItem) => {
            const isActive =
              item.path === "/" ? currentPath === "/" : currentPath.startsWith(item.path);
            const IconComponent = ICON_MAP[item.iconName];

            return (
              <Link
                key={item.id}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm transition-all duration-small relative ${
                  isActive
                    ? "bg-voice-soft/25 text-voice font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {/* Hilo salvia de 2.5 px activo a la izquierda */}
                {isActive && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[2.5px] h-5 bg-voice rounded-full" />
                )}
                <IconComponent size={18} strokeWidth={2} className="shrink-0 ml-1" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pie de barra lateral: Tema y Playground */}
      <div className="space-y-4 pt-4 border-t border-border/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tema</span>
          <div role="group" aria-label="Tema" className="inline-flex p-0.5 rounded-full bg-surface-sunken border border-border/30">
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              title="Tema claro"
              aria-label="Tema claro"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                theme === "light"
                  ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun size={13} />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              title="Tema oscuro"
              aria-label="Tema oscuro"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                theme === "dark"
                  ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon size={13} />
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              aria-pressed={theme === "system"}
              title="Tema del sistema"
              aria-label="Tema del sistema"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                theme === "system"
                  ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Laptop size={13} />
            </button>
          </div>
        </div>

        {import.meta.env.DEV ? (
        <Link
          to="/playground"
          className="flex items-center gap-2 text-xs text-subtle hover:text-voice transition-colors py-1 px-1.5 rounded-md hover:bg-surface"
        >
          <Code2 size={14} />
          <span>{NAVIGATION_CONTENT.footerLinks.playground}</span>
        </Link>
        ) : null}
      </div>
    </aside>
  );
};
