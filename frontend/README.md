# Replica — web

Replica: un diario donde la IA responde con una réplica, y un canal con psicólogos verificados, pensado para el navegador en el teléfono y en la computadora.

Antes de tocar nada, lee [`../AGENTS.md`](../AGENTS.md) y la documentación de [`../docs`](../docs).

## Desarrollo

```bash
npm install
npm run dev                              # servidor de desarrollo
npx tsc -p tsconfig.app.json --noEmit    # tipos
npm run lint                             # oxlint
npm run build                            # build de producción
```

Sin variables de entorno, todo funciona simulado:

- **Cuenta:** cualquier contraseña de 8 caracteres o más entra; `equivocada` simula una incorrecta. Cualquier código de 6 dígitos entra; `000000` simula uno equivocado.
- **Datos:** se guardan en el `localStorage` del navegador. Para empezar de cero, bórralo o usa "Repetir el registro" en Usuario (solo en desarrollo).
- `/playground` muestra las piezas base (solo en desarrollo).

Para probar en un teléfono de la misma red Wi-Fi: `npm run dev -- --host` y abre la dirección "Network" que aparece.

## Variables de entorno

Para usar Supabase, sigue [`../supabase/README.md`](../supabase/README.md): copia [`.env.example`](.env.example) como `.env.local` y llénalo; `.env.local` nunca se sube (lo ignora el `.gitignore` de la raíz, el único del proyecto). Las claves reales nunca van en el código ni en los prompts.

## Estructura

```
src/
  pages/        una pantalla por ruta (auth/ para el registro)
  components/   piezas base (ui/), movimiento (motion/), layout/, marca (brand/), recorridos (tour/)
  features/     auth, journal (Inicio), notes, care (Chat), cofre, profile, evolution
  lib/          sesión, fechas, sonidos, recorridos, almacenamiento
  services/     servicios con versión real y simulada (auth, ai) y el acceso a los datos en Supabase (data)
  data/         textos compartidos (bienvenida, navegación, legales)
```
