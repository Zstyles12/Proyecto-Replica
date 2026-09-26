import React from 'react';
import { REGISTRO_CONTENT } from '../../data/registroContent';

export interface CalmSecurityMeterProps {
  readonly password: string;
}

export function getCalmLevel(password: string) {
  const levels = REGISTRO_CONTENT.calmMeterLevels;
  if (!password || password.length === 0) {
    return levels[0];
  }
  if (password.length < 6) {
    return levels[1];
  }
  if (password.length < 10) {
    return levels[2];
  }
  return levels[3];
}

export const CalmSecurityMeter: React.FC<CalmSecurityMeterProps> = ({ password }) => {
  const currentLevel = getCalmLevel(password);

  return (
    <div
      className="pt-1 flex items-center gap-2"
      role="progressbar"
      aria-label="Nivel de seguridad de clave"
      aria-valuenow={currentLevel.score}
      aria-valuemin={0}
      aria-valuemax={3}
      aria-valuetext={currentLevel.label}
    >
      <div className="h-1 flex-1 bg-surface-container-high rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 ${currentLevel.barColorClass}`}
          style={{ width: currentLevel.barWidth }}
        />
      </div>
      <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
        {currentLevel.label}
      </span>
    </div>
  );
};
