import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Pill } from "../components/ui/Pill";
import { IconCircle } from "../components/ui/IconCircle";
import { PLAYGROUND_CONTENT } from "../data/playgroundContent";
import {
  Sparkles,
  Heart,
  ArrowRight,
  Hash,
  Sun,
  Moon,
  Laptop,
  Feather,
  NotebookText,
  ChartSpline,
  MessageCircle,
  CircleUserRound,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";
import { CofreIcon } from "../components/brand/CofreIcon";
import { AnimatedHeart } from "../components/motion/AnimatedHeart";
import { WelcomeGarden } from "../components/brand/WelcomeGarden";
import { WelcomeSun } from "../components/brand/WelcomeSun";
import {
  playSound,
  SOUND_DEFINITIONS,
  SOUND_DURATIONS,
  isSoundsEnabled,
  setSoundsEnabled,
  type SoundName,
} from "../lib/sounds";

export const Playground: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [selectedMood, setSelectedMood] = useState<string>("paz");
  const [selectedTheme, setSelectedTheme] = useState<string>("Trabajo");
  const [playgroundFav, setPlaygroundFav] = useState<boolean>(true);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [soundsEnabled, setSoundsEnabledState] = useState<boolean>(() => isSoundsEnabled());

  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      setSoundsEnabledState(custom.detail?.enabled ?? isSoundsEnabled());
    };
    window.addEventListener("replica_sounds_change", handleSoundChange);
    return () => window.removeEventListener("replica_sounds_change", handleSoundChange);
  }, []);

  // Estado para probar WelcomeGarden y WelcomeSun
  const [gardenGrowth, setGardenGrowth] = useState<number>(0);
  const [gardenActive, setGardenActive] = useState<boolean>(true);

  const handleToggleSoundMaster = () => {
    const next = !soundsEnabled;
    setSoundsEnabledState(next);
    setSoundsEnabled(next);
    if (next) {
      playSound("favorito");
    }
  };

  const handleTestSound = (id: SoundName) => {
    if (!soundsEnabled) {
      setSoundsEnabledState(true);
      setSoundsEnabled(true);
    }
    setActiveSound(id);
    playSound(id);
    const duration = SOUND_DURATIONS[id] || 800;
    setTimeout(() => {
      setActiveSound((prev) => (prev === id ? null : prev));
    }, duration);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const {
    header,
    themeSection,
    buttonsSection,
    cardsSection,
    pillsSection,
    iconsSection,
    moods,
    themes,
  } = PLAYGROUND_CONTENT;

  return (
    <div className="min-h-screen bg-background text-foreground bg-warp-lines py-12 px-5">
      {/* Columna de lectura centrada de 640–720 px (Sección 5 de DESIGN.md) */}
      <div className="max-w-[680px] mx-auto space-y-10">
        {/* Cabecera */}
        <header className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-voice-soft text-voice text-xs font-semibold uppercase tracking-wider">
            {header.badge}
          </span>
          <h1 className="font-replica text-4xl font-normal tracking-tight text-foreground">
            {header.title}
          </h1>
          <p className="font-voice text-lg text-muted-foreground leading-relaxed">
            {header.description}
          </p>
          <p className="text-xs text-subtle font-mono">{header.note}</p>
        </header>

        {/* 1. Selector de Tema */}
        <section className="space-y-3">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              {themeSection.title}
            </h2>
            <p className="text-sm text-muted-foreground">{themeSection.description}</p>
          </div>

          {/* Selector segmentado con fondo surface-sunken (Sección 6 de DESIGN.md) */}
          <div className="inline-flex p-1 rounded-full bg-surface-sunken border border-border/30 gap-1">
            {themeSection.options.map((option) => {
              const isActive = theme === option.id;
              const Icon =
                option.id === "light"
                  ? Sun
                  : option.id === "dark"
                  ? Moon
                  : Laptop;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id as "light" | "dark" | "system")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all duration-indicator ease-in-out ${
                    isActive
                      ? "bg-surface-raised text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Botones */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              {buttonsSection.title}
            </h2>
            <p className="text-sm text-muted-foreground">{buttonsSection.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="normal"
              icon={<Sparkles size={16} />}
            >
              {buttonsSection.labels.primary}
            </Button>

            <Button variant="secondary" size="normal">
              {buttonsSection.labels.secondary}
            </Button>

            <Button variant="ghost" size="normal">
              {buttonsSection.labels.ghost}
            </Button>

            <Button variant="destructive" size="normal">
              {buttonsSection.labels.destructive}
            </Button>
          </div>

          {/* Tamaños */}
          <div className="pt-2 space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-subtle">
              Escala de tamaños (36, 44, 48 px)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="secondary">
                {buttonsSection.labels.sizes.sm}
              </Button>
              <Button size="normal" variant="secondary">
                {buttonsSection.labels.sizes.normal}
              </Button>
              <Button size="lg" variant="primary">
                {buttonsSection.labels.sizes.lg}
              </Button>
            </div>
          </div>
        </section>

        {/* 3. Tarjetas */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              {cardsSection.title}
            </h2>
            <p className="text-sm text-muted-foreground">{cardsSection.description}</p>
          </div>

          {/* Tarjeta Elevada con Réplica de muestra */}
          <Card variant="raised" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-reply uppercase tracking-widest">
                {cardsSection.sampleRaised.tag}
              </span>
              <IconCircle
                variant="reply"
                size="sm"
                icon={<Moon size={16} />}
                ariaLabel="Réplica de la noche"
              />
            </div>

            <h3 className="font-replica text-2xl font-normal leading-snug text-foreground">
              "{cardsSection.sampleRaised.quote}"
            </h3>

            <p className="font-replica italic text-reply text-base leading-relaxed">
              {cardsSection.sampleRaised.body}
            </p>

            <div className="pt-2 border-t border-border/20 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowRight size={14} />}
                className="text-voice font-medium"
              >
                {cardsSection.sampleRaised.footerAction}
              </Button>
            </div>
          </Card>

          {/* Tarjeta Flat para elementos secundarios */}
          <Card variant="flat" className="space-y-2">
            <span className="text-[11px] font-semibold text-subtle uppercase tracking-widest">
              {cardsSection.sampleFlat.tag}
            </span>
            <p className="text-sm text-muted-foreground">
              {cardsSection.sampleFlat.body}
            </p>
          </Card>
        </section>

        {/* 4. Pastillas de Ánimo y Temas */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              {pillsSection.title}
            </h2>
            <p className="text-sm text-muted-foreground">{pillsSection.description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-subtle uppercase tracking-wider">
              {pillsSection.moodsHeader}
            </h4>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <Pill
                  key={m.id}
                  label={m.name}
                  moodColor={m.colorVar}
                  active={selectedMood === m.id}
                  onClick={() => setSelectedMood(m.id)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-subtle uppercase tracking-wider">
              {pillsSection.themesHeader}
            </h4>
            <div className="flex flex-wrap gap-2">
              {themes.map((t) => (
                <Pill
                  key={t}
                  label={t}
                  icon={<Hash size={12} />}
                  active={selectedTheme === t}
                  onClick={() => setSelectedTheme(t)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. Íconos en Círculo */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              {iconsSection.title}
            </h2>
            <p className="text-sm text-muted-foreground">{iconsSection.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-surface flex flex-col items-center gap-2 text-center">
              <IconCircle variant="voice" size="md" icon={<Sparkles size={18} />} />
              <span className="text-xs text-muted-foreground">
                {iconsSection.labels.voiceSoft}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-surface flex flex-col items-center gap-2 text-center">
              <IconCircle variant="reply" size="md" icon={<Moon size={18} />} />
              <span className="text-xs text-muted-foreground">
                {iconsSection.labels.replySoft}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-surface flex flex-col items-center gap-2 text-center">
              <IconCircle variant="emotion" size="md" icon={<Heart size={18} />} />
              <span className="text-xs text-muted-foreground">
                {iconsSection.labels.emotionSoft}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-surface flex flex-col items-center gap-2 text-center">
              <IconCircle
                variant="surface"
                size="lg"
                icon={<CofreIcon size={22} color="var(--voice)" heartColor="var(--emotion)" />}
              />
              <span className="text-xs text-muted-foreground">
                Mi Cofre (Oficial)
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-subtle">
              Íconos oficiales de navegación (1:1 con app móvil)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/30 text-xs text-foreground">
                <Feather size={16} className="text-voice" />
                <span>Inicio (Feather)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/30 text-xs text-foreground">
                <NotebookText size={16} className="text-voice" />
                <span>Notas (NotebookText)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/30 text-xs text-foreground">
                <ChartSpline size={16} className="text-voice" />
                <span>Evolución (ChartSpline)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/30 text-xs text-foreground">
                <MessageCircle size={16} className="text-voice" />
                <span>Chat (MessageCircle)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/30 text-xs text-foreground">
                <CircleUserRound size={16} className="text-voice" />
                <span>Usuario (CircleUserRound)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Animación Física de Corazón (AnimatedHeart) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              Micro-interacciones y Animación Física (Heart Break)
            </h2>
            <p className="text-sm text-muted-foreground">
              Fiel a la app móvil: al marcar favorito late y suelta un estallido radial; al desmarcarlo, el corazón se parte en dos mitades que caen y se desvanecen.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-raised border border-border/40 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-voice uppercase tracking-wider">
                Estado: {playgroundFav ? "Favorito marcado" : "Favorito quitado"}
              </span>
              <p className="text-xs text-muted-foreground">
                Toca el botón para ver la física en acción (estallido radial / rotura física).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !playgroundFav;
                setPlaygroundFav(next);
                playSound(next ? "favorito" : "favoritoQuitar");
              }}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-small active:scale-[0.94] cursor-pointer ${
                playgroundFav
                  ? "bg-emotion-soft/40 border-emotion/40"
                  : "bg-surface hover:bg-surface-sunken border-border/40"
              }`}
            >
              <AnimatedHeart
                active={playgroundFav}
                size={22}
                color="var(--emotion)"
                outlineColor="var(--voice)"
              />
            </button>
          </div>
        </section>

        {/* 7. Familia Sonora de Replica (Soundboard de Pruebas) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Volume2 size={20} className="text-voice" />
                <h2 className="font-replica text-xl font-medium text-foreground">
                  Familia Sonora de Replica (Soundboard)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleToggleSoundMaster}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all duration-150 ${
                  soundsEnabled
                    ? "bg-voice-soft text-voice border-voice/30 hover:border-voice"
                    : "bg-surface-sunken text-muted-foreground border-border/40 hover:text-foreground"
                }`}
              >
                {soundsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>{soundsEnabled ? "Sonidos del sistema: Activados" : "Sonidos silenciados (activar)"}</span>
              </button>
            </div>
            <p className="text-sm text-muted-foreground font-voice">
              Una sola familia sonora, suave y corta (volumen 0.55). Fiel a docs/DESIGN.md §8: acompaña solo momentos importantes, nunca cada toque ordinario.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOUND_DEFINITIONS.map((s) => {
              const isPlaying = activeSound === s.id;
              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
                    isPlaying
                      ? "bg-voice-soft/40 border-voice/50 shadow-xs"
                      : "bg-surface-raised border-border/40 hover:border-border/70"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-replica text-sm font-medium text-foreground">
                        {s.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface border border-border/40 text-subtle">
                        {s.file}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-voice leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/20">
                    <span className="text-[10px] text-subtle font-mono">
                      Vol: {s.volume}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTestSound(s.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 active:scale-95 ${
                        isPlaying
                          ? "bg-voice text-on-voice shadow-xs"
                          : "bg-surface hover:bg-surface-sunken border border-border/50 text-foreground"
                      }`}
                    >
                      <Play size={12} className={isPlaying ? "fill-current" : ""} />
                      <span>{isPlaying ? "Reproduciendo…" : "Escuchar"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. Ilustración Botánica Interactiva (WelcomeGarden & WelcomeSun) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-replica text-xl font-medium text-foreground">
              Ilustración Botánica de Bienvenida (WelcomeGarden & WelcomeSun)
            </h2>
            <p className="text-sm text-muted-foreground font-voice">
              Reproduce la germinación orgánica: semilla sobre el renglón (0), brote con mecida de viento (1) y florecimiento nomeolvides con sol amaneciendo (2).
            </p>
          </div>

          <Card variant="raised" className="p-6 space-y-6 overflow-hidden relative">
            {/* Lienzo del santuario con WelcomeSun en la esquina y WelcomeGarden en el centro */}
            <div className="relative w-full h-[220px] rounded-2xl bg-background border border-border/40 overflow-hidden flex flex-col justify-end">
              <WelcomeSun
                growth={gardenGrowth}
                active={gardenActive}
                isDesktop={false}
                className="absolute top-0 left-0 z-10"
              />
              <div className="w-full">
                <WelcomeGarden
                  growth={gardenGrowth}
                  active={gardenActive}
                  height={190}
                  isDesktop={false}
                />
              </div>
            </div>

            {/* Controles de prueba interactivos */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-subtle">
                    Etapas fijas:
                  </span>
                  <div className="inline-flex p-1 rounded-full bg-surface-sunken border border-border/30 gap-1">
                    {[
                      { val: 0, label: "0: Semilla", sound: null },
                      { val: 1, label: "1: Brote", sound: "brote" as const },
                      { val: 2, label: "2: Flor", sound: "flor" as const },
                    ].map((st) => (
                      <button
                        key={st.val}
                        type="button"
                        onClick={() => {
                          setGardenGrowth(st.val);
                          if (st.sound) handleTestSound(st.sound);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-indicator ${
                          Math.round(gardenGrowth) === st.val
                            ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGardenActive(!gardenActive)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-all duration-150 ${
                    gardenActive
                      ? "bg-voice-soft text-voice border-voice/30"
                      : "bg-surface-sunken text-muted-foreground border-border/40"
                  }`}
                >
                  <span>{gardenActive ? "Viento/Sol: Activo" : "Viento/Sol: Pausado"}</span>
                </button>
              </div>

              {/* Slider de crecimiento continuo */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-subtle font-mono">
                  <span>Crecimiento continuo (growth):</span>
                  <span>{gardenGrowth.toFixed(2)} / 2.00</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={gardenGrowth}
                  onChange={(e) => setGardenGrowth(parseFloat(e.target.value))}
                  className="w-full accent-voice cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Playground;
