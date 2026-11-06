import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { DocumentTitle } from "./components/layout/DocumentTitle";
import { MainLayout } from "./components/layout/MainLayout";
import { RequireRole } from "./components/layout/RequireRole";
import { TourHost } from "./components/tour/TourHost";
import { Button } from "./components/ui/Button";
import { useInactivityLock } from "./features/lock/useInactivityLock";
import { useLocked } from "./lib/lock";
import { sessionActions, useAccount, useStage } from "./lib/session";
import { Bloqueado, FromLock, ToLock } from "./pages/Bloqueado";
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
const ChatTerminado = lazy(() => import("./pages/Chat").then((m) => ({ default: m.ChatTerminado })));
const Directorio = lazy(() => import("./pages/Directorio").then((m) => ({ default: m.Directorio })));
const PsicologoPerfil = lazy(() => import("./pages/PsicologoPerfil").then((m) => ({ default: m.PsicologoPerfil })));
const Usuario = lazy(() => import("./pages/Usuario").then((m) => ({ default: m.Usuario })));
const SoyPsicologo = lazy(() => import("./pages/SoyPsicologo").then((m) => ({ default: m.SoyPsicologo })));
const Cofre = lazy(() => import("./pages/Cofre").then((m) => ({ default: m.Cofre })));
// Solo en desarrollo: en producción ni siquiera se publica el archivo.
const Playground = import.meta.env.DEV ? lazy(() => import("./pages/Playground").then((m) => ({ default: m.Playground }))) : null;
const Legal = lazy(() => import("./pages/Legal").then((m) => ({ default: m.Legal })));
const Dashboard = lazy(() => import("./pages/profesional/Dashboard").then((m) => ({ default: m.Dashboard })));
const Mensajes = lazy(() => import("./pages/profesional/Mensajes").then((m) => ({ default: m.Mensajes })));
const Paciente = lazy(() => import("./pages/profesional/Paciente").then((m) => ({ default: m.Paciente })));
const Ayuda = lazy(() => import("./pages/Ayuda").then((m) => ({ default: m.Ayuda })));
const ChatIA = lazy(() => import("./pages/ChatIA").then((m) => ({ default: m.ChatIA })));
const Admin = lazy(() => import("./pages/profesional/Admin").then((m) => ({ default: m.Admin })));

function ConfigurarRoute() {
  const navigate = useNavigate();
  return <Configurar onFinish={() => navigate("/listo", { replace: true })} />;
}

// No se pudo traer la cuenta: casi siempre es la conexión, y se puede volver a intentar.
function Unreachable() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <p role="alert" className="max-w-sm font-replica text-xl leading-[28px] text-foreground">
        No pudimos traer tu diario. Revisa tu conexión e inténtalo otra vez.
      </p>
      <Button onClick={sessionActions.retryEnter}>Intentar de nuevo</Button>
    </main>
  );
}

// Cada etapa solo ve sus pantallas (lib/session.ts): sin cuenta, la bienvenida y la cuenta; con
// cuenta, el consentimiento; después la configuración; y al final la app. Cualquier otra dirección
// lleva a la pantalla que toca. Términos y Privacidad se pueden abrir siempre.
export function App() {
  const stage = useStage();
  const account = useAccount();
  // El bloqueo de este navegador (RF-52): con él puesto, solo /bloqueado.
  const locked = useLocked(stage === "app" ? account?.email : null);
  useInactivityLock(stage === "app" ? account?.email : null);

  if (stage === "loading") return <div className="min-h-screen bg-background" />;
  if (stage === "unreachable") return <Unreachable />;

  return (
    <BrowserRouter>
      <DocumentTitle />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes>
        <Route path="/legal/:doc" element={<Legal />} />
        {Playground ? <Route path="/playground" element={<Playground />} /> : null}

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

        {stage === "app" && locked ? (
          <>
            <Route path="/bloqueado" element={<Bloqueado />} />
            <Route path="*" element={<ToLock />} />
          </>
        ) : null}

        {stage === "app" && !locked ? (
          <>
            <Route path="/bloqueado" element={<FromLock />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Inicio />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="/notas/:id" element={<NotaDetalle />} />
              <Route path="/replica-dia/:dia" element={<TuDia />} />
              <Route path="/evolucion" element={<Evolucion />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/conversacion/:id" element={<ChatTerminado />} />
              <Route path="/chat/directorio" element={<Directorio />} />
              <Route path="/chat/ia" element={<ChatIA />} />
              <Route path="/chat/ia/:id" element={<ChatIA />} />
              <Route path="/ayuda" element={<Ayuda />} />
              <Route path="/psicologo/:id" element={<PsicologoPerfil />} />
              <Route path="/usuario" element={<Usuario />} />
              <Route path="/usuario/psicologo" element={<SoyPsicologo />} />
              <Route path="/cofre" element={<Cofre />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route element={<RequireRole role="psychologist" />}>
              <Route element={<MainLayout area="psychologist" />}>
                <Route path="/profesional/dashboard" element={<Dashboard />} />
                <Route path="/profesional/mensajes" element={<Mensajes />} />
                <Route path="/profesional/mensajes/:id" element={<Mensajes />} />
                <Route path="/profesional/pacientes/:id" element={<Paciente />} />
              </Route>
            </Route>
            <Route element={<RequireRole role="admin" />}>
              <Route element={<MainLayout area="admin" />}>
                <Route path="/profesional/admin" element={<Admin />} />
              </Route>
            </Route>
          </>
        ) : null}
      </Routes>
      </Suspense>
      {stage === "app" && !locked ? <TourHost /> : null}
    </BrowserRouter>
  );
}

export default App;
