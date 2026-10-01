# Resumen del proyecto — Web

> Adaptado del resumen original del equipo de app. El producto es UNO SOLO — esta versión solo ajusta la sección de Contexto para reflejar quién construye qué. Todo lo demás (qué es, el problema, la propuesta, los principios) es idéntico entre app y web, porque es el mismo Replica.

## Qué es

Replica es una app de salud mental con dos partes:

1. **Diario con réplica de IA.** La persona escribe o dicta cómo le fue en el día, qué le preocupa o qué siente. Al guardar la nota, la IA (Gemini) responde con una **réplica**: una reflexión breve y cálida con preguntas para seguir escribiendo. No es un chat: la IA responde a cada nota, no conversa.
2. **Conexión con psicólogos.** La persona puede hablar por chat con un psicólogo verificado, coordinar sesiones por Google Meet y, si quiere, compartirle su diario.

**Nombre del producto: "Replica", sin tilde.** Se le dice "réplica" (con tilde) únicamente a la respuesta de la IA — esta distinción aplica igual en la web que en la app; corrige cualquier texto o commit anterior que use "Réplica" con tilde como nombre de marca.

## El problema

- Mucha gente no tiene un espacio para ordenar lo que siente en el día a día. Un diario tradicional no responde.
- Ir al psicólogo tiene barreras: costo, no saber a quién acudir, estigma.
- Entre una sesión y otra, el psicólogo no sabe cómo estuvo su paciente.

## La propuesta

- **Para el usuario:** un hábito diario de escritura que no se queda en el vacío, porque cada nota recibe una respuesta que ayuda a pensar.
- **Para el psicólogo:** un canal con sus pacientes y, con consentimiento, acceso a lo que escribieron entre sesiones.

## Principios (no negociables, iguales en app y web)

- **La IA acompaña, no reemplaza.** La réplica no diagnostica ni da indicaciones clínicas.
- **Privacidad primero.** El diario es privado por defecto. Solo lo lee un psicólogo si el usuario lo autoriza, y puede retirar el permiso cuando quiera.
- **Solo métricas reales.** Racha, notas, ánimo que elige el usuario. Nada de puntajes de "salud mental" inventados.
- **Calma.** Diseño sereno, sin trucos agresivos de retención ni gamificación.
- **Honestidad de marca.** No prometer nada que no exista (cifrado, funciones) — regla que aplica igual de estricto en la web.

## Contexto (adaptado)

- **Equipo:** el proyecto se divide en dos frentes que comparten un solo backend en Supabase:
  - **App móvil** (React Native / Expo) — desarrollada por el equipo de app.
  - **Web** (React + Tailwind) — una adaptación de la app pensada para que también sea agradable en escritorio. Sigue `DESIGN.md` y `PRODUCT.md` (copias exactas de los de la app) y `03-base-de-datos.md` como fuentes de verdad compartidas; lo que cambia a propósito en escritorio está en `DESIGN-WEB.md`. La app de referencia vive en `../replica mobile/zairo` y solo se usa para comparar.
- Cualquier cambio a la base de datos compartida debe coordinarse entre ambos frentes antes de aplicarse (ver sección de coordinación en `03-base-de-datos.md`).
- Pensado desde **Venezuela**: conexión inestable, mayoría de usuarios en Android/navegadores móviles, pagos locales limitados. La web debe degradar con gracia ante conexión lenta o intermitente (ver notas de soporte offline en `02-estructura.md`).
- Mercado todavía **no validado**: la primera versión sirve para medir si la gente vuelve a escribir y si los psicólogos la usan — la web debe priorizar llegar rápido a una versión usable sobre pulir funciones fuera de alcance.

## Lo que quiere ser

Si la primera versión valida el hábito del diario y la conexión con psicólogos, la visión a futuro (compartida entre app y web) incluye videollamadas propias, pagos de sesiones, planes para psicólogos, y llegar a los venezolanos en el exterior.
