import React from 'react';
import { SanctuaryPanel } from '../components/login/SanctuaryPanel';
import { LoginHeader } from '../components/login/LoginHeader';
import { RoleToggle } from '../components/login/RoleToggle';
import { LoginForm } from '../components/login/LoginForm';
import { SocialLoginGroup } from '../components/login/SocialLoginGroup';
import { LoginFooter } from '../components/login/LoginFooter';
import { useRoleToggle } from '../hooks/useRoleToggle';
import type { UserRole } from '../hooks/useRoleToggle';

export interface LoginProps {
  readonly initialRole?: UserRole;
  readonly onLoginSuccess?: (email: string, role: UserRole) => void;
  readonly onRegisterClick?: () => void;
  readonly onForgotPasswordClick?: () => void;
  readonly onBiometryClick?: () => void;
  readonly onGoogleClick?: () => void;
  readonly onAppleClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  initialRole = 'seeker',
  onLoginSuccess,
  onRegisterClick,
  onForgotPasswordClick,
  onBiometryClick,
  onGoogleClick,
  onAppleClick,
}) => {
  const { role, setRole } = useRoleToggle(initialRole);

  return (
    <div className="min-h-screen w-full bg-background font-body text-body-md text-on-surface antialiased relative overflow-x-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Background ambient glowing orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-primary-fixed/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-secondary-fixed/15 blur-3xl"
          aria-hidden="true"
        />
      </div>

      {/* Main full-bleed 2-column layout stretching min-h-screen */}
      <main className="relative z-10 w-full min-h-screen lg:h-screen grid grid-cols-1 lg:grid-cols-12 items-stretch lg:overflow-hidden">
        {/* Left Sanctuary Canvas (5 cols, full height) */}
        <SanctuaryPanel />

        {/* Right Portal Form Column (7 cols, full height with independent internal scroll) */}
        <section className="lg:col-span-7 flex flex-col justify-start lg:justify-between px-4 pt-1 pb-6 sm:px-8 sm:pt-2 sm:pb-8 lg:p-space-xl min-h-full lg:h-screen lg:overflow-y-auto bg-surface-container-lowest/80 backdrop-blur-xl">
          <div className="w-full max-w-md md:max-w-xl mx-auto flex flex-col lg:justify-center lg:flex-1 lg:my-auto py-1 sm:py-2 lg:py-space-md">
            <LoginHeader />
            <RoleToggle currentRole={role} onRoleChange={setRole} />
            <LoginForm
              role={role}
              onLoginSuccess={onLoginSuccess}
              onForgotPasswordClick={onForgotPasswordClick}
            />
            <SocialLoginGroup
              onBiometryClick={onBiometryClick}
              onGoogleClick={onGoogleClick}
              onAppleClick={onAppleClick}
            />
          </div>

          <div className="w-full max-w-md md:max-w-xl mx-auto pt-3 sm:pt-5 lg:pt-space-md">
            <LoginFooter onRegisterClick={onRegisterClick} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
