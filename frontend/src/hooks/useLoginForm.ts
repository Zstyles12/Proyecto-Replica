import { useState, useCallback, type FormEvent } from 'react';
import { LOGIN_CONTENT } from '../data/loginContent';
import type { UserRole } from './useRoleToggle';

export type SubmissionStatus = 'idle' | 'loading' | 'success';

export interface UseLoginFormProps {
  readonly role: UserRole;
  readonly onLoginSuccess?: (email: string, role: UserRole) => void;
}

export interface UseLoginFormReturn {
  readonly email: string;
  readonly password: string;
  readonly isPasswordVisible: boolean;
  readonly status: SubmissionStatus;
  readonly buttonLabel: string;
  readonly setEmail: (value: string) => void;
  readonly setPassword: (value: string) => void;
  readonly togglePasswordVisibility: () => void;
  readonly handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useLoginForm({ role, onLoginSuccess }: UseLoginFormProps): UseLoginFormReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>('idle');

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const defaultButtonLabel = role === 'seeker'
    ? LOGIN_CONTENT.portal.roles.seeker.submitButtonText
    : LOGIN_CONTENT.portal.roles.therapist.submitButtonText;

  let buttonLabel: string = defaultButtonLabel;
  if (status === 'loading') {
    buttonLabel = LOGIN_CONTENT.portal.form.submittingText;
  } else if (status === 'success') {
    buttonLabel = LOGIN_CONTENT.portal.form.successText;
  }

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!email || !password) return;

      setStatus('loading');
      setTimeout(() => {
        setStatus('success');
        onLoginSuccess?.(email, role);
        setTimeout(() => {
          setStatus('idle');
        }, 1800);
      }, 900);
    },
    [email, password, role, onLoginSuccess]
  );

  return {
    email,
    password,
    isPasswordVisible,
    status,
    buttonLabel,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    handleSubmit,
  };
}
