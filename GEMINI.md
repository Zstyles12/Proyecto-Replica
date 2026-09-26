# Réplica — Contexto del Proyecto para el Agente

> Este documento es de lectura obligatoria antes de implementar cualquier pantalla nueva.
> Contiene decisiones ya tomadas y aprobadas — no las cuestiones ni las regeneres, constrúyelas sobre esta base.

## 1. Identidad del proyecto

Réplica es una plataforma de acompañamiento en salud mental: diario reflexivo con IA + conexión con psicólogos verificados. El tono de TODA la interfaz debe sentirse **cálido, seguro, sin juicios clínicos** — nunca frío, burocrático o técnico.

### Glosario de marca (usar SIEMPRE esta terminología, no sinónimos genéricos)

| Concepto genérico | Término de marca de Réplica |
|---|---|
| Iniciar sesión / Login | "Entrar a mi espacio" |
| Crear cuenta / Registro | "Crear mi espacio seguro" |
| Contraseña | "Tu clave de calma" |
| Correo electrónico (label) | "¿Cómo te encontramos?" |
| Usuario / rol paciente | "Busco mi espacio" |
| Psicólogo / rol profesional | "Acompaño procesos" |
| App / plataforma | "Santuario", "espacio", "refugio emocional" |

**Nunca uses**: "Salud Emocional" (usar "Santuario Emocional"), badges de versión visibles al usuario (ej. "v2.4"), lenguaje clínico o de evaluación.

## 2. Fuente de verdad del copy — REGLA INQUEBRANTABLE

**Stitch se usa ÚNICAMENTE para layout, espaciado y jerarquía visual. NUNCA para el texto final.**

Motivo: en iteraciones repetidas, Stitch regeneró el copy con variaciones no solicitadas (ej. "Contraseña segura" en vez de "Tu clave de calma", "Salud Emocional" en vez de "Santuario Emocional", un badge de versión inventado). Cada pantalla nueva debe:

1. Tomar el LAYOUT del mockup de Stitch más reciente.
2. Tomar el TEXTO exclusivamente de los archivos de contenido del proyecto (`loginContent.ts`, `registroContent.ts`, y sus equivalentes futuros como `diarioContent.ts`).
3. Si Stitch introduce un elemento visual nuevo (badge, ícono, sección) que no estaba en el plan aprobado, señalarlo explícitamente al usuario antes de implementarlo — no asumir que es intencional.

## 3. Sistema de diseño (tokens ya definidos en `tailwind.config.js`)

- Paleta basada en Material Design 3: `primary`, `secondary`, `tertiary` con variantes `-container`, `on-`, `-fixed`, `-fixed-dim`.
- Tipografía: Plus Jakarta Sans en toda la app.
- Border radius: `DEFAULT` 16px, `lg` 32px, `xl` 48px.
- **No inventar colores nuevos.** Si algo necesita más contraste, usar una variante más oscura/saturada del mismo token semántico ya existente, nunca un hex arbitrario.

## 4. Estrategia responsive — Mobile-First con 3 breakpoints

| Breakpoint | Rango | Comportamiento |
|---|---|---|
| Base (sin prefijo) | < 768px (mobile) | Columna única. Panel de santuario CONDENSADO (badge + título corto + sellos compactos en una línea), sin widget de respiración (`hidden lg:flex`). Formulario protagonista. |
| `md:` | 768px – 1023px (tablet) | Contenedor centrado y acotado (`max-w-xl mx-auto`), márgenes relajados. |
| `lg:` | ≥ 1024px (desktop) | Layout de 2 columnas: SanctuaryPanel fijo (`lg:sticky lg:top-0 lg:h-screen`, 5 cols) + formulario con scroll interno propio (`lg:overflow-y-auto`, 7 cols), widget de respiración completo visible. |

**Reglas de ergonomía táctil (aplican a TODA pantalla nueva):**
- Áreas táctiles mínimo 44x44px en botones, toggles, íconos interactivos.
- Inputs con `text-base` (16px) para evitar el auto-zoom de iOS Safari.
- Verificar SIEMPRE con anchos exactos en DevTools (375, 767, 768, 1023, 1024px) — **nunca confiar en presets de dispositivo con nombre** (ej. "iPad Mini" en Chrome DevTools mide 744px de ancho lógico, no 768px, y puede dar una falsa sensación de haber probado el breakpoint `md:` sin haberlo hecho realmente).

## 5. Accesibilidad — no negociable dado el rubro de salud mental

- Todo input con `<label htmlFor>` asociado correctamente a su `id`.
- Errores de validación con `role="alert"`, `aria-invalid="true"`, `aria-describedby`.
- Elementos decorativos (íconos, checks) con `aria-hidden="true"`.
- Campos condicionales ocultos: además de ocultar visualmente, usar `aria-hidden` + `disabled` + `pointer-events-none` para que no capturen foco de teclado.
- Contraste mínimo WCAG AA (4.5:1) verificado, no solo calculado de memoria — usar Lighthouse/DevTools Accessibility cuando haya dudas.
- Grupos de opciones tipo toggle: `role="tablist"` / `role="tab"` / `aria-selected`, con label del grupo vinculado vía `aria-labelledby` (nunca un `<label>` huérfano sin `htmlFor`).

## 6. Arquitectura de componentes (patrón a seguir en cada pantalla nueva)

```
frontend/src/
├── pages/                    # Un archivo por pantalla
├── components/[pantalla]/    # Componentes específicos de esa pantalla
├── components/common/        # Reutilizables entre pantallas (íconos, etc.)
├── hooks/                    # Lógica de estado extraída, un hook por responsabilidad
├── data/                     # Contenido estático — FUENTE DE VERDAD del copy
└── index.css
```

**Reutilización real, no duplicación**: si un componente de una pantalla anterior (ej. `SanctuaryPanel`, `RoleToggle`, `LoginHeader`) sirve para la pantalla nueva, extenderlo con props opcionales — nunca crear una copia paralela ("RegistroSanctuaryPanel", etc.).

## 7. Proceso de trabajo obligatorio para cada pantalla nueva

1. Generar mockup en Stitch pidiendo explícitamente las 3 composiciones (mobile 375px / tablet 768px / desktop 1440px) por separado, con mockups visuales reales, no solo descripción de texto.
2. Verificar que el copy del mockup coincide con el glosario de marca (sección 1) — si no, pedir corrección en Stitch antes de pasar a plan.
3. Activar **Planning Mode** explícitamente y recordárselo al agente en el propio prompt ("Recuerda: estamos en modo Planning, no implementes hasta mi aprobación").
4. Revisar el plan: componentes reutilizados vs. nuevos, manejo de estado, accesibilidad, routing.
5. Aprobar explícitamente antes de implementar.
6. Tras implementar: pedir auditoría propia del agente contra el plan (qué se hizo distinto, qué falta).
7. Verificación manual del usuario (no solo confiar en el reporte del agente): `tsc --noEmit` y `npm run build` con salida completa sin resumir, prueba visual en anchos exactos, prueba de teclado (Tab) en campos condicionales, prueba de contraste real.
8. Commit con mensaje descriptivo solo después de la verificación manual.

## 8. Configuración del entorno (Antigravity)

- **Modelo por defecto**: Gemini 3.8 Flash, nivel de thinking `medium`.
- **Nivel `high`**: solo para planes de implementación, arquitectura de datos, o lógica sensible (protocolo de detección de riesgo).
- **Modo de ejecución**: Turbo activado con AntiAgent como supervisor de seguridad — aun así, nunca compartir credenciales reales en prompts, usar siempre variables de entorno (`.env`, ya en `.gitignore`).
- **MCP conectados**: Supabase (modo `--read-only` por ahora), Stitch (design-to-code).
- **Skills instaladas**: `stitch-build/react-components`, `stitch-design/design-md`, y el resto del bundle `stitch-skills` de Google Labs.

## 9. Deuda técnica pendiente (no bloqueante, no atender aún)

- Dark mode: no implementado en ninguna pantalla todavía.
- `prefers-reduced-motion`: no configurado para animaciones (`animate-pulse`, transición del campo condicional).
- Fallback offline para Material Symbols (si no carga Google Fonts, se ve texto plano en vez de ícono).

## 10. Pantallas completadas

- [x] Login (`/login`) — responsive, accesible, copy centralizado.
- [x] Registro (`/registro`) — responsive, accesible, copy centralizado, campo condicional de cédula profesional animado.
- [ ] Diario (siguiente)
- [ ] Historial del diario
- [ ] Directorio de psicólogos
- [ ] Perfil de psicólogo
- [ ] Panel del psicólogo
