# Resumen del proyecto — Web

## Qué es

Replica es una web de salud mental con tres partes:

1. **Diario con réplica de IA.** La persona escribe o dicta cómo le fue en el día, qué le preocupa o qué siente. Al guardar la nota, la IA (Gemini) responde con una **réplica**: una reflexión breve y cálida con preguntas para seguir escribiendo.
2. **Chat con la IA.** Una conversación aparte del diario, con límite diario, que no diagnostica ni lee las notas privadas.
3. **Conexión con psicólogos.** La persona puede hablar por chat con un psicólogo verificado, coordinar sesiones por Google Meet y, si quiere, compartirle su diario.

**Nombre del producto: "Replica", sin tilde.** Se le dice "réplica" (con tilde) únicamente a la respuesta de la IA.

## El problema

- Mucha gente no tiene un espacio para ordenar lo que siente en el día a día. Un diario tradicional no responde.
- Ir al psicólogo tiene barreras: costo, no saber a quién acudir, estigma.
- Entre una sesión y otra, el psicólogo no sabe cómo estuvo su paciente.

## La propuesta

- **Para el usuario:** un hábito diario de escritura que no se queda en el vacío, porque cada nota recibe una respuesta que ayuda a pensar.
- **Para el psicólogo:** un canal con sus pacientes y, con consentimiento, acceso a lo que escribieron entre sesiones.

## Principios (no negociables)

- **La IA acompaña, no reemplaza.** La réplica no diagnostica ni da indicaciones clínicas.
- **Privacidad primero.** El diario es privado por defecto. Solo lo lee un psicólogo si el usuario lo autoriza, y puede retirar el permiso cuando quiera.
- **Solo métricas reales.** Racha, notas, ánimo que elige el usuario. Nada de puntajes de "salud mental" inventados.
- **Calma.** Diseño sereno, sin trucos agresivos de retención ni gamificación.
- **Honestidad de marca.** No prometer nada que no exista (cifrado, funciones).

## Contexto

- **Web** (React + Tailwind, con Supabase y Gemini), hecha por un solo desarrollador. La app móvil que le dio origen se descontinuó el 31 de octubre de 2026.
- Pensado desde **Venezuela**: conexión inestable, mayoría de usuarios en Android/navegadores móviles, pagos locales limitados. La web debe degradar con gracia ante conexión lenta o intermitente (ver notas de soporte offline en `02-estructura.md`).
- Mercado todavía **no validado**: la primera versión sirve para medir si la gente vuelve a escribir y si los psicólogos la usan — la web debe priorizar llegar rápido a una versión usable sobre pulir funciones fuera de alcance.

## Lo que quiere ser

Si la primera versión valida el hábito del diario y la conexión con psicólogos, la visión a futuro incluye videollamadas propias, pagos de sesiones, planes para psicólogos, y llegar a los venezolanos en el exterior.
