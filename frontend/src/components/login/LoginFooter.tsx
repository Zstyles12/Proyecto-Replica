import React from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '../common/MaterialIcon';
import { LOGIN_CONTENT } from '../../data/loginContent';

export interface LoginFooterProps {
  readonly onRegisterClick?: () => void;
}

export const LoginFooter: React.FC<LoginFooterProps> = ({ onRegisterClick }) => {
  const { footer } = LOGIN_CONTENT.portal;

  return (
    <div className="mt-4 sm:mt-5 lg:mt-space-xl pt-2 sm:pt-space-sm flex flex-col lg:flex-row items-center justify-between gap-2.5 sm:gap-3 font-label-md text-label-md text-on-surface-variant text-center lg:text-left">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {footer.registerPrompt}{' '}
        <Link
          to="/registro"
          onClick={onRegisterClick}
          className="text-primary font-semibold hover:underline ml-1 cursor-pointer transition-colors"
        >
          {footer.registerLinkText}
        </Link>
      </p>

      <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed-variant font-label-sm text-[11px] whitespace-nowrap shrink-0 select-none">
        <MaterialIcon name="verified_user" ariaHidden={true} className="text-xs text-secondary shrink-0" />
        <span>Cifrado de extremo a extremo • Sin juicios</span>
      </div>
    </div>
  );
};
