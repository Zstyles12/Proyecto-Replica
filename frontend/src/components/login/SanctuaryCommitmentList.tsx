import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import type { CommitmentItem } from '../../data/loginContent';

export interface SanctuaryCommitmentListProps {
  readonly commitments: readonly CommitmentItem[];
}

export const SanctuaryCommitmentList: React.FC<SanctuaryCommitmentListProps> = ({
  commitments,
}) => {
  return (
    <div className="relative z-10 space-y-space-sm pt-space-sm">
      {commitments.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest/70 backdrop-blur-sm"
        >
          <div
            className={`w-8 h-8 rounded-full ${item.iconBgClass} flex items-center justify-center ${item.iconColorClass} shrink-0`}
          >
            <MaterialIcon name={item.icon} className="text-[18px]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              {item.title}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {item.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
