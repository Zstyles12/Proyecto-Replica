/**
 * Textos de la bienvenida (app/(auth)/bienvenida.tsx). Los pasos de cuenta y configuración llevan sus
 * textos junto a su lógica, como en la app.
 */

export const AUTH_CONTENT = {
  welcome: {
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
} as const;
