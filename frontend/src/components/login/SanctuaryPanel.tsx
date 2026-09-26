import React from 'react';
import { BreathingPebble } from './BreathingPebble';
import { SanctuaryCommitmentList } from './SanctuaryCommitmentList';
import { LOGIN_CONTENT } from '../../data/loginContent';

export interface SanctuaryPanelProps {
  readonly onActionClick?: () => void;
}

export const SanctuaryPanel: React.FC<SanctuaryPanelProps> = () => {
  const { sanctuary } = LOGIN_CONTENT;

  return (
    <section className="w-full lg:col-span-5 lg:h-screen lg:sticky lg:top-0 flex flex-col items-center lg:items-start text-center lg:text-left justify-start lg:justify-between px-4 pt-4 pb-2 sm:pt-6 sm:pb-3 lg:p-space-xl relative overflow-hidden bg-transparent lg:bg-gradient-to-b lg:from-surface-container-low lg:via-surface-container lg:to-secondary-container/30 border-b-0 lg:border-r border-surface-container-high/60 shrink-0">
      {/* Ambient decorative light orbs (desktop enhanced) */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary-fixed/40 blur-2xl hidden lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-secondary-fixed/40 blur-2xl hidden lg:block"
        aria-hidden="true"
      />

      {/* Sanctuary Header: Condensed on mobile, full on desktop */}
      <div className="relative z-10 flex flex-col items-center lg:items-start space-y-1.5 lg:space-y-space-md text-center lg:text-left">
        {/* Status Badge: Always visible */}
        <div className="inline-flex items-center gap-1.5 bg-secondary-container/80 px-3 py-1 rounded-full shadow-sm text-on-secondary-container font-label-sm text-[11px] sm:text-xs uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>{sanctuary.statusBadge}</span>
        </div>

        {/* Sanctuary Title: Always visible */}
        <h1 className="font-headline-sm text-headline-sm lg:font-headline-lg lg:text-headline-lg text-on-surface tracking-tight mt-1 lg:mt-space-md">
          {sanctuary.title}{' '}
          <span className="text-primary font-bold">{sanctuary.titleAccent}</span>
        </h1>

        {/* Extended Description: Desktop only */}
        <p className="hidden lg:block font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {sanctuary.description}
        </p>
      </div>

      {/* Middle: Organic Interactive Breathing Pebble (Desktop only) */}
      <div className="hidden lg:flex w-full my-auto items-center justify-center">
        <BreathingPebble quote={sanctuary.breathingQuote} />
      </div>

      {/* Sanctuary Commitments / Badges (Desktop only) */}
      <div className="hidden lg:block w-full">
        <SanctuaryCommitmentList commitments={sanctuary.commitments} />
      </div>
    </section>
  );
};
