# Replica (Web) — Contexto para el Agente

> Lectura obligatoria antes de proponer o implementar cualquier pantalla. Este proyecto comparte producto, marca y base de datos con una app móvil desarrollada por otro equipo — no se diseña ni se nombra nada de forma aislada.

## 0. Estado actual del proyecto (léelo primero)

Existe una versión anterior de Login/Registro construida con un sistema de diseño llamado "Santuario Emocional" (lavanda/verde salvia, Material Design 3, autenticación con contraseña) que **queda descartada por completo**. No la uses como referencia, no la adaptes, no reutilices su copy ni sus componentes. El producto real usa la identidad "Telar" y un flujo de autenticación sin contraseña — ambos descritos en los documentos de la sección 1.

## 1. Fuente de verdad — leer en este orden antes de cualquier plan

1. `docs/01-resumen.md` — qué es Replica, el problema, la propuesta, los principios.
2. `docs/DESIGN.md` — sistema de diseño completo: colores, tipografía, movimiento, voz y textos, pantallas. **No inventes ni un color ni una palabra que no esté aquí.**
3. `docs/02-estructura.md` — stack técnico web y sus equivalentes a las decisiones nativas de la app.
4. `docs/03-base-de-datos.md` — esquema de Supabase compartido. La web no diseña su propio esquema.
5. `docs/04-plan.md` — plan de trabajo por fases, con lo ya hecho marcado.

Si algo que te pida el usuario contradice alguno de estos documentos, señálalo explícitamente antes de implementar — no asumas que la instrucción más reciente invalida la documentación sin que se confirme.

## 2. Identidad y vocabulario — regla inquebrantable

- **Nombre del producto: "Replica", sin tilde.** Solo la respuesta de la IA se escribe "réplica" (con tilde).
- Vocabulario obligatorio (no usar sinónimos genéricos): **réplica**, **réplica del día**, **última réplica**, **notas de tu día**, **cofre / Mi cofre**, **destilado por Replica**, **tela**, **hoja**, **nota privada**.
- Tono: español neutro, trato de tú, cálido y sin culpa. Nunca clínico, nunca gamificado, nunca con rojo para pedirle algo al usuario (el rojo es solo para destruir o para errores reales).
- El copy final de cada pantalla sale de archivos de contenido propios del proyecto (`data/*Content.ts`), nunca de un mockup de diseño — los mockups son solo layout.

## 3. Sistema de diseño — resumen operativo (el detalle completo vive en `DESIGN.md`)

- Dirección visual: **Telar**. Voz del usuario = `voice` (salvia/menta). Réplica de la IA = `reply` (malva). **Nunca se mezclan.**
- Tipografía: Alegreya (títulos y réplica), Alegreya Sans (lo que escribe el usuario), fuente de sistema (interfaz).
- Tokens de color, claro y oscuro, ya en variables CSS listas para copiar — sección 3.3 de `DESIGN.md`.
- 7 ánimos con tinte propio, siempre acompañados de su nombre escrito (nunca solo color).
- Movimiento: entradas suben 10px y aparecen, nunca deslizan de lado entre secciones hermanas, respeta `prefers-reduced-motion`.

## 4. Estrategia responsive — mobile-first, 3 breakpoints

| Breakpoint | Rango | Comportamiento |
|---|---|---|
| Base (sin prefijo) | < 768px | Una columna, navegación en barra inferior, contenido condensado |
| `md:` | 768–1023px | Contenedor centrado y acotado |
| `lg:` | ≥1024px | Layout completo, navegación lateral/superior |

Reglas de ergonomía táctil: áreas interactivas ≥44x44px, inputs con `text-base` (16px) para evitar auto-zoom en iOS. Verificar breakpoints con anchos exactos en DevTools (375, 767, 768, 1023, 1024) — nunca con presets de dispositivo con nombre, que pueden no coincidir con el ancho real (ej. iPad Mini mide 744px, no 768px).

## 5. Accesibilidad — no negociable

- `<label htmlFor>` asociado a cada input.
- Errores con `role="alert"`, `aria-invalid`, `aria-describedby`.
- Elementos decorativos con `aria-hidden="true"`.
- Campos condicionales ocultos: `aria-hidden` + `disabled` + `pointer-events-none` para no capturar foco de teclado.
- Contraste WCAG AA verificado con herramienta (Lighthouse/DevTools), nunca calculado de memoria sin confirmar.
- Grupos tipo toggle: `role="tablist"`/`role="tab"`/`aria-selected`, label del grupo vinculado con `aria-labelledby`.

## 6. Arquitectura de componentes

```
frontend/src/
├── pages/
├── components/[pantalla]/
├── components/common/
├── features/            journal, notes, care, profile
├── hooks/
├── data/                contenido estático — fuente de verdad del copy
└── theme/               debe coincidir 1:1 con DESIGN.md
```

Reutilizar componentes existentes con props opcionales antes de crear uno paralelo.

## 7. Proceso de trabajo obligatorio para cada pantalla nueva

1. Generar mockup de layout (Stitch u otra herramienta) pidiendo explícitamente las 3 composiciones responsive por separado, con visuales reales.
2. Verificar que el copy del mockup respeta el vocabulario de la sección 2 — si no, corregirlo en el mockup antes de pasar a plan.
3. Activar **Planning Mode** explícitamente y recordarlo en el propio prompt.
4. Presentar el plan: componentes reutilizados vs. nuevos, manejo de estado, accesibilidad, routing, qué tabla de `03-base-de-datos.md` consume (aunque sea con datos simulados por ahora).
5. Esperar aprobación explícita antes de implementar.
6. Tras implementar, autoauditar el propio trabajo contra el plan aprobado.
7. El usuario verifica manualmente antes de commit: `tsc --noEmit` y `npm run build` con salida completa, prueba visual en anchos exactos, prueba de teclado en campos condicionales.
8. Commit con mensaje descriptivo solo después de la verificación manual.

## 8. Configuración del entorno

- Modelo por defecto: Gemini 3.8 Flash, thinking `medium`. Usar `high` solo para planes, arquitectura de datos, o lógica sensible (protocolo de riesgo en la réplica de IA).
- Modo de ejecución supervisado o Turbo con AntiAgent activo — nunca compartir credenciales reales en prompts, siempre variables de entorno.
- MCP conectados: Supabase (`--read-only` mientras no haya backend real conectado), herramienta de diseño a layout.

## 9. Lo que NO se construye en v1

Chat con la IA (la réplica no conversa, responde a cada nota), pantalla de ayuda en crisis dedicada, exportar notas, planes/pagos, videollamadas propias.

## 10. Pantallas — estado

- [ ] Bienvenida / Autenticación con contraseña (reemplaza el Login/Registro descartado)
- [ ] Inicio (escribir)
- [ ] Notas / Tu día
- [ ] Evolución
- [ ] Chat
- [ ] Usuario
