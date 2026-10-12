type Doc = { title: string; sections: { heading: string; body: string }[] };

// Resumen en lenguaje claro de los compromisos ya decididos (app/legal/[doc].tsx). El texto legal
// completo se publicará antes del lanzamiento; este resumen no lo reemplaza.
export const LEGAL_DOCS: Record<string, Doc> = {
  terminos: {
    title: "Términos",
    sections: [
      {
        heading: "Qué es Replica",
        body: "Un diario personal que responde a cada nota con una reflexión escrita por una IA, y un espacio para hablar con psicólogos verificados.",
      },
      {
        heading: "Qué no es",
        body: "Replica no es un servicio de emergencias ni reemplaza la terapia, un diagnóstico o un tratamiento. Si estás en peligro, busca ayuda inmediata en tu localidad.",
      },
      { heading: "Edad", body: "Replica es para personas de 18 años o más." },
      {
        heading: "Tu cuenta",
        body: "Puedes cerrar sesión o eliminar tu cuenta cuando quieras desde Usuario. Al eliminarla se borra todo lo que escribiste.",
      },
    ],
  },
  privacidad: {
    title: "Privacidad",
    sections: [
      {
        heading: "Lo que guardamos",
        body: "Tu correo, tu perfil, tus notas con sus réplicas y tus conversaciones con psicólogos.",
      },
      {
        heading: "La IA",
        body: "Cada nota se envía a un modelo de IA para escribir su réplica. Solo se usa para responderte.",
      },
      {
        heading: "Los psicólogos",
        body: "Un psicólogo solo puede leer tu diario si tú se lo compartes, y deja de poder hacerlo cuando retiras el permiso.",
      },
      { heading: "Lo que nunca hacemos", body: "No vendemos tus datos ni los usamos para publicidad." },
    ],
  },
};
