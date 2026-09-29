/**
 * Fuente única de verdad para los textos del flujo de Autenticación y Onboarding.
 * Cumple con la Regla 2 del proyecto (cero copy improvisado o hardcodeado).
 */

export const AUTH_CONTENT = {
  welcome: {
    badge: "Bienvenida",
    skipText: "Saltar",
    steps: [
      {
        id: "step-1",
        title: "Escribe lo que viviste hoy",
        subtitle:
          "Una nota corta basta. Puedes escribirla o dictarla, incluso sin conexión.",
      },
      {
        id: "step-2",
        title: "Recibe una réplica",
        subtitle:
          "Tu primera nota del día recibe una reflexión al momento. En la noche, Replica lee todo lo que escribiste y te responde una vez más.",
      },
      {
        id: "step-3",
        title: "Tu psicólogo, cuando lo necesites",
        subtitle:
          "Chatea con un psicólogo verificado y, si quieres, compártele tu diario. Tú decides, y puedes retirar el permiso cuando quieras.",
      },
    ],
    actions: {
      next: "Siguiente",
      createAccount: "Crear mi cuenta",
      signIn: "Ya tengo cuenta",
      skip: "Saltar",
    },
  },

  form: {
    badge: "Tu cuenta",
    loginTitle: "Bienvenido de vuelta",
    registerTitle: "Crea tu espacio personal",
    loginSubtitle: "Ingresa tu correo y contraseña para entrar a tu diario.",
    registerSubtitle: "Tu diario es privado por defecto. Solo tú tienes acceso a lo que escribes.",
    tabs: {
      login: "Iniciar sesión",
      register: "Crear cuenta",
    },
    fields: {
      email: {
        label: "Correo electrónico",
        placeholder: "ejemplo@correo.com",
      },
      password: {
        label: "Contraseña",
        placeholder: "Mínimo 6 caracteres",
        showPasswordAria: "Mostrar contraseña",
        hidePasswordAria: "Ocultar contraseña",
      },
    },
    socialDivider: "o continúa con",
    buttons: {
      submitLogin: "Entrar a mi diario",
      submitRegister: "Crear cuenta y continuar",
      google: "Continuar con Google",
      apple: "Continuar con Apple",
    },
    notices: {
      invalidEmail: "Por favor ingresa un correo electrónico válido.",
      shortPassword: "La contraseña debe tener al menos 6 caracteres.",
      simulatedError:
        "No pudimos comprobar tus datos. Verifica tu correo y contraseña.",
      demoHint: "Prueba: 'error123' simula credenciales inválidas; cualquier otra contraseña te da acceso.",
    },
  },

  consent: {
    badge: "Paso 1 de 2",
    title: "Antes de empezar",
    subtitle:
      "Replica se sostiene sobre principios no negociables de privacidad y honestidad. Confirma que estás de acuerdo:",
    items: [
      {
        id: "age",
        label: "Tengo 18 años o más.",
      },
      {
        id: "terms",
        label:
          "Acepto los Términos de Servicio y he leído la Política de Privacidad de Replica.",
      },
      {
        id: "ai",
        label:
          "Entiendo que una inteligencia artificial (Gemini) lee mis notas guardadas para generar la réplica. El diario es privado y nunca diagnostica clínicamente.",
      },
    ],
    button: "Continuar a mi configuración",
  },

  setup: {
    badge: "Paso 2 de 2",
    title: "Configura tu espacio",
    subtitle:
      "Solo un par de detalles para que la réplica y los recordatorios se adapten a tu ritmo:",
    nameField: {
      label: "¿Cómo te gustaría que te llame Replica?",
      placeholder: "Tu nombre o como prefieras",
    },
    intentions: {
      label: "¿Qué te trae a Replica hoy?",
      options: [
        "Desahogarme y ordenar ideas",
        "Crear el hábito de escribir a diario",
        "Entender mejor mis emociones",
        "Acompañar mi proceso de terapia",
      ],
    },
    tone: {
      label: "Tono de la réplica",
      description: "Puedes ajustarlo cuando quieras desde tu perfil.",
      options: [
        {
          id: "suave",
          title: "Suave y cercana",
          desc: "Cálida, pausada y reflexiva.",
        },
        {
          id: "directa",
          title: "Directa y concisa",
          desc: "Breve, enfocada y sin rodeos.",
        },
      ],
    },
    dayReplyTime: {
      label: "Hora de tu réplica del día",
      description:
        "Lee las notas de tu jornada y te deja una reflexión global. Opciones fijadas en el sistema (03-base-de-datos.md):",
      options: [
        { id: "20:00", label: "20:00 (8:00 p. m.)" },
        { id: "22:00", label: "22:00 (10:00 p. m.)" },
      ],
    },
    button: "Guardar y finalizar",
  },

  ready: {
    badge: "Todo listo",
    title: "Tu diario está preparado",
    quote: "Cada palabra que escribes es hilo que se va tejiendo.",
    body: "Tu primera nota no tiene límite de extensión. Cuando estés listo, guarda y recibirás tu primera réplica.",
    button: "Comenzar a escribir",
  },
} as const;
