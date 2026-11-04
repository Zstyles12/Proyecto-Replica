# AGENTS.md — Replica (web)

Instrucciones para cualquier agente que trabaje en este repositorio. Léelas antes de proponer o tocar nada.

## Qué es

Replica es un diario personal donde la IA responde con una **réplica**, más un canal con psicólogos verificados. Es una **web** pensada para que sea agradable en un navegador, tanto en el teléfono como en la computadora, y se entrega completa el **jueves 5 de noviembre de 2026**.

La app móvil se descontinuó el 31 de octubre de 2026. La web es dueña de sus reglas, su diseño, sus datos y su backend: los decide y los edita aquí.

## Fuentes de verdad, en este orden

1. `docs/DESIGN.md`: sistema de diseño completo (colores, tipografía, movimiento, voz, piezas, pantallas y reglas de producto).
2. `docs/DESIGN-WEB.md`: el diseño de las interfaces de la web (pantallas, navegación, anchos, marca en el navegador). Donde contradice a `DESIGN.md` en interfaz, manda este; en producto, voz, colores y marca, manda `DESIGN.md`.
3. `docs/PRODUCT.md`: contexto de producto.
4. `docs/02-estructura.md`: stack de la web, rutas, registro y estructura de carpetas.
5. `docs/03-base-de-datos.md`: esquema de Supabase, reglas de acceso y funciones de servidor.
6. `docs/04-plan.md`: plan de trabajo y estado real de cada fase.
7. `docs/01-resumen.md`: qué es Replica y sus principios.

**El alcance** lo fija la especificación de la Evaluación 3: 11 módulos, 61 requisitos funcionales y 15 no funcionales, en `entrega-evaluacion-3/fuentes/datos.mjs`. Si otro documento dice que algo queda fuera, manda la especificación. En el área profesional, `DESIGN-WEB.md` §10 es más nuevo y manda sobre ella. Las reglas de seguridad salen del plan de `entrega-evaluacion-4/plan-seguridad/`.

Si un pedido contradice estos documentos, dilo antes de implementar.

## La app antigua

Quedó en `../replica mobile/zairo/zairo` y no manda en nada. Se puede leer si ayuda a ver cómo se resolvió algo, sin modificar nada en ella, ni siquiera su `.git` (para usar git allí, antepón `GIT_OPTIONAL_LOCKS=0`). Donde los documentos todavía digan "igual que la app", describen el comportamiento vigente.

## Comandos

En `frontend/`:

```bash
npm install                              # dependencias
npm run dev                              # servidor de desarrollo (Vite)
npx tsc -p tsconfig.app.json --noEmit    # tipos
npm run lint                             # oxlint
npm run build                            # tipos + build de producción
```

En la raíz del repositorio, para el backend (no hay Docker: se trabaja contra el proyecto remoto):

```bash
npx supabase db push                     # aplica las migraciones de supabase/migrations
npx supabase functions deploy            # publica las funciones de servidor
```

## Reglas de producto que nunca se rompen

- **Nombre:** "Replica", sin tilde. Solo la respuesta de la IA es "réplica".
- **Una réplica al momento por día:** solo la primera nota no privada del día la recibe ("Replica"); las demás se guardan ("Guardar") y las lee la réplica del día, que deja un comentario a cada una. A medianoche, una última réplica si se escribió después. La única excepción es la cuenta de demostración (el administrador), descrita en `DESIGN.md`.
- **Notas privadas:** no las lee la IA ni el psicólogo, nunca.
- **Ánimo y tema son necesarios** para guardar; si faltan, Replica los pregunta con su voz, nunca como error.
- **Solo métricas reales**, calculadas de lo que la persona escribió o eligió. Nada de valores fijos ni inventados.
- **Sin contadores que pidan atención:** ningún número como insignia ("Favoritas · 5"). Los números solo donde son el dato.
- **Honestidad:** una función aparece en la interfaz cuando funciona de verdad; si no llega al jueves, se oculta. Un interruptor que no hace nada es una promesa falsa. El bloqueo protege el acceso desde ese navegador y nunca se presenta como cifrado.
- **Compartir el diario** es explícito y revocable, y siempre explica qué significa antes de activarse.
- **Ayuda en crisis:** cada línea de atención publicada tiene una fuente oficial comprobada. Nunca se inventa ni se deduce un número.
- **La IA no diagnostica ni da indicaciones clínicas.** Si una nota o un mensaje muestra riesgo, no da consejos, responde con calidez, sugiere ayuda profesional y enlaza a la ayuda en crisis.
- **Fuera del proyecto:** pagos, planes y videollamadas propias.

## Voz y textos

- Español neutro, trato de tú, frases cortas, sin culpa ni presión. Nunca clínico ni gamificado.
- Usa el vocabulario de `DESIGN.md` §9 (réplica, réplica del día, última réplica, notas de tu día, cofre, destilado por Replica, tela, hoja, nota privada).
- Los textos nuevos llevan la misma voz que los que ya existen; búscalos antes de escribir uno parecido.
- Los textos van junto a la pantalla o la pieza que los usa. Los que comparten varias pantallas o son contenido largo van en `frontend/src/data/` (textos legales, bienvenida, navegación).
- Nunca se muestra al usuario texto técnico (nombres de archivos, versiones, valores como "0.55", nombres de modelos).
- Sin emojis en la interfaz: los íconos son de Lucide o los dibujos propios de la marca.
- Errores y avisos nunca en rojo: los avisos amables van en la voz de Replica (malva, itálica) y los fallos reales en `emotion`. `destructive` es solo para borrar algo y, en el área profesional, para las acciones irreversibles (rechazar una verificación, dejar de atender a un paciente).
- El malva (`reply`) es exclusivo de lo que dice la IA.

## Convenciones de código

- TypeScript estricto, sin `any`. Componentes de React con funciones y hooks.
- Colores **solo** con los tokens (`bg-voice`, `border-border/40`, `var(--voice)`); nunca hexadecimales sueltos en los componentes. Si agregas una clase con opacidad sobre un token, comprueba que Tailwind la genera (`DESIGN-WEB.md` §7).
- Duraciones y curvas con los tokens de movimiento (`duration-press`, `ease-out`…). Todo respeta `prefers-reduced-motion`.
- Estado compartido en stores pequeños con `useSyncExternalStore`, no en `useState` duplicados por componente.
- Los días se calculan en **hora local** (`dayKey`), nunca con `toISOString().slice(0, 10)`.
- Las pantallas hablan con `services/`, nunca con Supabase directamente. Cada servicio tiene su versión real y la simulada con el mismo contrato; sin variables de entorno, la web usa la simulada.
- El logo sale de `components/brand/logoGeometry.ts`; nunca se dibuja a mano.
- Ventanas y hojas con la pieza común (portal, `Escape`, foco atrapado): nunca `window.confirm` ni `alert`.
- Reutiliza componentes existentes con props opcionales antes de crear uno paralelo.

## Accesibilidad

- Cada campo con su `<label htmlFor>`; errores con `role="alert"`, `aria-invalid` y `aria-describedby`.
- Todos los botones de solo ícono con `aria-label`. Lo decorativo con `aria-hidden="true"`.
- Foco visible con teclado (anillo `voice`). Lo plegado o escondido no recibe foco (`inert`).
- Áreas táctiles de al menos 44 px; campos de texto con 16 px para evitar el zoom en iOS.
- Contraste comprobado con herramienta (Lighthouse o DevTools), en claro y en oscuro.

## Antes de dar algo por terminado

1. `npx tsc -p tsconfig.app.json --noEmit`, `npm run lint` y `npm run build` sin errores.
2. Revisión visual en anchos exactos: 375, 767, 768, 1023, 1024 y 1440, en claro y en oscuro.
3. Recorrido con teclado de lo que cambió.
4. Comparación con el requisito de la especificación y con `DESIGN-WEB.md`: mismas reglas de producto y misma voz.

## Forma de trabajo

**Hasta la entrega del jueves:** las fases de `docs/04-plan.md` están aprobadas. Se avanza de una a la siguiente con un plan corto, y se para a preguntar solo ante una decisión de producto nueva, algo que salga de lo documentado o un paso que solo pueda hacer la persona responsable.

1. Implementar en pasos chicos y verificables.
2. Toda interfaz nueva se anota en `DESIGN-WEB.md` antes de construirla.
3. Revisar el propio trabajo contra el plan y los requisitos.
4. La persona responsable verifica a mano antes de cada commit. Los commits van en español y dicen qué cambió y por qué.
5. Al terminar una fase, marcarla en `docs/04-plan.md`.

## Seguridad

- Nunca credenciales reales en el código ni en los prompts: siempre variables de entorno. Las claves las pone la persona responsable en `frontend/.env.local` y en los secretos de Supabase; nunca pasan por el chat.
- La web nunca llama a Gemini directamente: las réplicas y el chat con la IA salen de las Edge Functions.
- `service_role` solo en el servidor. Los roles van en `app_metadata`, nunca en `user_metadata`.
- RLS en el 100 % de las tablas. Lo que la persona no autorizó se filtra en el servidor, no en la pantalla.
- El proyecto es universitario: Supabase en plan gratuito y solo datos de prueba, nunca de personas reales.
