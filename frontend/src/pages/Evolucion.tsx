import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChartSpline,
  Activity,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { journalService } from "../services/journal";
import {
  moodCurve,
  moodDays,
  patterns,
  clothDays,
  summary,
  recentSummary,
  type CurvePeriod,
} from "../services/metrics";
import { MoodCurve } from "../features/evolution/components/MoodCurve";
import { MoodBars } from "../features/evolution/components/MoodBars";
import { WovenCloth } from "../features/evolution/components/WovenCloth";
import { PatternCard } from "../features/evolution/components/PatternCard";
import { WritingSummary } from "../features/evolution/components/WritingSummary";
import { DailyChestCard } from "../features/journal/components/DailyChestCard";
import { CofreIcon } from "../components/brand/CofreIcon";
import { EVOLUCION_CONTENT } from "../data/evolucionContent";
import { INICIO_CONTENT } from "../data/inicioContent";

const PERIOD_DAYS: Record<CurvePeriod, number> = {
  semana: 7,
  mes: 35,
  ano: 365,
};

export const Evolucion: React.FC = () => {
  const [period, setPeriod] = useState<CurvePeriod>("semana");
  const [entries] = useState(() => journalService.getEntries());

  const { header, periods, periodSpans, moodCurve: curveCopy, patterns: patternsCopy, chest: chestCopy } =
    EVOLUCION_CONTENT;

  // Cálculos matemáticos
  const curve = useMemo(() => moodCurve(entries, period), [entries, period]);
  const moodsInPeriod = useMemo(
    () => moodDays(entries, PERIOD_DAYS[period]),
    [entries, period]
  );
  const foundPatterns = useMemo(() => patterns(entries), [entries]);
  const clothColumns = useMemo(() => clothDays(entries), [entries]);
  const totals = useMemo(() => summary(entries), [entries]);
  const month = useMemo(() => recentSummary(entries, 30), [entries]);

  const defaultPhrase = INICIO_CONTENT.dailyQuotes[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera de la sección */}
      <header className="space-y-2 select-none">
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full bg-voice-soft text-voice text-xs font-semibold uppercase tracking-wider">
            {header.stepBadge}
          </span>
          <div className="w-10 h-10 rounded-full bg-voice-soft text-voice flex items-center justify-center shadow-xs">
            <ChartSpline size={18} />
          </div>
        </div>
        <h1 className="font-replica text-3xl md:text-4xl font-normal tracking-tight text-foreground">
          {header.title}
        </h1>
        <p className="font-voice text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {header.description}
        </p>
      </header>

      {/* Cuadrícula responsiva: 2 columnas balanceadas en escritorio (>= 1024px) */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
        {/* Columna Principal Izquierda (1fr) */}
        <div className="space-y-6 min-w-0">
          {/* Selector de Período Segmentado */}
          <div className="inline-flex w-full sm:w-auto p-1 rounded-full bg-surface border border-border/40 select-none">
            {periods.map((p) => {
              const isSelected = period === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value)}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-small cursor-pointer ${
                    isSelected
                      ? "bg-surface-raised text-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Tarjeta de Panorama Emocional (Curva + Barras) */}
          <div className="p-5 md:p-6 rounded-3xl bg-surface-raised border border-border/40 shadow-raised space-y-5 select-none">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-voice text-xs font-semibold uppercase tracking-wider">
                <Activity size={15} />
                <span>{curveCopy.badge}</span>
              </div>
              <h2 className="font-replica text-2xl font-normal text-foreground">
                {curveCopy.title}
              </h2>
              <p className="text-xs text-muted-foreground font-voice">
                {periodSpans[period]}, {curveCopy.subtitleSuffix}
              </p>
            </div>

            {/* Curva interactiva en SVG */}
            <MoodCurve
              points={curve.points}
              axis={curve.axis}
              period={period}
            />

            <div className="h-px bg-border/20" />

            {/* Barras porcentuales de ánimo */}
            <MoodBars
              counts={moodsInPeriod}
              periodDays={PERIOD_DAYS[period]}
            />
          </div>

          {/* Tarjeta Tu Tela (Matriz de 12 semanas) */}
          <div className="p-5 md:p-6 rounded-3xl bg-surface-raised border border-border/40 shadow-raised select-none">
            <WovenCloth columns={clothColumns} />
          </div>
        </div>

        {/* Columna Lateral Derecha (360px) */}
        <aside className="space-y-6 select-none">
          {/* Resumen de palabras escritas */}
          <WritingSummary
            words={totals.words}
            notes={month.notes}
            days={month.days}
          />

          {/* Sección de Temas y Patrones */}
          <div className="p-5 md:p-6 rounded-3xl bg-surface-raised border border-border/40 shadow-raised space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-reply" />
                <h3 className="font-replica text-lg font-medium text-foreground">
                  {patternsCopy.title}
                </h3>
              </div>
              {foundPatterns.length > 0 && (
                <span className="text-[11px] font-mono text-voice font-semibold">
                  {foundPatterns.length}{" "}
                  {foundPatterns.length === 1
                    ? patternsCopy.badgeFoundSingular
                    : patternsCopy.badgeFoundPlural}
                </span>
              )}
            </div>

            {foundPatterns.length > 0 ? (
              <div className="space-y-3">
                {foundPatterns.map((pat) => (
                  <PatternCard key={pat.id} pattern={pat} />
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface border border-border/30 text-center space-y-1">
                <p className="font-replica text-sm font-medium text-foreground">
                  {patternsCopy.emptyTitle}
                </p>
                <p className="text-xs text-muted-foreground font-voice leading-relaxed">
                  {patternsCopy.emptyDescription}
                </p>
              </div>
            )}

            <p className="text-[11px] text-subtle font-voice pt-1 border-t border-border/20">
              {patternsCopy.footnote}
            </p>
          </div>

          {/* Cofre de Aprendizajes (Frase Destilada) */}
          <div className="p-5 md:p-6 rounded-3xl bg-surface-raised border border-border/40 shadow-raised space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CofreIcon size={18} color="var(--voice)" heartColor="var(--emotion)" />
                <h3 className="font-replica text-lg font-medium text-foreground">
                  {chestCopy.title}
                </h3>
              </div>

              <Link
                to="/notas"
                className="text-xs text-voice hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>{chestCopy.openButton}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <DailyChestCard
              tag={defaultPhrase.tag}
              quote={defaultPhrase.quote}
              author={defaultPhrase.author}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Evolucion;
