import React from 'react';
import { MaterialIcon } from '../common/MaterialIcon';
import { LOGIN_CONTENT } from '../../data/loginContent';
import type { UserRole } from '../../hooks/useRoleToggle';

export interface RoleToggleProps {
  readonly currentRole: UserRole;
  readonly onRoleChange: (role: UserRole) => void;
  readonly label?: string;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({
  currentRole,
  onRoleChange,
  label = LOGIN_CONTENT.portal.roleSelectorLabel,
}) => {
  const { roles } = LOGIN_CONTENT.portal;
  const isSeeker = currentRole === 'seeker';
  const isTherapist = currentRole === 'therapist';

  return (
    <div className="mb-3 sm:mb-4 lg:mb-space-lg text-left">
      {/* Accessible header linked via aria-labelledby */}
      <p
        id="role-label"
        className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs block uppercase tracking-wider font-semibold"
      >
        {label}
      </p>

      <div
        className="grid grid-cols-2 gap-1 sm:gap-space-sm p-1 sm:p-1.5 bg-surface-container rounded-full"
        role="tablist"
        aria-labelledby="role-label"
      >
        {/* Seeker / Busco mi espacio */}
        <button
          type="button"
          role="tab"
          aria-selected={isSeeker}
          aria-label="Conectar en modo usuario: Busco mi espacio personal"
          onClick={() => onRoleChange('seeker')}
          className={`flex items-center justify-center gap-1 sm:gap-space-sm py-2 px-2 sm:px-space-md min-h-[44px] rounded-full text-xs sm:text-label-md lg:text-label-lg transition-all duration-200 cursor-pointer ${
            isSeeker
              ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
              : 'bg-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MaterialIcon name={roles.seeker.icon} className="text-base sm:text-lg shrink-0" ariaHidden={true} />
          <span className="truncate">{roles.seeker.label}</span>
          <MaterialIcon
            name="check"
            ariaHidden={true}
            className={`text-xs sm:text-sm ml-auto text-secondary transition-opacity duration-200 hidden sm:block ${
              isSeeker ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>

        {/* Therapist / Acompaño procesos */}
        <button
          type="button"
          role="tab"
          aria-selected={isTherapist}
          aria-label="Conectar en modo profesional: Acompaño procesos terapéuticos"
          onClick={() => onRoleChange('therapist')}
          className={`flex items-center justify-center gap-1 sm:gap-space-sm py-2 px-2 sm:px-space-md min-h-[44px] rounded-full text-xs sm:text-label-md lg:text-label-lg transition-all duration-200 cursor-pointer ${
            isTherapist
              ? 'bg-surface-container-lowest text-secondary shadow-sm font-semibold'
              : 'bg-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MaterialIcon name={roles.therapist.icon} className="text-base sm:text-lg shrink-0" ariaHidden={true} />
          <span className="truncate">{roles.therapist.label}</span>
          <MaterialIcon
            name="check"
            ariaHidden={true}
            className={`text-xs sm:text-sm ml-auto text-secondary transition-opacity duration-200 hidden sm:block ${
              isTherapist ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
