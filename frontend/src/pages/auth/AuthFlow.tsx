import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft, ArrowRight, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Pill } from "../../components/ui/Pill";
import { AuthForm } from "../../components/auth/AuthForm";
import { AUTH_CONTENT } from "../../data/authContent";
import { authService } from "../../services/auth";
import { WelcomeGarden } from "../../components/brand/WelcomeGarden";
import { WelcomeSun } from "../../components/brand/WelcomeSun";
import {
  playSound,
  stopSound,
  isSoundsEnabled,
  setSoundsEnabled,
  unlockAudio,
} from "../../lib/sounds";

export const AuthFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0); // 0: Welcome, 1: Form, 2: Consent, 3: Setup, 4: Ready
  const [formInitialMode, setFormInitialMode] = useState<"login" | "register">("register");

  // Detección de vista de escritorio (>= 1100 px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1100px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 1100px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Estado del sonido (silenciado por defecto en la web hasta que el usuario lo active)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isSoundsEnabled());

  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      setSoundEnabled(custom.detail?.enabled ?? isSoundsEnabled());
    };
    window.addEventListener("replica_sounds_change", handleSoundChange);
    return () => window.removeEventListener("replica_sounds_change", handleSoundChange);
  }, []);

  // Welcome sub-step (0: semilla, 1: brote, 2: flor)
  const [welcomeIndex, setWelcomeIndex] = useState(0);

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    if (!next) {
      stopSound("brote");
      stopSound("flor");
    }
    setSoundsEnabled(next);
    setSoundEnabled(next);
    if (next) {
      unlockAudio();
      if (welcomeIndex === 1) {
        playSound("brote");
      } else if (welcomeIndex === 2) {
        playSound("flor");
      }
    }
  }, [soundEnabled, welcomeIndex]);

  const handleWelcomeStepChange = useCallback(
    (nextIndex: number) => {
      if (nextIndex === welcomeIndex) return;
      if (nextIndex > welcomeIndex) {
        if (nextIndex === 1) {
          playSound("brote");
        } else if (nextIndex === 2) {
          playSound("flor");
        }
      } else {
        stopSound("brote");
        stopSound("flor");
      }
      setWelcomeIndex(nextIndex);
    },
    [welcomeIndex]
  );

  const handlePrimaryAction = useCallback(() => {
    if (welcomeIndex < 2) {
      handleWelcomeStepChange(welcomeIndex + 1);
    } else {
      setFormInitialMode("register");
      setStep(1);
    }
  }, [welcomeIndex, handleWelcomeStepChange]);

  // Refs para los botones indicadores de paso para enfocar con el teclado
  const desktopDotButtonsRef = React.useRef<(HTMLButtonElement | null)[]>([]);
  const mobileDotButtonsRef = React.useRef<(HTMLButtonElement | null)[]>([]);

  const focusActiveDot = useCallback(
    (idx: number) => {
      if (isDesktop) {
        desktopDotButtonsRef.current[idx]?.focus();
      } else {
        mobileDotButtonsRef.current[idx]?.focus();
      }
    },
    [isDesktop]
  );

  // Navegación por teclado en la pantalla de bienvenida (ArrowLeft, ArrowRight, Enter)
  useEffect(() => {
    if (step !== 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (welcomeIndex < 2) {
          const next = welcomeIndex + 1;
          handleWelcomeStepChange(next);
          focusActiveDot(next);
        } else {
          focusActiveDot(welcomeIndex);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (welcomeIndex > 0) {
          const prev = welcomeIndex - 1;
          handleWelcomeStepChange(prev);
          focusActiveDot(prev);
        } else {
          focusActiveDot(welcomeIndex);
        }
      } else if (e.key === "Enter") {
        if (
          !(document.activeElement instanceof HTMLButtonElement) &&
          !(document.activeElement instanceof HTMLAnchorElement)
        ) {
          e.preventDefault();
          if (isDesktop) {
            setFormInitialMode("register");
            setStep(1);
          } else {
            handlePrimaryAction();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, welcomeIndex, isDesktop, handleWelcomeStepChange, handlePrimaryAction, focusActiveDot]);

  // Consent state
  const [consentChecks, setConsentChecks] = useState<Record<string, boolean>>({
    age: false,
    terms: false,
    ai: false,
  });

  // Setup state
  const [name, setName] = useState("");
  const [selectedIntention, setSelectedIntention] = useState<string>(
    AUTH_CONTENT.setup.intentions.options[0]
  );
  const [selectedTone, setSelectedTone] = useState<"suave" | "directa">("suave");
  const [selectedTime, setSelectedTime] = useState<"20:00" | "22:00">("22:00");

  const progressPercent = ((step + 1) / 5) * 100;

  // Handlers
  const handleAuthSuccess = (isNewUser: boolean) => {
    const session = authService.getSession();
    if (session && session.user.isConfigured && !isNewUser) {
      navigate("/");
    } else {
      setStep(2); // Go to consent
    }
  };

  const handleConsentSubmit = () => {
    if (consentChecks.age && consentChecks.terms && consentChecks.ai) {
      setStep(3); // Go to setup
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    authService.saveOnboardingProfile({
      name: name.trim(),
      intention: selectedIntention,
      tone: selectedTone,
      dayReplyTime: selectedTime,
    });

    setStep(4); // Go to ready
  };

  const handleFinish = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground bg-warp-lines flex flex-col justify-between relative overflow-x-hidden">
      {/* Sol de amanecer botánico en la esquina superior izquierda (Paso 2 / Flor) */}
      <WelcomeSun
        growth={welcomeIndex}
        active={step === 0}
        isDesktop={isDesktop}
        className="fixed top-0 left-0 z-0 pointer-events-none"
      />

      {/* Hilo superior que se teje (Progreso: Sección 6 de DESIGN.md) */}
      <div
        className={`fixed top-0 left-0 right-0 h-[2.5px] bg-warp z-50 ${
          step === 0 ? "min-[1100px]:hidden" : ""
        }`}
      >
        <div
          className="h-full bg-voice transition-all duration-indicator ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Barra superior serena */}
      <header
        className={`w-full mx-auto px-5 pt-8 flex items-center justify-between z-10 relative ${
          step === 0
            ? "max-w-[700px] min-[1100px]:max-w-[1240px] min-[1100px]:px-12"
            : "max-w-[700px]"
        }`}
      >
        {step === 0 ? (
          <>
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-sm">🌱</span>
              <span className="font-replica text-lg font-medium text-foreground tracking-tight">
                Replica
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón accesible de sonido (Fase 5) */}
              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={
                  soundEnabled
                    ? "Silenciar sonidos del sistema"
                    : "Activar sonidos del sistema"
                }
                title={
                  soundEnabled
                    ? "Silenciar sonidos del sistema"
                    : "Activar sonidos del sistema"
                }
                className={`inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                  soundEnabled
                    ? "text-voice hover:bg-surface-raised/80 bg-surface/50"
                    : "text-muted-foreground hover:text-voice hover:bg-surface/50"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 size={18} strokeWidth={2} />
                ) : (
                  <VolumeX size={18} strokeWidth={2} />
                )}
              </button>

              {welcomeIndex < 2 && (
                <button
                  type="button"
                  onClick={() => handleWelcomeStepChange(2)}
                  className="min-[1100px]:hidden text-xs font-voice font-medium text-muted-foreground hover:text-voice transition-colors py-1.5 px-3 rounded-full hover:bg-surface select-none"
                >
                  {AUTH_CONTENT.welcome.actions.skip}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setFormInitialMode("login");
                  setStep(1);
                }}
                className="hidden min-[1100px]:inline-flex items-center min-h-[44px] px-4 rounded-full text-[15px] font-voice font-medium text-voice hover:bg-surface-raised/50 transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
              >
                {AUTH_CONTENT.welcome.actions.signIn}
              </button>
            </div>
          </>
        ) : (
          <>
            {step > 0 && step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-voice transition-colors py-1.5 px-3 rounded-full hover:bg-surface select-none"
              >
                <ArrowLeft size={14} />
                <span>Volver</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-sm">🌱</span>
                <span className="font-replica text-lg font-medium text-foreground tracking-tight">
                  Replica
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={
                  soundEnabled
                    ? "Silenciar sonidos del sistema"
                    : "Activar sonidos del sistema"
                }
                title={
                  soundEnabled
                    ? "Silenciar sonidos del sistema"
                    : "Activar sonidos del sistema"
                }
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                  soundEnabled
                    ? "text-voice hover:bg-surface-raised/80 bg-surface/50"
                    : "text-muted-foreground hover:text-voice hover:bg-surface/50"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 size={16} strokeWidth={2} />
                ) : (
                  <VolumeX size={16} strokeWidth={2} />
                )}
              </button>
            </div>
          </>
        )}
      </header>

      {/* Contenido principal */}
      <main
        className={`w-full mx-auto px-5 py-6 flex-1 flex flex-col justify-center ${
          step === 0
            ? "max-w-[700px] min-[1100px]:max-w-[1240px] min-[1100px]:px-12 min-[1100px]:justify-start min-[1100px]:pt-[max(1.5rem,calc(67.5vh-374px-76px))] min-[1100px]:pb-0"
            : "max-w-[700px]"
        }`}
      >
        {/* ================= PASO 0: BIENVENIDA BOTÁNICA (SANCTUARY LAYOUT) ================= */}
        {step === 0 && (
          <div className="w-full flex flex-col min-[1100px]:flex-row min-[1100px]:items-end min-[1100px]:justify-between items-center justify-center space-y-6 sm:space-y-8 min-[1100px]:space-y-0 min-[1100px]:gap-12 lg:min-[1100px]:gap-16 animate-section-enter min-[1100px]:animate-none py-2">
            {/* 1. Columna izquierda: Escenario Botánico */}
            <div className="w-full max-w-lg min-[1100px]:max-w-none min-[1100px]:flex-1 mx-auto min-[1100px]:mx-0 flex items-center justify-center relative z-0">
              <WelcomeGarden
                growth={welcomeIndex}
                active={step === 0}
                height={isDesktop ? 390 : 195}
                isDesktop={isDesktop}
              />
            </div>

            {/* 2. Columna derecha: Lectura editorial y acciones */}
            <div className="w-full max-w-lg min-[1100px]:max-w-[640px] min-[1100px]:flex-1 mx-auto min-[1100px]:mx-0 flex flex-col items-center min-[1100px]:items-start space-y-6 sm:space-y-8 min-[1100px]:space-y-4 min-[1100px]:pb-[68px] relative z-10">
              {/* Textos Editoriales Canónicos */}
              <div className="space-y-3 max-w-lg min-[1100px]:max-w-none mx-auto min-[1100px]:mx-0 px-2 min-[1100px]:px-0 text-center min-[1100px]:text-left min-[1100px]:min-h-[120px] min-[1100px]:flex min-[1100px]:flex-col min-[1100px]:justify-end">
                <div key={welcomeIndex} className="animate-section-enter space-y-3">
                  <h1 className="font-replica text-3xl sm:text-4xl min-[1100px]:text-fluid-title text-foreground font-normal tracking-tight leading-[1.2] text-balance [text-wrap:balance]">
                    {AUTH_CONTENT.welcome.steps[welcomeIndex].title}
                  </h1>
                  <p className="font-voice text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {AUTH_CONTENT.welcome.steps[welcomeIndex].subtitle}
                  </p>
                </div>
              </div>

              {/* Móvil (< 1100 px): Indicador y Acciones Móviles Intactas */}
              <div className="w-full max-w-xs mx-auto min-[1100px]:hidden space-y-6">
                {/* Indicador de progreso móvil: hueco fijo de 44px (coarse) o 32px (fine), sin solape */}
                <div
                  className="flex items-center justify-center gap-0 px-2 pt-1"
                  role="group"
                  aria-label="Selector de página de bienvenida"
                >
                  {AUTH_CONTENT.welcome.steps.map((s, idx) => {
                    const isActive = welcomeIndex === idx;
                    return (
                      <button
                        key={s.id}
                        ref={(el) => {
                          mobileDotButtonsRef.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => handleWelcomeStepChange(idx)}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label={`Página ${idx + 1} de 3: ${s.title}`}
                        aria-current={isActive ? "page" : undefined}
                        className="relative flex items-center justify-center w-8 [@media(pointer:coarse)]:w-11 h-11 p-0 m-0 border-0 bg-transparent shrink-0 cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 rounded-full group"
                      >
                        <span
                          className={`pointer-events-none h-1.5 rounded-full transition-all duration-indicator ease-in-out motion-reduce:transition-none ${
                            isActive
                              ? "w-6 bg-voice opacity-100"
                              : "w-1.5 bg-subtle opacity-75 group-hover:opacity-100"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Botones móviles: Siguiente / Crear mi cuenta y Ya tengo cuenta */}
                <div className="space-y-2.5 w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePrimaryAction}
                    className="w-full"
                  >
                    {welcomeIndex < 2
                      ? AUTH_CONTENT.welcome.actions.next
                      : AUTH_CONTENT.welcome.actions.createAccount}
                  </Button>

                  <Button
                    variant="ghost"
                    size="normal"
                    onClick={() => {
                      setFormInitialMode("login");
                      setStep(1);
                    }}
                    className="w-full text-foreground hover:bg-surface"
                  >
                    {AUTH_CONTENT.welcome.actions.signIn}
                  </Button>
                </div>
              </div>

              {/* Escritorio (>= 1100 px): Fila de navegación encima del botón principal */}
              <div className="hidden min-[1100px]:flex flex-col w-full max-w-[340px] space-y-2.5">
                {/* Fila de navegación justo encima del botón principal, con el mismo ancho que el botón */}
                <div className="w-full h-11 flex items-center justify-between">
                  {/* Izquierda: SOLO el indicador de páginas, con margen compensado en contenedor y botones fijos */}
                  <div
                    className="flex items-center gap-0 h-11 -ml-1 [@media(pointer:coarse)]:-ml-2.5"
                    role="group"
                    aria-label="Selector de página de bienvenida"
                  >
                    {AUTH_CONTENT.welcome.steps.map((s, idx) => {
                      const isActive = welcomeIndex === idx;
                      return (
                        <button
                          key={s.id}
                          ref={(el) => {
                            desktopDotButtonsRef.current[idx] = el;
                          }}
                          type="button"
                          onClick={() => handleWelcomeStepChange(idx)}
                          onPointerDown={(e) => e.stopPropagation()}
                          aria-label={`Página ${idx + 1} de 3`}
                          aria-current={isActive ? "page" : undefined}
                          className="relative flex items-center justify-center w-8 [@media(pointer:coarse)]:w-11 h-11 p-0 m-0 border-0 bg-transparent shrink-0 cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 rounded-full group"
                        >
                          <span
                            className={`pointer-events-none h-1.5 rounded-full transition-all duration-indicator ease-in-out motion-reduce:transition-none ${
                              isActive
                                ? "w-6 bg-voice opacity-100"
                                : "w-1.5 bg-subtle opacity-75 group-hover:opacity-100"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Derecha: dos huecos de ancho fijo [flecha "anterior" de 44 px] [enlace "Siguiente ›" con su ancho natural] */}
                  <div className="flex items-center gap-1">
                    {/* Hueco 1: Flecha "anterior" de 44 px (fija en el flujo) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (welcomeIndex > 0) {
                          const prev = welcomeIndex - 1;
                          handleWelcomeStepChange(prev);
                          desktopDotButtonsRef.current[prev]?.focus();
                        }
                      }}
                      aria-label="Página anterior"
                      inert={welcomeIndex === 0 ? true : undefined}
                      tabIndex={welcomeIndex === 0 ? -1 : undefined}
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-full text-muted-foreground hover:text-voice hover:bg-muted transition-opacity duration-[180ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice cursor-pointer select-none ${
                        welcomeIndex > 0
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <ArrowLeft size={16} />
                    </button>

                    {/* Hueco 2: Enlace "Siguiente ›" con su ancho natural (fijo en el flujo) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (welcomeIndex < 2) {
                          const next = welcomeIndex + 1;
                          handleWelcomeStepChange(next);
                          desktopDotButtonsRef.current[next]?.focus();
                        }
                      }}
                      aria-label="Página siguiente"
                      inert={welcomeIndex >= 2 ? true : undefined}
                      tabIndex={welcomeIndex >= 2 ? -1 : undefined}
                      className={`inline-flex items-center gap-1 min-h-[44px] px-2 -mr-2 rounded-full text-sm font-voice font-medium text-voice hover:bg-voice-soft/30 transition-opacity duration-[180ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice cursor-pointer select-none ${
                        welcomeIndex < 2
                          ? "opacity-100 pointer-events-auto"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <span>{AUTH_CONTENT.welcome.actions.next}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Botón primario (voice): "Crear mi cuenta", igual en las 3 páginas, sin cambiar de texto ni de posición */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setFormInitialMode("register");
                    setStep(1);
                  }}
                  className="w-full focus-visible:ring-2 focus-visible:ring-voice"
                >
                  {AUTH_CONTENT.welcome.actions.createAccount}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PASO 1: ENTRAR / CREAR CUENTA ================= */}
        {step === 1 && (
          <div className="animate-section-enter max-w-md mx-auto w-full">
            <Card variant="raised" className="p-8">
              <AuthForm
                initialMode={formInitialMode}
                onSuccess={handleAuthSuccess}
              />
            </Card>
          </div>
        )}

        {/* ================= PASO 2: CONSENTIMIENTO ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-section-enter max-w-lg mx-auto w-full">
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-voice-soft text-voice text-xs font-semibold uppercase tracking-wider">
                {AUTH_CONTENT.consent.badge}
              </span>
              <h2 className="font-replica text-3xl font-normal text-foreground tracking-tight">
                {AUTH_CONTENT.consent.title}
              </h2>
              <p className="font-voice text-sm text-muted-foreground leading-relaxed">
                {AUTH_CONTENT.consent.subtitle}
              </p>
            </div>

            <Card variant="raised" className="p-6 space-y-4">
              {AUTH_CONTENT.consent.items.map((item) => {
                const checked = consentChecks[item.id] || false;
                return (
                  <label
                    key={item.id}
                    className="flex items-start gap-3.5 p-3 rounded-md hover:bg-surface cursor-pointer select-none transition-colors border border-transparent hover:border-border/30"
                  >
                    <div
                      className={`w-5 h-5 rounded-sm border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        checked
                          ? "bg-voice border-voice text-voice-foreground"
                          : "border-border/80 bg-surface-raised"
                      }`}
                    >
                      {checked && <Check size={14} strokeWidth={2.5} />}
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setConsentChecks((prev) => ({
                          ...prev,
                          [item.id]: e.target.checked,
                        }))
                      }
                      className="sr-only"
                    />
                    <span className="text-sm text-foreground leading-snug">
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </Card>

            <Button
              variant="primary"
              size="lg"
              onClick={handleConsentSubmit}
              disabled={!consentChecks.age || !consentChecks.terms || !consentChecks.ai}
              className="w-full"
            >
              {AUTH_CONTENT.consent.button}
            </Button>
          </div>
        )}

        {/* ================= PASO 3: CONFIGURACIÓN ================= */}
        {step === 3 && (
          <form
            onSubmit={handleSetupSubmit}
            className="space-y-6 animate-section-enter max-w-lg mx-auto w-full"
          >
            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-voice-soft text-voice text-xs font-semibold uppercase tracking-wider">
                {AUTH_CONTENT.setup.badge}
              </span>
              <h2 className="font-replica text-3xl font-normal text-foreground tracking-tight">
                {AUTH_CONTENT.setup.title}
              </h2>
              <p className="font-voice text-sm text-muted-foreground leading-relaxed">
                {AUTH_CONTENT.setup.subtitle}
              </p>
            </div>

            <Card variant="raised" className="p-6 space-y-5">
              {/* Nombre */}
              <div className="space-y-1.5">
                <label
                  htmlFor="setup-name"
                  className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {AUTH_CONTENT.setup.nameField.label}
                </label>
                <input
                  id="setup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={AUTH_CONTENT.setup.nameField.placeholder}
                  required
                  className="w-full h-[46px] px-4 rounded-DEFAULT bg-surface-raised border border-border/40 text-foreground placeholder:text-subtle text-sm focus:outline-none focus:border-voice focus:ring-2 focus:ring-voice/20 transition-all"
                />
              </div>

              {/* Intención */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {AUTH_CONTENT.setup.intentions.label}
                </label>
                <div className="flex flex-wrap gap-2">
                  {AUTH_CONTENT.setup.intentions.options.map((opt) => (
                    <Pill
                      key={opt}
                      label={opt}
                      active={selectedIntention === opt}
                      onClick={() => setSelectedIntention(opt)}
                    />
                  ))}
                </div>
              </div>

              {/* Tono */}
              <div className="space-y-2 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {AUTH_CONTENT.setup.tone.label}
                  </label>
                  <p className="text-xs text-subtle">
                    {AUTH_CONTENT.setup.tone.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AUTH_CONTENT.setup.tone.options.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTone(t.id as "suave" | "directa")}
                      className={`p-3.5 rounded-md text-left border transition-all cursor-pointer ${
                        selectedTone === t.id
                          ? "bg-voice-soft/20 border-voice text-foreground"
                          : "bg-surface border-border/30 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <span className="font-replica text-base font-medium block text-foreground">
                        {t.title}
                      </span>
                      <span className="text-xs text-subtle block mt-0.5">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora de Réplica del día */}
              <div className="space-y-2 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {AUTH_CONTENT.setup.dayReplyTime.label}
                  </label>
                  <p className="text-xs text-subtle">
                    {AUTH_CONTENT.setup.dayReplyTime.description}
                  </p>
                </div>
                <div className="flex gap-3">
                  {AUTH_CONTENT.setup.dayReplyTime.options.map((timeOpt) => (
                    <button
                      key={timeOpt.id}
                      type="button"
                      onClick={() =>
                        setSelectedTime(timeOpt.id as "20:00" | "22:00")
                      }
                      className={`flex-1 py-2.5 px-4 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTime === timeOpt.id
                          ? "bg-voice text-voice-foreground border-voice shadow-xs"
                          : "bg-surface text-muted-foreground border-border/40 hover:border-border"
                      }`}
                    >
                      {timeOpt.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!name.trim()}
              className="w-full"
            >
              {AUTH_CONTENT.setup.button}
            </Button>
          </form>
        )}

        {/* ================= PASO 4: TODO LISTO ================= */}
        {step === 4 && (
          <div className="space-y-6 animate-section-enter max-w-md mx-auto w-full text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-voice-soft text-voice text-xs font-semibold uppercase tracking-wider">
              {AUTH_CONTENT.ready.badge}
            </span>

            <div className="w-16 h-16 rounded-full bg-voice-soft text-voice flex items-center justify-center mx-auto text-3xl">
              🌱
            </div>

            <div className="space-y-2">
              <h2 className="font-replica text-3xl md:text-4xl font-normal text-foreground tracking-tight">
                {AUTH_CONTENT.ready.title}
              </h2>
              <p className="font-replica italic text-reply text-lg">
                "{AUTH_CONTENT.ready.quote}"
              </p>
              <p className="font-voice text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {AUTH_CONTENT.ready.body}
              </p>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinish}
                icon={<ArrowRight size={18} />}
                className="w-full"
              >
                {AUTH_CONTENT.ready.button}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Pie sutil */}
      <footer className="w-full text-center py-4 text-[13px] leading-[18px] text-muted-foreground font-sans select-none z-10 relative">
        <div className="flex items-center justify-center gap-4">
          <a
            href="#terminos"
            onClick={(e) => e.preventDefault()}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-voice rounded-xs"
          >
            Términos
          </a>
          <span className="text-border" aria-hidden="true">
            ·
          </span>
          <a
            href="#privacidad"
            onClick={(e) => e.preventDefault()}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-voice rounded-xs"
          >
            Privacidad
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AuthFlow;
