import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { useBreathingCycle } from '../../hooks/useBreathingCycle';

export interface BreathingPebbleProps {
  readonly quote?: string;
  readonly cycleDurationMs?: number;
}

export const BreathingPebble: React.FC<BreathingPebbleProps> = ({
  quote = '"No tienes que resolver todo hoy; basta con estar presente."',
  cycleDurationMs = 4000,
}) => {
  const { phaseText, durationSeconds, isExpanded } = useBreathingCycle(cycleDurationMs);

  return (
    <div className="relative z-10 my-space-lg py-space-md flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center w-48 h-48 md:w-56 md:h-56">
        {/* Outer glowing halo */}
        <div
          className="absolute inset-0 rounded-full bg-primary-fixed/40 transition-transform duration-[4000ms] ease-in-out"
          style={{ transform: isExpanded ? 'scale(1.22)' : 'scale(1)' }}
          aria-hidden="true"
        />

        {/* Inner tactile pebble */}
        <div
          className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-secondary-container/70 shadow-sm transition-transform duration-[4000ms] ease-in-out flex flex-col items-center justify-center p-space-sm"
          style={{ transform: isExpanded ? 'scale(1.08)' : 'scale(1)' }}
          role="status"
          aria-live="polite"
        >
          <MaterialIcon name="spa" className="text-secondary text-2xl mb-1" ariaHidden={true} />
          <span className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-wider">
            {phaseText}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mt-0.5">
            {durationSeconds} segundos
          </span>
        </div>
      </div>

      {quote && (
        <p className="font-body-sm text-body-sm text-on-surface font-medium mt-space-md italic max-w-xs">
          {quote}
        </p>
      )}
    </div>
  );
};
