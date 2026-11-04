import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Lock, LockKeyhole, Sparkles, UsersRound, type LucideIcon } from "lucide-react";
import { AuthScaffold } from "../../features/auth/components/AuthScaffold";
import { CheckRow, ChoiceCard, IntentionPicker } from "../../features/auth/components/Choices";
import { INTENTION_TITLES } from "../../features/auth/intentions";
import { LogoMotion } from "../../components/brand/LogoMotion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Button } from "../../components/ui/Button";
import { TONES } from "../../features/profile/tones";
import { firstName, updateProfile, useProfile, type DayReplyHour, type ReplyTone } from "../../features/profile/store";
import { sessionActions } from "../../lib/session";
import { playSound } from "../../lib/sounds";

// Primera configuración: consentimiento, configuración paso a paso y "Todo listo". Mismos textos que
// la app (app/(setup)/consentimiento, configurar y listo). Sin el paso del bloqueo (DESIGN-WEB.md §6).

// ─── Consentimiento ──────────────────────────────────────────────────────────

// Lo que Replica hace con lo que escribes, dicho sin letra pequeña. Nada que no se pueda cumplir.
const PROMISES: { icon: LucideIcon; text: string }[] = [
  { icon: LockKeyhole, text: "Tu diario es privado. No lo vendemos ni lo usamos para publicidad." },
  { icon: Sparkles, text: "Una IA lee cada nota que no es privada para escribirte la réplica. Solo la usa para responderte." },
  {
    icon: UsersRound,
    text: "Un psicólogo solo lo lee si tú se lo compartes, y puedes retirar el permiso cuando quieras.",
  },
  { icon: HeartHandshake, text: "Replica acompaña, pero no reemplaza la terapia ni atiende emergencias." },
];

export const Consentimiento: React.FC = () => {
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [ai, setAi] = useState(false);
  const ready = adult && terms && ai;

  return (
    <AuthScaffold
      onBack={sessionActions.signOut}
      title="Antes de empezar"
      subtitle="Replica es un espacio íntimo. Queremos que sepas cómo cuida lo que escribes."
      primary={{ label: "Aceptar y continuar", disabled: !ready, onPress: () => ready && sessionActions.acceptConsent() }}
    >
      <div className="space-y-6">
        <ul className="space-y-4 rounded-xl bg-surface p-5">
          {PROMISES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex gap-3">
              <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-voice-soft text-voice">
                <Icon size={16} />
              </span>
              <span className="flex-1 text-[15px] leading-[21px] text-foreground">{text}</span>
            </li>
          ))}
        </ul>

        <div>
          <CheckRow checked={adult} onToggle={() => setAdult((v) => !v)}>
            Tengo 18 años o más
          </CheckRow>
          <CheckRow checked={terms} onToggle={() => setTerms((v) => !v)}>
            Acepto los{" "}
            <Link to="/legal/terminos" target="_blank" className="font-semibold text-voice underline-offset-2 hover:underline">
              Términos
            </Link>{" "}
            y la{" "}
            <Link to="/legal/privacidad" target="_blank" className="font-semibold text-voice underline-offset-2 hover:underline">
              Política de privacidad
            </Link>
          </CheckRow>
          <CheckRow checked={ai} onToggle={() => setAi((v) => !v)}>
            Entiendo que una IA lee mis notas para responderme
          </CheckRow>
        </div>
      </div>
    </AuthScaffold>
  );
};

// ─── Configuración ───────────────────────────────────────────────────────────

type Step = "nombre" | "intencion" | "tono" | "replicaDia";
const STEPS: Step[] = ["nombre", "intencion", "tono", "replicaDia"];

const DAY_REPLY_CHOICES: { value: DayReplyHour; title: string; description: string }[] = [
  { value: 20, title: "A las 8 de la noche", description: "Para cerrar el día temprano" },
  { value: 22, title: "A las 10 de la noche", description: "Cuando el día ya terminó" },
];

export const Configurar: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const profile = useProfile();
  const [index, setIndex] = useState(0);
  const [name, setName] = useState(profile.name);
  // Solo cuenta como elegida si es una de las tarjetas.
  const [intention, setIntention] = useState<string | null>(
    INTENTION_TITLES.includes(profile.intention) ? profile.intention : null
  );
  const [tone, setTone] = useState<ReplyTone>(profile.replyTone);
  const [dayReplyHour, setDayReplyHour] = useState<DayReplyHour>(profile.dayReplyHour);

  const step = STEPS[index];
  // El último tramo del hilo se teje en la pantalla final.
  const progress = (index + 1) / (STEPS.length + 1);
  const next = () => (index < STEPS.length - 1 ? setIndex(index + 1) : onFinish());
  const common = { onBack: index > 0 ? () => setIndex(index - 1) : undefined, progress, stepKey: step };

  if (step === "nombre") {
    const clean = name.trim();
    return (
      <AuthScaffold
        {...common}
        title="¿Cómo quieres que te llamemos?"
        subtitle="Replica te saluda y te responde por tu nombre."
        primary={{
          label: "Continuar",
          disabled: !clean,
          onPress: () => {
            if (!clean) return;
            updateProfile({ name: clean });
            next();
          },
        }}
      >
        <label htmlFor="setup-name" className="sr-only">
          Tu nombre
        </label>
        <input
          id="setup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          placeholder="Tu nombre"
          autoComplete="given-name"
          autoCapitalize="words"
          maxLength={40}
          className="h-14 w-full rounded-md border border-border bg-surface px-4 text-[18px] text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-voice/40"
        />
      </AuthScaffold>
    );
  }

  if (step === "intencion") {
    return (
      <AuthScaffold
        {...common}
        title="¿Qué te trae a Replica?"
        subtitle="Elige lo que más se parezca. Aparecerá en tu perfil y puedes cambiarlo cuando quieras."
        skip={{ label: "Omitir", onPress: next }}
        primary={{
          label: "Continuar",
          disabled: !intention,
          onPress: () => {
            if (!intention) return;
            updateProfile({ intention });
            next();
          },
        }}
      >
        <IntentionPicker value={intention} onChange={setIntention} />
      </AuthScaffold>
    );
  }

  if (step === "tono") {
    return (
      <AuthScaffold
        {...common}
        title="¿Cómo quieres que te responda?"
        subtitle="Es el tono de cada réplica. Puedes probar otro cuando quieras."
        primary={{
          label: "Continuar",
          onPress: () => {
            updateProfile({ replyTone: tone });
            next();
          },
        }}
      >
        <div role="radiogroup" aria-label="Tono de la réplica" className="space-y-2">
          {TONES.map((t) => (
            <ChoiceCard
              key={t.value}
              name="tone"
              title={t.title}
              description={t.description}
              selected={tone === t.value}
              onSelect={() => setTone(t.value)}
            />
          ))}
        </div>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      {...common}
      title="Replica te responde dos veces al día"
      subtitle="Escribe cuanto quieras. Tu primera nota del día recibe su réplica al momento, y en la noche Replica lee todo lo que escribiste y te responde una vez más. ¿A qué hora la quieres?"
      primary={{
        label: "Continuar",
        onPress: () => {
          updateProfile({ dayReplyHour });
          next();
        },
      }}
    >
      <div className="space-y-4">
        <div role="radiogroup" aria-label="Hora de la réplica del día" className="space-y-2">
          {DAY_REPLY_CHOICES.map((c) => (
            <ChoiceCard
              key={c.value}
              name="day-reply-hour"
              title={c.title}
              description={c.description}
              selected={dayReplyHour === c.value}
              onSelect={() => setDayReplyHour(c.value)}
            />
          ))}
        </div>
        <p className="flex items-start gap-2 px-1 text-[13px] leading-[18px] text-muted-foreground">
          <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          Si una nota es solo para ti, márcala como privada: no la lee Replica ni un psicólogo.
        </p>
      </div>
    </AuthScaffold>
  );
};

// ─── Todo listo ──────────────────────────────────────────────────────────────

// Cuándo arranca la firma. El sonido sale 50 ms antes: es el silencio con que empieza cada sonido.
const SIGN_DELAY = 250;

// El cierre de la configuración: la firma se escribe y florece (docs/marca de la app, Movimiento · A),
// con su sonido si los sonidos están activados, y la hoja en blanco espera.
export const Listo: React.FC = () => {
  const { name } = useProfile();
  const first = firstName(name);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => playSound("firma"), SIGN_DELAY - 50);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <div className="flex min-h-screen flex-col bg-background bg-warp-lines">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-10 px-8">
        <LogoMotion motion="escribe" width={186} play delay={SIGN_DELAY} />
        <div className="enter space-y-3 text-center" style={{ animationDelay: reduced ? "0ms" : "1500ms" }}>
          <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">
            {first ? `Todo listo, ${first}` : "Todo listo"}
          </h1>
          <p className="text-[15px] leading-[21px] text-muted-foreground">
            Tu primera hoja te espera. Escribe cómo te sientes hoy, aunque sea una línea.
          </p>
        </div>
      </main>
      <div className="enter mx-auto w-full max-w-[480px] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-12" style={{ animationDelay: reduced ? "0ms" : "1800ms" }}>
        <Button size="lg" className="w-full" onClick={() => sessionActions.completeSetup()} autoFocus>
          Escribir mi primera nota
        </Button>
      </div>
    </div>
  );
};
