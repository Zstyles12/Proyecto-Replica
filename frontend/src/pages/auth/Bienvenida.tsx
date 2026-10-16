import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { LogoMotion } from "../../components/brand/LogoMotion";
import { WelcomeGarden } from "../../components/brand/WelcomeGarden";
import { WelcomeSun } from "../../components/brand/WelcomeSun";
import { AUTH_CONTENT } from "../../data/authContent";
import { isSoundsEnabled, playSound, setSoundsEnabled, stopSound } from "../../lib/sounds";

const PAGES = AUTH_CONTENT.welcome.steps;

// Bienvenida: tres páginas con una sola planta que crece a su ritmo (DESIGN.md §6, Bienvenida).
// "Crear mi cuenta" y "Ya tengo cuenta" están en todas.
export const Bienvenida: React.FC = () => {
  const navigate = useNavigate();
  const { actions } = AUTH_CONTENT.welcome;
  const [index, setIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(() => isSoundsEnabled());
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1100px)").matches);
  const desktopDots = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileDots = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1100px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const create = () => navigate("/entrar");
  const signIn = () => navigate("/entrar?modo=entrar");

  // Hacia adelante suena la escalera de la planta; hacia atrás no suena.
  const goTo = useCallback(
    (next: number) => {
      if (next === index || next < 0 || next >= PAGES.length) return;
      if (next > index) {
        if (next === 1) playSound("brote");
        if (next === 2) playSound("flor");
      } else {
        stopSound("brote");
        stopSound("flor");
      }
      setIndex(next);
    },
    [index]
  );

  const focusDot = useCallback(
    (i: number) => (isDesktop ? desktopDots : mobileDots).current[i]?.focus(),
    [isDesktop]
  );

  // Flechas para pasar de página.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
        focusDot(Math.min(index + 1, PAGES.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
        focusDot(Math.max(index - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo, focusDot]);

  const toggleSound = () => {
    const next = !soundOn;
    if (!next) {
      stopSound("brote");
      stopSound("flor");
    }
    setSoundsEnabled(next);
    setSoundOn(next);
  };

  const soundLabel = soundOn ? "Silenciar los sonidos" : "Activar los sonidos";

  const dots = (refs: React.MutableRefObject<(HTMLButtonElement | null)[]>, long: boolean) =>
    PAGES.map((page, i) => {
      const active = index === i;
      return (
        <button
          key={page.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          onClick={() => goTo(i)}
          aria-label={long ? `Página ${i + 1} de 3: ${page.title}` : `Página ${i + 1} de 3`}
          aria-current={active ? "page" : undefined}
          className="group relative flex h-11 w-8 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice [@media(pointer:coarse)]:w-11"
        >
          <span
            className={`pointer-events-none h-1.5 rounded-full transition-all duration-indicator ease-in-out motion-reduce:transition-none ${
              active ? "w-6 bg-voice" : "w-1.5 bg-subtle opacity-75 group-hover:opacity-100"
            }`}
          />
        </button>
      );
    });

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-background bg-warp-lines text-foreground">
      <WelcomeSun growth={index} active isDesktop={isDesktop} className="pointer-events-none fixed left-0 top-0 z-0" />

      <header className="relative z-10 mx-auto flex w-full max-w-[700px] items-center justify-between px-5 pt-8 min-[1100px]:max-w-[1240px] min-[1100px]:px-12">
        {/* La firma con la ola, una sola vez al llegar (DESIGN-WEB.md §9). */}
        <div className="flex select-none items-center">
          <LogoMotion motion="ola" width={isDesktop ? 150 : 124} play delay={150} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundLabel}
            aria-pressed={soundOn}
            title={soundLabel}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
              soundOn ? "bg-surface/50 text-voice hover:bg-surface-raised/80" : "text-muted-foreground hover:bg-surface/50 hover:text-voice"
            }`}
          >
            {soundOn ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
          </button>
          {index < 2 ? (
            <button
              type="button"
              onClick={() => goTo(2)}
              className="min-h-11 select-none rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-voice min-[1100px]:hidden"
            >
              {actions.skip}
            </button>
          ) : null}
          <button
            type="button"
            onClick={signIn}
            className="hidden min-h-11 items-center rounded-full px-4 font-voice text-[15px] font-medium text-voice transition-colors hover:bg-surface-raised/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice min-[1100px]:inline-flex"
          >
            {actions.signIn}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[700px] flex-1 flex-col justify-center px-5 py-6 min-[1100px]:max-w-[1240px] min-[1100px]:justify-start min-[1100px]:px-12 min-[1100px]:pb-0 min-[1100px]:pt-[max(1.5rem,calc(67.5vh-374px-76px))]">
        <div className="flex w-full flex-col items-center justify-center space-y-6 py-2 sm:space-y-8 min-[1100px]:flex-row min-[1100px]:items-end min-[1100px]:justify-between min-[1100px]:gap-16 min-[1100px]:space-y-0">
          <div className="relative z-0 mx-auto flex w-full max-w-lg items-center justify-center min-[1100px]:mx-0 min-[1100px]:max-w-none min-[1100px]:flex-1">
            <WelcomeGarden growth={index} active height={isDesktop ? 390 : 195} isDesktop={isDesktop} />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center space-y-6 sm:space-y-8 min-[1100px]:mx-0 min-[1100px]:max-w-[640px] min-[1100px]:flex-1 min-[1100px]:items-start min-[1100px]:space-y-4 min-[1100px]:pb-[68px]">
            <div className="mx-auto max-w-lg space-y-3 px-2 text-center min-[1100px]:mx-0 min-[1100px]:flex min-[1100px]:min-h-[120px] min-[1100px]:max-w-none min-[1100px]:flex-col min-[1100px]:justify-end min-[1100px]:px-0 min-[1100px]:text-left">
              <div key={index} className="enter space-y-3" aria-live="polite">
                <h1 className="text-balance font-replica text-3xl font-normal leading-[1.2] tracking-tight text-foreground sm:text-4xl min-[1100px]:text-fluid-title">
                  {PAGES[index].title}
                </h1>
                <p className="font-voice text-base leading-relaxed text-muted-foreground sm:text-lg">{PAGES[index].subtitle}</p>
              </div>
            </div>

            {/* Teléfono y tablet */}
            <div className="mx-auto w-full max-w-xs space-y-6 min-[1100px]:hidden">
              <div className="flex items-center justify-center px-2 pt-1" role="group" aria-label="Páginas de la bienvenida">
                {dots(mobileDots, true)}
              </div>
              <div className="w-full space-y-2.5">
                <Button size="lg" onClick={index < 2 ? () => goTo(index + 1) : create} className="w-full">
                  {index < 2 ? actions.next : actions.createAccount}
                </Button>
                <Button variant="ghost" onClick={signIn} className="w-full text-foreground hover:bg-surface">
                  {actions.signIn}
                </Button>
              </div>
            </div>

            {/* Escritorio */}
            <div className="hidden w-full max-w-[340px] flex-col space-y-2.5 min-[1100px]:flex">
              <div className="flex h-11 w-full items-center justify-between">
                <div className="-ml-1 flex h-11 items-center" role="group" aria-label="Páginas de la bienvenida">
                  {dots(desktopDots, false)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    aria-label="Página anterior"
                    tabIndex={index === 0 ? -1 : undefined}
                    aria-hidden={index === 0 || undefined}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-opacity duration-small hover:bg-muted hover:text-voice focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                      index > 0 ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    tabIndex={index >= 2 ? -1 : undefined}
                    aria-hidden={index >= 2 || undefined}
                    className={`-mr-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 font-voice text-sm font-medium text-voice transition-opacity duration-small hover:bg-voice-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice ${
                      index < 2 ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <span>{actions.next}</span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <Button size="lg" onClick={create} className="w-full">
                {actions.createAccount}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full select-none py-4 text-center text-[13px] leading-[18px] text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <Link to="/legal/terminos" className="rounded underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice">
            Términos
          </Link>
          <span className="text-border" aria-hidden="true">·</span>
          <Link to="/legal/privacidad" className="rounded underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice">
            Privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Bienvenida;
