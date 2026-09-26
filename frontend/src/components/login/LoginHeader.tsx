import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { LOGIN_CONTENT } from '../../data/loginContent';

export interface LoginHeaderProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly badgeText?: string;
  readonly badgeIcon?: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({
  title = LOGIN_CONTENT.portal.greetingTitle,
  subtitle = LOGIN_CONTENT.portal.greetingSubtitle,
  badgeText = LOGIN_CONTENT.brand.secureBadge,
  badgeIcon = 'lock',
}) => {
  const { brand } = LOGIN_CONTENT;

  return (
    <div>
      {/* Brand & Security status */}
      <div className="flex items-center justify-between gap-2 sm:gap-space-md mb-3 sm:mb-4 lg:mb-space-lg">
        <div className="flex items-center gap-2 sm:gap-space-sm text-left">
          {/* Logo of Réplica: Stylized sanctuary emblem */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm shrink-0">
            <MaterialIcon name="spa" className="text-xl sm:text-2xl text-on-primary" ariaHidden={true} />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface font-bold leading-tight">
              {brand.name}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              {brand.tagline}
            </span>
          </div>
        </div>

        {/* Security badge with WCAG AA compliant contrast */}
        <div className="flex items-center gap-1 sm:gap-space-xs px-2.5 sm:px-space-md py-1 bg-secondary-fixed/40 rounded-full border border-secondary-fixed">
          <MaterialIcon name={badgeIcon} className="text-on-secondary-fixed-variant text-xs sm:text-sm" ariaHidden={true} />
          <span className="font-label-sm text-[11px] sm:text-label-sm text-on-secondary-fixed-variant font-semibold">
            {badgeText}
          </span>
        </div>
      </div>

      {/* Main Entrance Prompt */}
      <div className="mb-3 sm:mb-4 lg:mb-space-lg space-y-1 text-left">
        <h2 className="font-headline-md text-headline-md sm:font-display sm:text-display text-on-surface tracking-tight">
          {title}
        </h2>
        <p className="font-body-md text-body-md sm:font-body-lg sm:text-body-lg text-on-surface-variant">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
