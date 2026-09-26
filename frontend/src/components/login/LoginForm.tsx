import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { LOGIN_CONTENT } from '../../data/loginContent';
import { useLoginForm } from '../../hooks/useLoginForm';
import type { UserRole } from '../../hooks/useRoleToggle';

export interface LoginFormProps {
  readonly role: UserRole;
  readonly onLoginSuccess?: (email: string, role: UserRole) => void;
  readonly onForgotPasswordClick?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  onLoginSuccess,
  onForgotPasswordClick,
}) => {
  const { form } = LOGIN_CONTENT.portal;
  const {
    email,
    password,
    isPasswordVisible,
    status,
    buttonLabel,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginForm({ role, onLoginSuccess });

  return (
    <form className="space-y-space-md text-left" onSubmit={handleSubmit}>
      {/* Email input field */}
      <div>
        <label
          className="block font-label-md text-label-md text-on-surface mb-space-xs font-medium"
          htmlFor="email"
        >
          {form.emailLabel}
        </label>
        <div className="relative flex items-center">
          <MaterialIcon
            name="mail"
            ariaHidden={true}
            className="absolute left-space-md text-outline text-xl pointer-events-none"
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={form.emailPlaceholder}
            required
            className="w-full min-h-[48px] bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-11 pr-space-md py-3 rounded-lg font-body-md text-base focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all duration-200 border border-outline-variant/40"
          />
        </div>
      </div>

      {/* Password input field */}
      <div>
        <div className="flex items-center justify-between mb-space-xs">
          <label
            className="block font-label-md text-label-md text-on-surface font-medium"
            htmlFor="password"
          >
            {form.passwordLabel}
          </label>
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors cursor-pointer bg-transparent border-0 p-0 font-medium"
          >
            {form.forgotPasswordLink}
          </button>
        </div>
        <div className="relative flex items-center">
          <MaterialIcon
            name="key"
            ariaHidden={true}
            className="absolute left-space-md text-outline text-xl pointer-events-none"
          />
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={form.passwordPlaceholder}
            required
            className="w-full min-h-[48px] bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-11 pr-12 py-3 rounded-lg font-body-md text-base focus:outline-none focus:bg-surface-container-lowest focus:shadow-md transition-all duration-200 border border-outline-variant/40"
          />
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
            onClick={togglePasswordVisibility}
            className="absolute right-1 text-outline hover:text-on-surface w-11 h-11 flex items-center justify-center transition-colors cursor-pointer"
          >
            <MaterialIcon
              name={isPasswordVisible ? 'visibility_off' : 'visibility'}
              ariaHidden={true}
              className="text-xl"
            />
          </button>
        </div>
      </div>

      {/* Submit button with gentle press animation */}
      <div className="pt-space-xs">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full min-h-[48px] bg-primary hover:bg-primary-container text-on-primary py-3.5 px-space-lg rounded-full font-label-lg shadow-md hover:shadow-lg hover:scale-[0.99] active:scale-[0.97] transition-all flex items-center justify-center gap-space-sm group cursor-pointer disabled:opacity-80"
        >
          <span>{buttonLabel}</span>
          <MaterialIcon
            name="arrow_forward"
            ariaHidden={true}
            className="text-lg transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </form>
  );
};
