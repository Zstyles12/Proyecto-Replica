export interface CommitmentItem {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
  readonly iconBgClass: string;
  readonly iconColorClass: string;
}

export interface SocialAccessMethod {
  readonly id: 'biometry' | 'google' | 'apple';
  readonly label: string;
}

export const LOGIN_CONTENT = {
  brand: {
    name: 'Réplica',
    tagline: 'Santuario Emocional',
    logoUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UhhoibsHy0vnklgZlSgOWuYzcnvdN7nM-1thM9dRdc0Wi80lLDN5ODUeX-FtAnrEKNn2VMwKYMXx2YwV7rGTFcLWjHe4YRwe_U-v4DbKT5vwJH-HFiDJ2HakVqDgxkBDNa88NQ5f3tI9MfKNpIrw9L0eYvSlwOFvuzi5WILT4h8ejiA89TY483lOKJEr7q4dboiHAswPq7-uJiGBVYIJ2yYCeWpTTUX1mN3PRw45G3m-ODsnsp6R8MwB8',
    secureBadge: 'Conexión Segura',
  },
  sanctuary: {
    statusBadge: 'Espacio activo y sereno',
    title: 'Tu refugio emocional,',
    titleAccent: 'siempre a tu ritmo.',
    description: 'Aquí no hay prisas, expectativas ajenas ni evaluaciones frías. Solo un lugar cálido para ordenar lo que sientes.',
    breathingQuote: '"No tienes que resolver todo hoy; basta con estar presente."',
    commitments: [
      {
        id: 'privacy',
        icon: 'verified_user',
        title: 'Privacidad absoluta',
        description: 'Cifrado de extremo a extremo para tus notas y voz',
        iconBgClass: 'bg-secondary-fixed',
        iconColorClass: 'text-secondary',
      },
      {
        id: 'no-judgment',
        icon: 'favorite',
        title: 'Sin juicios clínicos apresurados',
        description: 'Un diario íntimo guiado por la escucha y compasión',
        iconBgClass: 'bg-primary-fixed',
        iconColorClass: 'text-primary',
      },
    ] as readonly CommitmentItem[],
  },
  portal: {
    greetingTitle: 'Hola, estás en casa.',
    greetingSubtitle: 'Tómate tu tiempo. Respira hondo antes de cruzar esta puerta.',
    roleSelectorLabel: '¿Cómo deseas conectar hoy?',
    roles: {
      seeker: {
        id: 'seeker' as const,
        label: 'Busco mi espacio',
        icon: 'spa',
        submitButtonText: 'Entrar a mi espacio',
      },
      therapist: {
        id: 'therapist' as const,
        label: 'Acompaño procesos',
        icon: 'psychology_alt',
        submitButtonText: 'Acceder al consultorio',
      },
    },
    form: {
      emailLabel: '¿Cómo te encontramos?',
      emailPlaceholder: 'tu.correo@ejemplo.com',
      passwordLabel: 'Tu clave de calma',
      passwordPlaceholder: 'Ingresa tu contraseña',
      forgotPasswordLink: '¿Olvidaste cómo entrar?',
      submittingText: 'Preparando tu espacio...',
      successText: 'Bienvenido/a de nuevo',
    },
    socialDivider: 'O continúa en calma con',
    footer: {
      registerPrompt: '¿Aún no tienes un espacio aquí?',
      registerLinkText: 'Crear mi cuenta',
      securityAssurance: 'Espacio seguro y confidencial',
    },
  },
} as const;
