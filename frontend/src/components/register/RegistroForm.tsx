import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { CalmSecurityMeter } from './CalmSecurityMeter';
import { TherapistLicenseField } from './TherapistLicenseField';
import { TermsCheckbox } from './TermsCheckbox';
import { REGISTRO_CONTENT } from '../../data/registroContent';
import { useRegistroForm } from '../../hooks/useRegistroForm';
import type { UserRole } from '../../hooks/useRoleToggle';

export interface RegistroFormProps {
  readonly role: UserRole;
  readonly onRegistroSuccess?: (data: {
    name: string;
    email: string;
    role: UserRole;
    licenseNumber?: string;
  }) => void;
  readonly onTermsClick?: () => void;
  readonly onPrivacyClick?: () => void;
}

export const RegistroForm: React.FC<RegistroFormProps> = ({
  role,
  onRegistroSuccess,
  onTermsClick,
  onPrivacyClick,
}) => {
  const { form } = REGISTRO_CONTENT;
  const {
    name,
    email,
    password,
    confirmPassword,
    licenseNumber,
    termsAccepted,
    isPasswordVisible,
    isConfirmPasswordVisible,
    errors,
    status,
    buttonLabel,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setLicenseNumber,
    setTermsAccepted,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleSubmit,
  } = useRegistroForm({ role, onRegistroSuccess });

  const isTherapist = role === 'therapist';

  return (
    <form className="space-y-space-sm text-left" onSubmit={handleSubmit} noValidate>
      {/* Field 1: Name */}
      <div className="space-y-1">
        <label
          htmlFor="name"
          className="block font-label-md text-label-md text-on-surface font-medium"
        >
          {form.nameLabel}
        </label>
        <div className="relative flex items-center">
          <MaterialIcon
            name="person"
            ariaHidden={true}
            className="absolute left-4 text-on-surface-variant/70 text-lg pointer-events-none"
          />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={form.namePlaceholder}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className="w-full min-h-[48px] pl-12 pr-4 py-3 bg-surface-container-low rounded-lg font-body-md text-base text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:shadow-md outline-none border border-outline-variant/40 transition-all duration-200"
          />
        </div>
        {errors.name && (
          <p id="name-error" role="alert" className="text-error font-label-sm text-xs mt-1">
            {errors.name}
          </p>
        )}
      </div>

      {/* Field 2: Email */}
      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block font-label-md text-label-md text-on-surface font-medium"
        >
          {form.emailLabel}
        </label>
        <div className="relative flex items-center">
          <MaterialIcon
            name="mail"
            ariaHidden={true}
            className="absolute left-4 text-on-surface-variant/70 text-lg pointer-events-none"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={form.emailPlaceholder}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="w-full min-h-[48px] pl-12 pr-4 py-3 bg-surface-container-low rounded-lg font-body-md text-base text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:shadow-md outline-none border border-outline-variant/40 transition-all duration-200"
          />
        </div>
        {errors.email && (
          <p id="email-error" role="alert" className="text-error font-label-sm text-xs mt-1">
            {errors.email}
          </p>
        )}
      </div>

      {/* Field 3: Password with Calm Security Meter */}
      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block font-label-md text-label-md text-on-surface font-medium"
        >
          {form.passwordLabel}
        </label>
        <div className="relative flex items-center">
          <MaterialIcon
            name="vpn_key"
            ariaHidden={true}
            className="absolute left-4 text-on-surface-variant/70 text-lg pointer-events-none"
          />
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={form.passwordPlaceholder}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="w-full min-h-[48px] pl-12 pr-12 py-3 bg-surface-container-low rounded-lg font-body-md text-base text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:shadow-md outline-none border border-outline-variant/40 transition-all duration-200"
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
            onClick={togglePasswordVisibility}
            className="absolute right-1 text-on-surface-variant hover:text-on-surface transition-colors w-11 h-11 flex items-center justify-center cursor-pointer"
          >
            <MaterialIcon
              name={isPasswordVisible ? 'visibility_off' : 'visibility'}
              ariaHidden={true}
              className="text-lg"
            />
          </button>
        </div>
        {/* Soft Calm Security Meter */}
        <CalmSecurityMeter password={password} />
        {errors.password && (
          <p id="password-error" role="alert" className="text-error font-label-sm text-xs mt-1">
            {errors.password}
          </p>
        )}
      </div>

      {/* Field 4: Confirm Password */}
      <div className="space-y-1">
        <label
          htmlFor="confirm-password"
          className="block font-label-md text-label-md text-on-surface font-medium"
        >
          {form.confirmPasswordLabel}
        </label>
        <div className="relative flex items-center">
          <MaterialIcon
            name="lock"
            ariaHidden={true}
            className="absolute left-4 text-on-surface-variant/70 text-lg pointer-events-none"
          />
          <input
            id="confirm-password"
            type={isConfirmPasswordVisible ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={form.confirmPasswordPlaceholder}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            className="w-full min-h-[48px] pl-12 pr-12 py-3 bg-surface-container-low rounded-lg font-body-md text-base text-on-surface placeholder:text-on-surface-variant focus:bg-surface-container-lowest focus:shadow-md outline-none border border-outline-variant/40 transition-all duration-200"
          />
          <button
            type="button"
            aria-label={isConfirmPasswordVisible ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
            onClick={toggleConfirmPasswordVisibility}
            className="absolute right-1 text-on-surface-variant hover:text-on-surface transition-colors w-11 h-11 flex items-center justify-center cursor-pointer"
          >
            <MaterialIcon
              name={isConfirmPasswordVisible ? 'visibility_off' : 'visibility'}
              ariaHidden={true}
              className="text-lg"
            />
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" role="alert" className="text-error font-label-sm text-xs mt-1">
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Field 5: Animated Conditional Therapist License Field */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isTherapist
            ? 'grid-rows-[1fr] opacity-100 mt-2'
            : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
        }`}
        aria-hidden={!isTherapist}
      >
        <div className="overflow-hidden">
          <TherapistLicenseField
            value={licenseNumber}
            onChange={setLicenseNumber}
            error={isTherapist ? errors.licenseNumber : undefined}
            disabled={!isTherapist}
          />
        </div>
      </div>

      {/* Field 6: Terms and Privacy Checkbox */}
      <TermsCheckbox
        checked={termsAccepted}
        onChange={setTermsAccepted}
        error={errors.terms}
        onTermsClick={onTermsClick}
        onPrivacyClick={onPrivacyClick}
      />

      {/* Main Action CTA Button */}
      <div className="pt-space-xs">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full min-h-[48px] py-3.5 px-space-lg bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary rounded-full font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-80"
        >
          <span>{buttonLabel}</span>
          <MaterialIcon
            name="arrow_forward"
            ariaHidden={true}
            className="text-base group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>
    </form>
  );
};
