import { useState, useCallback } from 'react';
import { LOGIN_CONTENT } from '../data/loginContent';

export type UserRole = 'seeker' | 'therapist';

export interface UseRoleToggleReturn {
  readonly role: UserRole;
  readonly isSeeker: boolean;
  readonly isTherapist: boolean;
  readonly submitButtonText: string;
  readonly setRole: (newRole: UserRole) => void;
  readonly toggleRole: () => void;
}

export function useRoleToggle(initialRole: UserRole = 'seeker'): UseRoleToggleReturn {
  const [role, setRole] = useState<UserRole>(initialRole);

  const toggleRole = useCallback(() => {
    setRole((prev) => (prev === 'seeker' ? 'therapist' : 'seeker'));
  }, []);

  const isSeeker = role === 'seeker';
  const isTherapist = role === 'therapist';

  const submitButtonText = isSeeker
    ? LOGIN_CONTENT.portal.roles.seeker.submitButtonText
    : LOGIN_CONTENT.portal.roles.therapist.submitButtonText;

  return {
    role,
    isSeeker,
    isTherapist,
    submitButtonText,
    setRole,
    toggleRole,
  };
}
