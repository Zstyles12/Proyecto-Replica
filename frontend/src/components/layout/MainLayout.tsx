import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { SpiralBinding } from "./SpiralBinding";
import { BottomNav } from "./BottomNav";
import { OfflineNotice } from "./OfflineNotice";
import { useImmersive } from "../../lib/layout";
import { useRole } from "../../lib/session";
import { ShareDialog } from "../../features/cofre/components/ShareDialog";
import { NAVIGATION_CONTENT, type NavItem } from "../../data/navigationContent";
import type { AccountRole } from "../../services/auth";

function personalSections(role: AccountRole): NavItem[] {
  const { sections, areas } = NAVIGATION_CONTENT;
  return role === "user" ? sections : [...sections, areas[role].entry];
}

/**
 * Layout de la app (DESIGN-WEB.md §2):
 * - Menos de 768 px: barra inferior flotante, como la app.
 * - Desde 768 px: barra lateral fija de 240 px.
 * - El contenido en su columna; cada pantalla decide si suma un panel a la derecha desde 1024 px.
 * - Cambio de sección: fundido de 220 ms subiendo 8 px (DESIGN.md §7.2).
 *
 * Con `area`, es el área profesional o de administración (§10): su propia navegación y sin el ancho
 * máximo, porque el panel contextual llega hasta el borde. Cada pantalla pone sus márgenes con
 * ProfessionalPage.
 */
export const MainLayout: React.FC<{ area?: "psychologist" | "admin" }> = ({ area }) => {
  const location = useLocation();
  const immersive = useImmersive();
  const role = useRole();
  const professional = area ? NAVIGATION_CONTENT.areas[area] : null;
  const sections = professional?.sections ?? personalSections(role);

  // Al cambiar de pantalla se empieza desde arriba.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const page = (
    <div key={location.pathname} className="animate-section-enter">
      <Outlet />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background bg-warp-lines text-foreground">
      <SidebarNav sections={sections} areaLabel={professional?.label} />
      <SpiralBinding />

      <main className="min-h-screen md:pl-60">
        {professional ? (
          <>
            <OfflineNotice className="px-4 pt-4 empty:hidden sm:px-6 lg:px-8" />
            {page}
          </>
        ) : (
          <div
            className={`mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 ${
              immersive ? "pb-0 pt-0 md:pb-12 md:pt-8" : "pb-28 pt-8 md:pb-12"
            }`}
          >
            <OfflineNotice className={`max-w-[680px] empty:hidden lg:max-w-none ${immersive ? "pt-2 md:pt-0" : ""} [&:not(:empty)]:mb-4`} />
            {page}
          </div>
        )}
      </main>

      {immersive ? null : <BottomNav sections={sections} crisis={!professional} />}
      <ShareDialog />
    </div>
  );
};
