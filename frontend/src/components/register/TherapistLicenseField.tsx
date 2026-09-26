import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { REGISTRO_CONTENT } from '../../data/registroContent';

export interface TherapistLicenseFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
}

export const TherapistLicenseField: React.FC<TherapistLicenseFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const { form } = REGISTRO_CONTENT;

  return (
    <div
      role="region"
      aria-label="Campo profesional obligatorio"
      className="bg-primary-fixed/30 p-space-md rounded-lg space-y-2 border border-primary-fixed/70 text-left transition-all duration-300"
    >
      <div className="flex items-center gap-2 text-primary font-label-md">
        <MaterialIcon name="medical_services" className="text-base" ariaHidden={true} />
        <span className="font-semibold">{form.therapistSectionTitle}</span>
      </div>

      <div>
        <label
          htmlFor="license-number"
          className="block font-label-sm text-label-sm text-on-surface mb-1 font-medium"
        >
          {form.therapistLicenseLabel}
        </label>
        <div className="relative flex items-center">
          <MaterialIcon
            name="badge"
            ariaHidden={true}
            className="absolute left-4 text-on-surface-variant/70 text-lg pointer-events-none"
          />
          <input
            id="license-number"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={form.therapistLicensePlaceholder}
            aria-invalid={!!error}
            aria-describedby={error ? 'license-error' : 'license-notice'}
            disabled={disabled}
            className="w-full min-h-[48px] pl-12 pr-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-DEFAULT font-body-md text-base outline-none shadow-sm focus:ring-2 focus:ring-primary/40 border border-outline-variant/50 transition-all disabled:opacity-50"
          />
        </div>
        {error ? (
          <p id="license-error" role="alert" className="text-error font-label-sm text-xs mt-1">
            {error}
          </p>
        ) : (
          <p id="license-notice" className="font-label-sm text-[11px] text-on-surface-variant leading-tight mt-1.5">
            {form.therapistLicenseNotice}
          </p>
        )}
      </div>
    </div>
  );
};
