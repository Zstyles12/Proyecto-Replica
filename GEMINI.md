# GEMINI.md — Replica (web)

> **Archivo secundario.** Las instrucciones del proyecto están en [`AGENTS.md`](AGENTS.md): léelo primero y síguelo. Aquí solo va lo específico de Gemini y Antigravity. Para no tener reglas repetidas que se contradigan, **no copies aquí nada de `AGENTS.md`**: si una regla vale para cualquier agente, va allá.

## Configuración del agente

- Modelo por defecto: Gemini 3.8 Flash con razonamiento `medium`. Usa `high` solo para planes, arquitectura de datos o lógica sensible (por ejemplo, el protocolo de riesgo de la réplica).
- Modo supervisado, o Turbo con AntiAgent activo (`.antiagent.json`).
- MCP conectados: Supabase (`--read-only` mientras no haya backend real) y la herramienta de mockups (Stitch).

## Planes

- Activa **Planning Mode** de forma explícita para cada pantalla o cambio grande, y recuérdalo en el propio pedido.
- Presenta el plan como dice `AGENTS.md` (Forma de trabajo) y espera aprobación antes de implementar.

## Mockups con Stitch

Solo cuando una pantalla necesita una composición de escritorio que todavía no está en `docs/DESIGN-WEB.md`:

1. Pide las tres composiciones (móvil, tablet y escritorio) por separado, con contenido real.
2. Toma del mockup **solo el layout**. Los textos salen de la app y de `frontend/src/data/*Content.ts`, nunca del mockup.
3. Si el mockup agrega piezas que la app no tiene, se descartan.
4. Lo que se decida para escritorio se anota en `docs/DESIGN-WEB.md`.

Los proyectos de Stitch con la identidad anterior ("Santuario Emocional": lavanda y verde salvia, Material Design 3) quedan descartados: no se usan como referencia.
