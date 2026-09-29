import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Feather, NotebookText, ChartSpline, MessageCircle, CircleUserRound } from "lucide-react";
import { NAVIGATION_CONTENT, type NavItem } from "../../data/navigationContent";

const ICON_MAP = {
  Feather,
  NotebookText,
  ChartSpline,
  MessageCircle,
  CircleUserRound,
};

/**
 * Barra de navegación móvil flotante según Sección 6 de DESIGN.md:
 * - Flotante, a 16 px de los lados (left-4 right-4 bottom-4).
 * - Altura: 62 px (h-[62px]).
 * - Redondeada completa (rounded-full).
 * - Fondo: surface-raised translúcido con desenfoque.
 * - Hilo salvia de 2.5 px bajo el ícono que se desliza entre pestañas en 250 ms (Sección 6 y 7.1).
 */
export const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sections = NAVIGATION_CONTENT.sections;
  const activeIndex = sections.findIndex((s) =>
    s.path === "/" ? currentPath === "/" : currentPath.startsWith(s.path)
  );

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="md:hidden fixed bottom-4 left-4 right-4 h-[62px] z-50 rounded-full bg-surface-raised/85 backdrop-blur-md border border-border/40 shadow-raised dark:shadow-none flex items-center justify-between px-2 select-none"
    >
      {/* Contenedor relativo para posicionar los 5 botones y el hilo deslizante */}
      <div className="relative flex w-full h-full items-center">
        {/* Hilo salvia deslizante de 2.5 px (Sección 6 y 7.1) */}
        {activeIndex !== -1 && (
          <div
            className="absolute top-[36px] transition-all duration-indicator ease-in-out flex justify-center pointer-events-none"
            style={{
              width: "20%",
              left: `${activeIndex * 20}%`,
            }}
          >
            <div className="w-5 h-[2.5px] bg-voice rounded-full" />
          </div>
        )}

        {sections.map((item: NavItem) => {
          const isActive =
            item.path === "/" ? currentPath === "/" : currentPath.startsWith(item.path);
          const IconComponent = ICON_MAP[item.iconName];

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center h-full relative transition-colors duration-small ${
                isActive ? "text-voice font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center justify-center h-6 w-6">
                <IconComponent size={20} strokeWidth={2} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
