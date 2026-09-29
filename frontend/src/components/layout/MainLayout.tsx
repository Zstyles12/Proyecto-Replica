import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal responsivo según DESIGN.md:
 * - Columna de lectura central de 680 px (rango 640–720 px, Sección 5).
 * - Barra lateral de 240 px fija en desktop (Sección 6).
 * - Barra flotante inferior de 62 px a 16 px de bordes en mobile (Sección 6).
 * - Transición de cambio de ruta: fundido cruzado de 220 ms subiendo 8 px (Sección 7.2).
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground bg-warp-lines relative">
      {/* Barra de navegación de escritorio */}
      <SidebarNav />

      {/* Contenedor de contenido responsivo (hasta 1024px para cuadrícula de 2 columnas en desktop, Sección 5) */}
      <main className="md:pl-60 min-h-screen">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 md:pb-12">
          {/* Animación por cambio de sección (Sección 7.2) */}
          <div key={location.pathname} className="animate-section-enter">
            {children}
          </div>
        </div>
      </main>

      {/* Barra de navegación móvil */}
      <BottomNav />
    </div>
  );
};
