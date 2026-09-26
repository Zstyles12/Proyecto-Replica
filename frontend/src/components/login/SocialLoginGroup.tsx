import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { GoogleIcon } from '../common/GoogleIcon';
import { AppleIcon } from '../common/AppleIcon';
import { LOGIN_CONTENT } from '../../data/loginContent';

export interface SocialLoginGroupProps {
  readonly mode?: 'login' | 'register';
  readonly dividerText?: string;
  readonly onBiometryClick?: () => void;
  readonly onGoogleClick?: () => void;
  readonly onAppleClick?: () => void;
}

export const SocialLoginGroup: React.FC<SocialLoginGroupProps> = ({
  mode = 'login',
  dividerText,
  onBiometryClick,
  onGoogleClick,
  onAppleClick,
}) => {
  const isRegister = mode === 'register';
  const label = dividerText || (isRegister ? 'o regístrate en calma con' : LOGIN_CONTENT.portal.socialDivider);

  return (
    <div className="mt-4 sm:mt-5 lg:mt-space-lg">
      {/* Decorative divider with calm text */}
      <div className="relative flex items-center justify-center my-3 sm:my-3.5 lg:my-space-md">
        <div className="w-full h-px bg-surface-container-high" />
        <span className="absolute bg-surface-container-lowest px-space-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
      </div>

      {/* Alternative options */}
      <div className={`grid gap-2 sm:gap-space-sm ${isRegister ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {/* Biometry (only in login) */}
        {!isRegister && (
          <button
            type="button"
            onClick={onBiometryClick}
            className="flex items-center justify-center gap-1 sm:gap-space-xs py-2 px-2 sm:px-space-md min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface text-xs sm:text-label-md font-medium transition-colors shadow-sm cursor-pointer"
          >
            <MaterialIcon name="fingerprint" className="text-base sm:text-lg text-secondary shrink-0" ariaHidden={true} />
            <span className="truncate">Biometría</span>
          </button>
        )}

        {/* Google */}
        <button
          type="button"
          onClick={onGoogleClick}
          className="flex items-center justify-center gap-1 sm:gap-space-xs py-2 px-2 sm:px-space-md min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface text-xs sm:text-label-md font-medium transition-colors shadow-sm cursor-pointer"
        >
          <GoogleIcon className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate">Google</span>
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={onAppleClick}
          className="flex items-center justify-center gap-1 sm:gap-space-xs py-2 px-2 sm:px-space-md min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface text-xs sm:text-label-md font-medium transition-colors shadow-sm cursor-pointer"
        >
          <AppleIcon className="w-4 h-4 text-on-surface shrink-0" />
          <span className="truncate">Apple</span>
        </button>
      </div>
    </div>
  );
};
