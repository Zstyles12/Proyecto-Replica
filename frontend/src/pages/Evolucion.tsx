import React, { useEffect, useMemo, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { Enter } from "../components/motion/Motion";
import { useNotes } from "../features/journal/store";
import { clothDays, moodCurve, moodDays, patterns, recentSummary, summary, type CurvePeriod } from "../features/profile/metrics";
import { MoodCurve } from "../features/evolution/components/MoodCurve";
import { MoodBars } from "../features/evolution/components/MoodBars";
import { WovenCloth } from "../features/evolution/components/WovenCloth";
import { PatternCard } from "../features/evolution/components/PatternCard";
import { WritingSummary } from "../features/evolution/components/WritingSummary";
import { EVOLUCION_CONTENT } from "../data/evolucionContent";
import { tutorials, useCancelToursOnLeave } from "../lib/tutorials";

const PERIOD_DAYS: Record<CurvePeriod, number> = { semana: 7, mes: 35, ano: 365 };

/**
 * Evolución (app/(tabs)/evolucion/index.tsx): cómo te sentiste en el tiempo, qué se repite en tus notas,
 * tu escritura en números y tu tela. El cofre no se repite aquí: vive en Usuario y junto al saludo de
 * Inicio. Todo sale de lo que escribiste o elegiste.
 */
export const Evolucion: React.FC = () => {
  const notes = useNotes();
  const [period, setPeriod] = useState<CurvePeriod>("semana");
  const curveRef = useRef<HTMLDivElement>(null);
  const { periods, periodSpans, moodCurve: curveCopy, patterns: patternsCopy } = EVOLUCION_CONTENT;

  const curve = useMemo(() => moodCurve(notes, period), [notes, period]);
  const moodsInPeriod = useMemo(() => moodDays(notes, PERIOD_DAYS[period]), [notes, period]);
  const found = useMemo(() => patterns(notes), [notes]);
  const columns = useMemo(() => clothDays(notes), [notes]);
  const totals = useMemo(() => summary(notes), [notes]);
  const month = useMemo(() => recentSummary(notes, 30), [notes]);

  // La primera vez: la curva se recorre.
  useCancelToursOnLeave(["evolucion"]);
  useEffect(() => {
    const t = setTimeout(
      () => tutorials.start("evolucion", [{ target: curveRef, text: "Pasa el cursor o toca la curva para ver cómo te sentiste cada día.", radius: 24 }]),
      700
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      <Enter>
        <h1 className="font-replica text-[28px] font-normal leading-[34px] tracking-[-0.3px] text-foreground">Evolución</h1>
      </Enter>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        <div className="min-w-0 space-y-6">
          <div role="radiogroup" aria-label="Periodo" className="inline-flex w-full rounded-full bg-surface-sunken p-1 sm:w-auto">
            {periods.map((p) => {
              const selected = period === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPeriod(p.value)}
                  className={`min-h-9 flex-1 rounded-full px-4 text-[13px] font-medium transition-all duration-indicator ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice sm:flex-initial ${
                    selected ? "bg-surface-raised text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <section className="space-y-5 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none md:p-6">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.6px] text-voice">
                <Activity size={14} aria-hidden="true" />
                {curveCopy.badge}
              </p>
              <h2 className="font-replica text-[26px] font-normal leading-8 text-foreground">{curveCopy.title}</h2>
              <p className="text-xs text-muted-foreground">
                {periodSpans[period]}, {curveCopy.subtitleSuffix}
              </p>
            </div>
            <div ref={curveRef}>
              <MoodCurve points={curve.points} axis={curve.axis} period={period} />
            </div>
            <div className="h-px bg-border/30" />
            <MoodBars counts={moodsInPeriod} periodDays={PERIOD_DAYS[period]} />
          </section>

          <section className="rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none md:p-6">
            <WovenCloth columns={columns} />
          </section>
        </div>

        <aside className="mt-6 space-y-6 lg:mt-0">
          <WritingSummary words={totals.words} notes={month.notes} days={month.days} />

          <section className="space-y-4 rounded-lg border border-border/40 bg-surface-raised p-5 shadow-raised dark:shadow-none md:p-6">
            <h2 className="font-replica text-xl font-medium leading-[26px] text-foreground">{patternsCopy.title}</h2>
            {found.length ? (
              <div className="space-y-3">
                {found.map((p) => (
                  <PatternCard key={p.id} pattern={p} />
                ))}
              </div>
            ) : (
              <p className="text-[15px] leading-[21px] text-muted-foreground">{patternsCopy.emptyDescription}</p>
            )}
            <p className="border-t border-border/30 pt-2 text-xs text-muted-foreground">{patternsCopy.footnote}</p>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Evolucion;
