import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "../../lib/session";
import type { AccountRole } from "../../services/auth";

// Una ruta de otro rol lleva a Inicio (DESIGN-WEB.md §10). Solo ordena la interfaz: el permiso real lo
// dan las reglas de acceso del servidor.
export const RequireRole: React.FC<{ role: AccountRole }> = ({ role }) =>
  useRole() === role ? <Outlet /> : <Navigate to="/" replace />;
