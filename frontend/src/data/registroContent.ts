export interface CalmMeterLevel {
  readonly score: number;
  readonly label: string;
  readonly barWidth: string;
  readonly barColorClass: string;
}

export const REGISTRO_CONTENT = {
  header: {
    title: 'Crea tu espacio seguro.',
    subtitle: 'Tómate tu tiempo. Este es el primer paso hacia un lugar solo para ti.',
    securityBadge: 'Cifrado activo',
  },
  roles: {
    selectorLabel: '¿Cómo deseas conectar hoy?',
    seekerLabel: 'Busco mi espacio',
    therapistLabel: 'Acompaño procesos',
  },
  form: {
    nameLabel: 'Tu nombre o cómo deseas que te llamemos',
    namePlaceholder: 'Ej. Sofía Valdés',
    emailLabel: '¿Cómo te encontramos?',
    emailPlaceholder: 'tu.correo@ejemplo.com',
    passwordLabel: 'Tu clave de calma',
    passwordPlaceholder: 'Elige una combinación protectora',
    confirmPasswordLabel: 'Confirma tu clave',
    confirmPasswordPlaceholder: 'Vuelve a escribirla con pausa',
    therapistSectionTitle: 'Campo para profesionales de la salud:',
    therapistLicenseLabel: 'Número de cédula o colegiatura profesional',
    therapistLicensePlaceholder: 'Ingresa tu cédula profesional',
    therapistLicenseNotice: 'Validamos tu acreditación para garantizar un acompañamiento ético y riguroso.',
    termsConsentText: 'Comprendo que Réplica trata datos sensibles de bienestar emocional y acepto los',
    termsLinkText: 'Términos de Servicio',
    privacyLinkText: 'Política de Privacidad de Salud Mental',
    termsEncryptedNotice: '(Cifrado de grado médico).',
    submitButtonText: 'Crear mi espacio seguro',
    submittingText: 'Preparando tu refugio...',
    successText: 'Tu espacio ha sido creado',
  },
  socialDivider: 'o regístrate en calma con',
  footer: {
    alreadyHaveAccountText: '¿Ya tienes un espacio aquí?',
    loginLinkText: 'Iniciar sesión',
    securityAssurance: 'Espacio seguro y confidencial',
  },
  calmMeterLevels: [
    {
      score: 0,
      label: 'Calma inicial',
      barWidth: '15%',
      barColorClass: 'bg-secondary-fixed',
    },
    {
      score: 1,
      label: 'Poco a poco',
      barWidth: '35%',
      barColorClass: 'bg-secondary-fixed-dim',
    },
    {
      score: 2,
      label: 'Clave protectora',
      barWidth: '70%',
      barColorClass: 'bg-primary-container',
    },
    {
      score: 3,
      label: 'Santuario blindado',
      barWidth: '100%',
      barColorClass: 'bg-secondary',
    },
  ] as readonly CalmMeterLevel[],
  validationMessages: {
    nameRequired: 'Por favor, compártenos tu nombre o apodo para dirigirnos a ti.',
    emailInvalid: 'Por favor, ingresa un correo con formato válido.',
    passwordMinLength: 'Tu clave debe tener al menos 8 caracteres para brindarte mayor protección.',
    passwordsMismatch: 'Las claves aún no coinciden; tómate un momento para revisarlas.',
    licenseRequired: 'Para habilitar tu consultorio, ingresa tu número de cédula profesional.',
    termsRequired: 'Es necesario aceptar el tratamiento sensible de datos para crear tu espacio.',
  },
} as const;
