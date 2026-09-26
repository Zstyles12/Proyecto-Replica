import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { REGISTRO_CONTENT } from '../../data/registroContent';

export interface TermsCheckboxProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly error?: string;
  readonly onTermsClick?: () => void;
  readonly onPrivacyClick?: () => void;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onChange,
  error,
  onTermsClick,
  onPrivacyClick,
}) => {
  const { form } = REGISTRO_CONTENT;

  return (
    <div className="pt-1 text-left">
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            id="terms-consent"
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={!!error}
            aria-describedby={error ? 'terms-error' : undefined}
            className="peer appearance-none w-5 h-5 rounded-md bg-surface-container-low checked:bg-primary cursor-pointer transition-colors border border-outline-variant/60 focus:ring-2 focus:ring-primary/40"
          />
          <MaterialIcon
            name="check"
            ariaHidden={true}
            className="text-on-primary text-sm absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
          />
        </div>
        <label
          htmlFor="terms-consent"
          className="font-body-sm text-[13px] text-on-surface-variant cursor-pointer leading-relaxed select-none"
        >
          {form.termsConsentText}{' '}
          <button
            type="button"
            onClick={onTermsClick}
            className="text-primary hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0 inline"
          >
            {form.termsLinkText}
          </button>{' '}
          y la{' '}
          <button
            type="button"
            onClick={onPrivacyClick}
            className="text-primary hover:underline font-semibold cursor-pointer bg-transparent border-0 p-0 inline"
          >
            {form.privacyLinkText}
          </button>{' '}
          <span className="text-secondary font-medium">{form.termsEncryptedNotice}</span>
        </label>
      </div>

      {error && (
        <p id="terms-error" role="alert" className="text-error font-label-sm text-xs mt-1 pl-8">
          {error}
        </p>
      )}
    </div>
  );
};
