import { useState, useEffect } from 'react';

export type BreathingPhase = 'inhale' | 'exhale';

export interface UseBreathingCycleReturn {
  readonly phase: BreathingPhase;
  readonly phaseText: string;
  readonly durationSeconds: number;
  readonly isExpanded: boolean;
}

export function useBreathingCycle(cycleDurationMs: number = 4000): UseBreathingCycleReturn {
  const [phase, setPhase] = useState<BreathingPhase>('inhale');

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, cycleDurationMs);

    return () => clearInterval(timer);
  }, [cycleDurationMs]);

  // Physiological correction: Expansion occurs during INHALE, returning to rest during EXHALE
  const isExpanded = phase === 'inhale';
  const phaseText = phase === 'inhale' ? 'Inhala' : 'Exhala';
  const durationSeconds = Math.round(cycleDurationMs / 1000);

  return {
    phase,
    phaseText,
    durationSeconds,
    isExpanded,
  };
}
