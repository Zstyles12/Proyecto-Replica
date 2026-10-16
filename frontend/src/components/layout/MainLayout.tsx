import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { SpiralBinding } from "./SpiralBinding";
import { BottomNav } from "./BottomNav";
import { useImmersive } from "../../lib/layout";
import { ShareDialog } from "../../features/cofre/components/ShareDialog";

/**
 * Layout de la app (DESIGN-WEB.md §2):
 * - Menos de 768 px: barra inferior flotante, como la app.
 * - Desde 768 px: barra lateral fija de 240 px.
 * - El contenido en su columna; cada pantalla decide si suma un panel a la derecha desde 1024 px.
 * - Cambio de sección: fundido de 220 ms subiendo 8 px (DESIGN.md §7.2).
 */
export const MainLayout: React.FC = () => {
  const location = useLocation();
  const immersive = useImmersive();

  // Al cambiar de pantalla se empieza desde arriba.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-background bg-warp-lines text-foreground">
      <SidebarNav />
      <SpiralBinding />

      <main className="min-h-screen md:pl-60">
        <div
          className={`mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 ${
            immersive ? "pb-0 pt-0 md:pb-12 md:pt-8" : "pb-28 pt-8 md:pb-12"
          }`}
        >
          <div key={location.pathname} className="animate-section-enter">
            <Outlet />
          </div>
        </div>
      </main>

      {immersive ? null : <BottomNav />}
      <ShareDialog />
    </div>
  );
};
