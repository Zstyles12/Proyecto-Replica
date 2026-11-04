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
        body: "Tu correo, tu perfil, tus notas con sus réplicas y tus conversaciones con psicólogos. Puedes borrar cualquier nota desde su detalle: se borra con su réplica. Si la compartiste en el chat, ese mensaje se queda como lo enviaste.",
      },
      {
        heading: "La IA",
        body: "Cada nota que no es privada se envía a un modelo de IA para escribir su réplica. Solo se usa para responderte.",
      },
      {
        heading: "Los psicólogos",
        body: "Un psicólogo solo puede leer tu diario si tú se lo compartes, y deja de poder hacerlo cuando retiras el permiso o termina el acompañamiento. Lee tus notas, nunca las privadas ni sus réplicas.",
      },
      {
        heading: "Las notas clínicas",
        body: "Tu psicólogo puede escribir notas clínicas sobre su trabajo contigo. Solo las ve quien las escribe: ni tú, ni otros psicólogos, ni el equipo de Replica.",
      },
      {
        heading: "Si te verificas como psicólogo",
        body: "Tus datos profesionales y los documentos que envías para la verificación los ven solo tú y el equipo de administración de Replica. Se guardan en un espacio privado. Con tu perfil aprobado, aparecen en el directorio tu nombre, cómo te presentas, tu cédula, tus años de experiencia, tus especialidades, tu enfoque y lo que escribiste sobre ti.",
      },
      { heading: "Lo que nunca hacemos", body: "No vendemos tus datos ni los usamos para publicidad." },
    ],
  },
};
