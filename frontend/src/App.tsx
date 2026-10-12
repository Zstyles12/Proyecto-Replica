import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { TourHost } from "./components/tour/TourHost";
import { useStage } from "./lib/session";
import { Inicio } from "./pages/Inicio";
import { Notas } from "./pages/Notas";
import { NotaDetalle } from "./pages/NotaDetalle";
import { TuDia } from "./pages/TuDia";


// Se cargan aparte: el registro (con la planta animada) solo lo descarga quien llega nuevo, y la app
// solo quien ya tiene cuenta. Inicio, Notas y sus detalles van en el paquete principal.
const Bienvenida = lazy(() => import("./pages/auth/Bienvenida").then((m) => ({ default: m.Bienvenida })));
const Codigo = lazy(() => import("./pages/auth/Cuenta").then((m) => ({ default: m.Codigo })));
const Contrasena = lazy(() => import("./pages/auth/Cuenta").then((m) => ({ default: m.Contrasena })));
const Correo = lazy(() => import("./pages/auth/Cuenta").then((m) => ({ default: m.Correo })));
const Entrar = lazy(() => import("./pages/auth/Cuenta").then((m) => ({ default: m.Entrar })));
const Configurar = lazy(() => import("./pages/auth/Configuracion").then((m) => ({ default: m.Configurar })));
const Consentimiento = lazy(() => import("./pages/auth/Configuracion").then((m) => ({ default: m.Consentimiento })));
const Listo = lazy(() => import("./pages/auth/Configuracion").then((m) => ({ default: m.Listo })));
const Evolucion = lazy(() => import("./pages/Evolucion").then((m) => ({ default: m.Evolucion })));
const Chat = lazy(() => import("./pages/Chat").then((m) => ({ default: m.Chat })));
const Directorio = lazy(() => import("./pages/Directorio").then((m) => ({ default: m.Directorio })));
const PsicologoPerfil = lazy(() => import("./pages/PsicologoPerfil").then((m) => ({ default: m.PsicologoPerfil })));
const Usuario = lazy(() => import("./pages/Usuario").then((m) => ({ default: m.Usuario })));
const SoyPsicologo = lazy(() => import("./pages/SoyPsicologo").then((m) => ({ default: m.SoyPsicologo })));
const Cofre = lazy(() => import("./pages/Cofre").then((m) => ({ default: m.Cofre })));
const Playground = lazy(() => import("./pages/Playground").then((m) => ({ default: m.Playground })));
const Legal = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Legal })));

function ConfigurarRoute() {
  const navigate = useNavigate();
  return <Configurar onFinish={() => navigate("/listo", { replace: true })} />;
}

// Cada etapa solo ve sus pantallas (lib/session.ts): sin cuenta, la bienvenida y la cuenta; con
// cuenta, el consentimiento; después la configuración; y al final la app. Cualquier otra dirección
// lleva a la pantalla que toca. Términos y Privacidad se pueden abrir siempre.
export function App() {
  const stage = useStage();

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route path="/legal/:doc" element={<Legal />} />
        {import.meta.env.DEV ? <Route path="/playground" element={<Playground />} /> : null}

        {stage === "auth" ? (
          <>
            <Route path="/bienvenida" element={<Bienvenida />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/correo" element={<Correo />} />
            <Route path="/contrasena" element={<Contrasena />} />
            <Route path="/codigo" element={<Codigo />} />
            <Route path="*" element={<Navigate to="/bienvenida" replace />} />
          </>
        ) : null}

        {stage === "consent" ? (
          <>
            <Route path="/consentimiento" element={<Consentimiento />} />
            <Route path="*" element={<Navigate to="/consentimiento" replace />} />
          </>
        ) : null}

        {stage === "setup" ? (
          <>
            <Route path="/configurar" element={<ConfigurarRoute />} />
            <Route path="/listo" element={<Listo />} />
            <Route path="*" element={<Navigate to="/configurar" replace />} />
          </>
        ) : null}

        {stage === "app" ? (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/notas" element={<Notas />} />
            <Route path="/notas/:id" element={<NotaDetalle />} />
            <Route path="/replica-dia/:dia" element={<TuDia />} />
            <Route path="/evolucion" element={<Evolucion />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/directorio" element={<Directorio />} />
            <Route path="/psicologo/:id" element={<PsicologoPerfil />} />
            <Route path="/usuario" element={<Usuario />} />
            <Route path="/usuario/psicologo" element={<SoyPsicologo />} />
            <Route path="/cofre" element={<Cofre />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : null}
      </Routes>
      </Suspense>
      {stage === "app" ? <TourHost /> : null}
    </BrowserRouter>
  );
}

export default App;
