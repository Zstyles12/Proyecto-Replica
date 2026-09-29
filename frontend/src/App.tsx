import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Inicio } from "./pages/Inicio";
import { Notas } from "./pages/Notas";
import { Evolucion } from "./pages/Evolucion";
import { Chat } from "./pages/Chat";
import { Usuario } from "./pages/Usuario";
import { Playground } from "./pages/Playground";
import { AuthFlow } from "./pages/auth/AuthFlow";
import { authService, type AuthSession } from "./services/auth";
import { unlockAudio } from "./lib/sounds";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = authService.getSession();
  if (!session || !session.user.isConfigured) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const session = authService.getSession();
  if (session && session.user.isConfigured) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function App() {
  const [, setSessionState] = useState<AuthSession | null>(() =>
    authService.getSession()
  );

  useEffect(() => {
    return authService.subscribe(() => {
      setSessionState(authService.getSession());
    });
  }, []);

  // Pre-calentar y desbloquear el contexto de audio en la primera interacción del usuario
  useEffect(() => {
    const handleFirstGesture = () => {
      unlockAudio();
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
    };

    window.addEventListener("pointerdown", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("keydown", handleFirstGesture, { once: true, passive: true });
    window.addEventListener("click", handleFirstGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("click", handleFirstGesture);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Onboarding y Autenticación */}
        <Route
          path="/auth"
          element={
            <RedirectIfAuth>
              <AuthFlow />
            </RedirectIfAuth>
          }
        />

        {/* 5 Secciones principales protegidas por autenticación */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout>
                <Inicio />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/notas"
          element={
            <RequireAuth>
              <MainLayout>
                <Notas />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/evolucion"
          element={
            <RequireAuth>
              <MainLayout>
                <Evolucion />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <MainLayout>
                <Chat />
              </MainLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/usuario"
          element={
            <RequireAuth>
              <MainLayout>
                <Usuario />
              </MainLayout>
            </RequireAuth>
          }
        />

        {/* Ruta de desarrollo y auditoría visual (siempre accesible) */}
        <Route path="/playground" element={<Playground />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
