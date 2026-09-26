import React from 'react';
import { Link } from 'react-router-dom';
import { MaterialIcon } from '../common/MaterialIcon';
import { REGISTRO_CONTENT } from '../../data/registroContent';

export interface RegistroFooterProps {
  readonly onLoginClick?: () => void;
}

export const RegistroFooter: React.FC<RegistroFooterProps> = ({ onLoginClick }) => {
  const { footer } = REGISTRO_CONTENT;

  return (
    <div className="pt-space-sm text-center space-y-3">
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {footer.alreadyHaveAccountText}{' '}
        <Link
          to="/login"
          onClick={onLoginClick}
          className="text-primary hover:text-on-primary-fixed-variant font-semibold underline underline-offset-4 ml-1 transition-colors"
        >
          {footer.loginLinkText}
        </Link>
      </p>

      <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed-variant font-label-sm text-[11px] whitespace-nowrap shrink-0 select-none">
        <MaterialIcon name="lock" ariaHidden={true} className="text-xs text-secondary shrink-0" />
        <span>Espacio seguro y confidencial • Cifrado activo</span>
      </div>
    </div>
  );
};
