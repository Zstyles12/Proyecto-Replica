import { useState, useCallback, type FormEvent } from 'react';
import { REGISTRO_CONTENT } from '../data/registroContent';
import type { UserRole } from './useRoleToggle';

export interface RegistroFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  licenseNumber?: string;
  terms?: string;
}

export type RegistroSubmissionStatus = 'idle' | 'loading' | 'success';

export interface UseRegistroFormProps {
  readonly role: UserRole;
  readonly onRegistroSuccess?: (data: {
    name: string;
    email: string;
    role: UserRole;
    licenseNumber?: string;
  }) => void;
}

export interface UseRegistroFormReturn {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly licenseNumber: string;
  readonly termsAccepted: boolean;
  readonly isPasswordVisible: boolean;
  readonly isConfirmPasswordVisible: boolean;
  readonly errors: RegistroFormErrors;
  readonly status: RegistroSubmissionStatus;
  readonly buttonLabel: string;
  readonly setName: (val: string) => void;
  readonly setEmail: (val: string) => void;
  readonly setPassword: (val: string) => void;
  readonly setConfirmPassword: (val: string) => void;
  readonly setLicenseNumber: (val: string) => void;
  readonly setTermsAccepted: (val: boolean) => void;
  readonly togglePasswordVisibility: () => void;
  readonly toggleConfirmPasswordVisibility: () => void;
  readonly handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegistroForm({
  role,
  onRegistroSuccess,
}: UseRegistroFormProps): UseRegistroFormReturn {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<RegistroFormErrors>({});
  const [status, setStatus] = useState<RegistroSubmissionStatus>('idle');

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setIsConfirmPasswordVisible((prev) => !prev);
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: RegistroFormErrors = {};
    const { validationMessages } = REGISTRO_CONTENT;

    if (!name.trim()) {
      newErrors.name = validationMessages.nameRequired;
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      newErrors.email = validationMessages.emailInvalid;
    }

    if (password.length < 8) {
      newErrors.password = validationMessages.passwordMinLength;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = validationMessages.passwordsMismatch;
    }

    if (role === 'therapist' && !licenseNumber.trim()) {
      newErrors.licenseNumber = validationMessages.licenseRequired;
    }

    if (!termsAccepted) {
      newErrors.terms = validationMessages.termsRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, confirmPassword, role, licenseNumber, termsAccepted]);

  let buttonLabel: string = REGISTRO_CONTENT.form.submitButtonText;
  if (status === 'loading') {
    buttonLabel = REGISTRO_CONTENT.form.submittingText;
  } else if (status === 'success') {
    buttonLabel = REGISTRO_CONTENT.form.successText;
  }

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validate()) return;

      setStatus('loading');
      setTimeout(() => {
        setStatus('success');
        onRegistroSuccess?.({
          name: name.trim(),
          email: email.trim(),
          role,
          licenseNumber: role === 'therapist' ? licenseNumber.trim() : undefined,
        });
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      }, 1000);
    },
    [validate, name, email, role, licenseNumber, onRegistroSuccess]
  );

  return {
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
  };
}
