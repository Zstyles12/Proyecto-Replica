# AGENTS.md — Replica (web)

Instrucciones para cualquier agente que trabaje en este repositorio. Léelas antes de proponer o tocar nada.

## Qué es

Replica es un diario personal donde la IA responde con una **réplica**, más un canal con psicólogos verificados. Hay una **app móvil** (terminada en diseño y funcionamiento) y esta **web**. Es un solo producto, pero la web tiene sus propias interfaces, pensadas para que sea agradable en un navegador, tanto en el teléfono como en la computadora.

**Qué se comparte y qué decide la web:**

- **Se comparte con la app** (mandan sus documentos): las reglas de producto, la voz y el vocabulario, los colores, la tipografía, la marca (`docs/marca` de la app), los sonidos y el esquema de datos.
- **Decide la web** (manda `docs/DESIGN-WEB.md`): cómo se organiza cada pantalla, la navegación, la composición de las piezas, las interacciones con ratón y teclado, el comportamiento en cada ancho y cómo se aplica la marca en el navegador.
- **Primero se mira la app.** Si su solución sirve en el navegador, se adapta. Si la web necesita otro camino para verse o usarse mejor, se diseña uno propio, se anota en `DESIGN-WEB.md` y se aprueba antes de implementar. Lo mismo con los textos: se copian de la app cuando sirven, y se escriben nuevos (con la voz de Replica) cuando la interfaz web lo necesita.

## Fuentes de verdad, en este orden

1. `docs/DESIGN.md`: sistema de diseño completo (colores, tipografía, movimiento, voz, piezas, pantallas y reglas de producto). **Copia exacta** del de la app: no se edita aquí; si la app lo cambia, se vuelve a copiar.
2. `docs/DESIGN-WEB.md`: el diseño de las interfaces de la web (pantallas, navegación, anchos, marca en el navegador). Donde contradice a `DESIGN.md` en interfaz, manda este; en producto, voz, colores y marca, manda `DESIGN.md`.
3. `docs/PRODUCT.md`: contexto de producto (copia exacta del de la app).
4. `docs/02-estructura.md`: stack de la web, rutas, registro y estructura de carpetas.
5. `docs/03-base-de-datos.md`: esquema compartido de Supabase. La web no define su propio esquema.
6. `docs/04-plan.md`: plan de trabajo y estado real de cada fase.
7. `docs/01-resumen.md`: qué es Replica y sus principios.

Si un pedido contradice estos documentos, dilo antes de implementar.

## La app de referencia

- Vive en `../replica mobile/zairo` (repo `github.com/ManuelGoncalvesR/zairo`).
- **Solo se lee para comparar. Nunca se modifica nada en ella, ni siquiera su `.git`.**
- Ante una duda de producto, de voz o de marca, manda la app. En interfaz, es el punto de partida, no una obligación. Dónde mirar:
  - Pantallas: `app/` (por ejemplo `app/(tabs)/index.tsx` es Inicio).
  - Lógica: `lib/session.ts` (etapas del registro), `features/journal/store.ts` y `features/journal/day-replies.ts` (notas y réplicas), `features/care/store.ts` (chat), `features/cofre/` (frases), `features/profile/` (perfil, métricas y ajustes), `lib/tutorials.ts` (recorridos).
  - Servicios simulados: `services/auth/`, `services/ai/`.
  - Marca: `docs/marca` (manual, kit con logos, íconos, animaciones y sonidos) y `components/brand/logo-geometry.ts` (la geometría, generada por el kit). La web copia lo que usa con `npm run marca` (ver `frontend/scripts/marca.mjs`); nunca dibuja el logo a mano.
  - Es TypeScript; la lógica que no depende de React Native se puede traducir casi tal cual.

## Comandos

Todo se corre dentro de `frontend/`:

```bash
npm install                              # dependencias
npm run dev                              # servidor de desarrollo (Vite)
npx tsc -p tsconfig.app.json --noEmit    # tipos
npm run lint                             # oxlint
npm run build                            # tipos + build de producción
```

## Reglas de producto que nunca se rompen

- **Nombre:** "Replica", sin tilde. Solo la respuesta de la IA es "réplica".
- **Una réplica al momento por día:** solo la primera nota no privada del día la recibe ("Replica"); las demás se guardan ("Guardar") y las lee la réplica del día, que deja un comentario a cada una. A medianoche, una última réplica si se escribió después.
- **Notas privadas:** no las lee la IA ni el psicólogo, nunca.
- **Ánimo y tema son necesarios** para guardar; si faltan, Replica los pregunta con su voz, nunca como error.
- **Solo métricas reales**, calculadas de lo que la persona escribió o eligió. Nada de valores fijos ni inventados.
- **Sin contadores que pidan atención:** ningún número como insignia ("Favoritas · 5"). Los números solo donde son el dato.
- **Honestidad:** no prometer lo que no existe (cifrado, bloqueo, notificaciones, exportar). Un interruptor que no hace nada es una promesa falsa.
- **Compartir el diario** es explícito y revocable, y siempre explica qué significa antes de activarse.
- **Fuera de la v1 web:** chat con la IA, pantalla de crisis, exportar notas, pagos, planes, videollamadas propias, bloqueo del diario y compartir una nota suelta en el chat.

## Voz y textos

- Español neutro, trato de tú, frases cortas, sin culpa ni presión. Nunca clínico ni gamificado.
- Usa el vocabulario de `DESIGN.md` §9 (réplica, réplica del día, última réplica, notas de tu día, cofre, destilado por Replica, tela, hoja, nota privada).
- **Copia los textos de la app** cuando sirven para la pantalla web. Escribe textos nuevos solo cuando la interfaz web es distinta y lo necesita, con la misma voz.
- Los textos van donde los tiene la app: junto a la pantalla o la pieza que los usa (así se comparan línea por línea con la app). Los que comparten varias pantallas o son contenido largo van en `frontend/src/data/` (textos legales, bienvenida, navegación).
- Nunca se muestra al usuario texto técnico (nombres de archivos, versiones, valores como "0.55", nombres de modelos).
- Sin emojis en la interfaz: los íconos son de Lucide o los dibujos propios de la marca.
- Errores y avisos nunca en rojo: los avisos amables van en la voz de Replica (malva, itálica) y los fallos reales en `emotion`. `destructive` es solo para borrar algo.
- El malva (`reply`) es exclusivo de lo que dice la IA.

## Convenciones de código

- TypeScript estricto, sin `any`. Componentes de React con funciones y hooks.
- Colores **solo** con los tokens (`bg-voice`, `border-border/40`, `var(--voice)`); nunca hexadecimales sueltos en los componentes. Si agregas una clase con opacidad sobre un token, comprueba que Tailwind la genera (`DESIGN-WEB.md` §7).
- Duraciones y curvas con los tokens de movimiento (`duration-press`, `ease-out`…). Todo respeta `prefers-reduced-motion`.
- Estado compartido en stores pequeños con `useSyncExternalStore` (como la app), no en `useState` duplicados por componente.
- Los días se calculan en **hora local** (`dayKey`), nunca con `toISOString().slice(0, 10)`.
- Los servicios simulados (`services/`) tienen el mismo contrato que tendrán con Supabase.
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
4. Comparación con la misma pantalla de la app: mismas reglas de producto y misma voz. Si la interfaz es distinta, que la diferencia esté anotada en `DESIGN-WEB.md`.

## Forma de trabajo

1. Para cada pantalla o cambio grande: primero un plan (qué se reutiliza, qué es nuevo, estado, rutas, accesibilidad, qué tabla de `03-base-de-datos.md` representa) y **esperar aprobación** antes de implementar.
2. Implementar en pasos chicos y verificables.
3. Revisar el propio trabajo contra el plan aprobado.
4. La persona responsable verifica a mano antes de cada commit. Los commits van en español y dicen qué cambió y por qué.
5. Al terminar una fase, marcarla en `docs/04-plan.md`.

## Seguridad

- Nunca credenciales reales en el código ni en los prompts: siempre variables de entorno.
- La web nunca llama a Gemini directamente: las réplicas salen de las Edge Functions compartidas.
- El MCP de Supabase, en solo lectura mientras no haya backend real.
