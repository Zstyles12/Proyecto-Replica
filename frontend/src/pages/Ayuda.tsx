import React, { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { countryOfZone, HELP_COUNTRIES } from "../data/helpResources";
import { activeConversation, useCare } from "../features/care/store";
import { findPsychologist } from "../features/care/data";
import { helpService, type HelpResource } from "../services/help";

const OTHER = "otro";
const STORAGE_KEY = "replica:ayuda-pais";

// El país que se eligió en este navegador; si no, el de la zona horaria; si no, "Otro país".
function firstCountry() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === OTHER || HELP_COUNTRIES.some((c) => c.code === saved))) return saved;
  } catch {
    // Sin almacenamiento, se sugiere de nuevo cada vez.
  }
  return countryOfZone(Intl.DateTimeFormat().resolvedOptions().timeZone) ?? OTHER;
}

function rememberCountry(code: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Es solo una comodidad.
  }
}

// Se marca solo lo que se marca: dígitos, y el asterisco de Chile.
function telOf(contact: string) {
  return `tel:${contact.replace(/[^\d*+#]/g, "")}`;
}

function checkedLabel(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Ayuda en crisis (RF-59, RF-60, DESIGN-WEB.md §11): las líneas comprobadas del país, un ejercicio de
 * respiración y escribirle a su psicólogo. Tono calmado y sin rojo. Un país sin línea comprobada no
 * muestra ningún número.
 */
export const Ayuda: React.FC = () => {
  const selectId = useId();
  const [country, setCountry] = useState(firstCountry);
  const [resources, setResources] = useState<HelpResource[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    helpService
      .resources()
      .then((list) => alive && setResources(list))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const mine = (resources ?? []).filter((r) => r.country === country);
  const emergency = mine.find((r) => r.kind === "emergency");
  const lines = mine.filter((r) => r.kind === "line");
  const countryName = HELP_COUNTRIES.find((c) => c.code === country)?.name;

  return (
    <div className="mx-auto max-w-[680px] space-y-8 lg:mx-0">
      <PageHeader title="Ayuda en crisis" fallback="/" />

      <section className="space-y-3">
        <p className="font-replica text-[24px] leading-[31px] text-foreground">
          Si estás pasando por un momento difícil, no tienes que cargarlo a solas.
        </p>
        <p className="text-[15px] leading-[22px] text-muted-foreground">
          {emergency ? (
            <>
              Si tu vida o la de alguien corre peligro ahora, llama a emergencias:{" "}
              <a href={telOf(emergency.contact)} className="font-semibold text-voice underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice">
                {emergency.contact}
              </a>
              .
            </>
          ) : (
            "Si tu vida o la de alguien corre peligro ahora, llama a emergencias o acude al centro de salud más cercano."
          )}
        </p>
      </section>

      <section aria-labelledby={`${selectId}-titulo`} className="space-y-4">
        <h2 id={`${selectId}-titulo`} className="font-replica text-xl font-medium text-foreground">
          Líneas de atención
        </h2>
        <div className="space-y-1.5">
          <label htmlFor={selectId} className="block text-[13px] font-semibold text-muted-foreground">
            País
          </label>
          <select
            id={selectId}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              rememberCountry(e.target.value);
            }}
            className="h-11 w-full max-w-xs rounded-md border border-border/60 bg-surface-raised px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            {HELP_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
            <option value={OTHER}>Otro país</option>
          </select>
        </div>

        <div aria-live="polite">
          {failed ? (
            <p role="alert" className="text-[15px] leading-[21px] text-emotion">
              No pudimos traer las líneas de atención. Revisa tu conexión e inténtalo otra vez.
            </p>
          ) : resources === null ? (
            <p className="text-[15px] text-muted-foreground">Cargando…</p>
          ) : lines.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {lines.map((line) => (
                <li key={line.id} className="flex flex-col gap-3 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none">
                  <div className="space-y-1">
                    <h3 className="font-replica text-lg font-medium leading-[24px] text-foreground">{line.name}</h3>
                    <p className="text-[15px] leading-[21px] text-muted-foreground">{line.description}</p>
                  </div>
                  <a
                    href={telOf(line.contact)}
                    className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-voice px-5 text-[15px] font-semibold text-voice-foreground transition-colors hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2"
                  >
                    <Phone size={16} aria-hidden="true" />
                    Llamar al {line.contact}
                  </a>
                  <p className="text-[12px] leading-[17px] text-muted-foreground">
                    Fuente:{" "}
                    <a
                      href={line.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
                    >
                      {domainOf(line.sourceUrl)}
                    </a>{" "}
                    · comprobada el {checkedLabel(line.checkedAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-surface-sunken px-5 py-4 text-[15px] leading-[22px] text-foreground">
              Todavía no tenemos una línea comprobada para {countryName ?? "tu país"}. Si estás en peligro, acude al centro de salud más cercano o pídele a alguien de confianza que te acompañe.
            </p>
          )}
        </div>
      </section>

      <Breathing />

      <YourPsychologist />
    </div>
  );
};

// Inhala 4 s, sostén 4 s, exhala 6 s, tres vueltas. Estos tiempos son el ejercicio, no la animación de
// la interfaz: por eso no salen de los tokens de movimiento.
const STEPS = [
  { label: "Inhala", ms: 4000, scale: 1 },
  { label: "Sostén", ms: 4000, scale: 1 },
  { label: "Exhala", ms: 6000, scale: 0.6 },
] as const;
const ROUNDS = 3;

function Breathing() {
  const titleId = useId();
  const [step, setStep] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const run = (i: number) => {
    if (i >= STEPS.length * ROUNDS) {
      setStep(null);
      setDone(true);
      return;
    }
    setStep(i);
    timer.current = setTimeout(() => run(i + 1), STEPS[i % STEPS.length].ms);
  };

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    setStep(null);
  };

  const current = step === null ? null : STEPS[step % STEPS.length];
  const scale = current?.scale ?? 0.6;

  return (
    <section aria-labelledby={titleId} className="space-y-4 rounded-lg bg-surface-sunken p-6">
      <div className="space-y-1">
        <h2 id={titleId} className="font-replica text-xl font-medium text-foreground">
          Respira conmigo
        </h2>
        <p className="text-[15px] leading-[21px] text-muted-foreground">Un minuto, a tu ritmo. Puedes parar cuando quieras.</p>
      </div>

      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex h-40 w-40 items-center justify-center" aria-hidden="true">
          <div
            className="h-40 w-40 rounded-full bg-voice-soft ease-in-out motion-reduce:!scale-100 motion-reduce:!transition-none"
            style={{
              transform: `scale(${scale})`,
              transitionProperty: "transform",
              transitionDuration: current ? `${current.ms}ms` : "0ms",
            }}
          />
        </div>
        <p className="min-h-[28px] font-replica text-[22px] leading-[28px] text-foreground" aria-live="polite">
          {current ? current.label : done ? "Bien. Vuelve a empezar si lo necesitas." : ""}
        </p>
        {step === null ? (
          <Button
            onClick={() => {
              setDone(false);
              run(0);
            }}
          >
            Empezar
          </Button>
        ) : (
          <Button variant="secondary" onClick={stop}>
            Parar
          </Button>
        )}
      </div>
    </section>
  );
}

function YourPsychologist() {
  const care = useCare();
  const active = activeConversation(care);
  const psychologist = active ? findPsychologist(active.psychologistId) : null;
  const firstName = psychologist?.name.split(" ")[0];

  return (
    <section className="space-y-3">
      <h2 className="font-replica text-xl font-medium text-foreground">{psychologist ? "Tu psicólogo" : "Acompañamiento"}</h2>
      <Link
        to={psychologist ? "/chat" : "/chat/directorio"}
        className="flex items-center gap-4 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice dark:shadow-none"
      >
        <MessageCircle size={20} className="shrink-0 text-voice" aria-hidden="true" />
        <span className="flex-1 text-[15px] leading-[21px] text-foreground">
          {psychologist ? `Escribirle a ${firstName}` : "Si quieres acompañamiento, en el directorio hay psicólogos verificados"}
        </span>
        <ChevronRight size={18} className="shrink-0 text-subtle" aria-hidden="true" />
      </Link>
    </section>
  );
}

export default Ayuda;
