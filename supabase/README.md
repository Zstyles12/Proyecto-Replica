# Backend de Replica

Las migraciones, las reglas de acceso y las funciones ya están aquí. Lo que sigue son los pasos que solo puede hacer la persona responsable, porque usan sus cuentas y sus claves. Las claves se escriben en la terminal o en el panel de Supabase, nunca en el chat ni en el código.

Todos los comandos se corren desde la raíz del proyecto.

El proyecto usa el plan gratuito, con solo datos de prueba. Ese plan admite dos proyectos activos, pausa los que pasan una semana sin uso y no trae respaldos: abre el proyecto antes de la defensa.

## 1. Crear el proyecto

1. Crea el proyecto en [supabase.com](https://supabase.com), en **São Paulo (`sa-east-1`)**.
2. Inicia sesión y enlaza el proyecto. La referencia es la parte `xxxx` de `https://xxxx.supabase.co`.

```bash
npx supabase login
```

```bash
npx supabase link --project-ref xxxx
```

## 2. Subir la base de datos y las funciones

```bash
npx supabase db push
```

```bash
npx supabase functions deploy
```

Si `db push` se queda en "Initialising login role", la red no deja pasar el puerto 5432 de la base de datos. Pega las migraciones en **SQL Editor** del panel, en orden, y registra cada una para que un `db push` futuro no la repita:

```sql
insert into supabase_migrations.schema_migrations (version, name)
values ('20261031000001', 'esquema');
```

La tabla `supabase_migrations.schema_migrations` la crea el primer `db push`. Si no existe, créala antes con las columnas `version text primary key`, `statements text[]` y `name text`.

## 3. Guardar los secretos

Inventa una frase larga para `CRON_SECRET`: es la que autoriza la llamada programada de la réplica del día. La clave de Gemini se crea en Google AI Studio.

```bash
npx supabase secrets set GEMINI_API_KEY=tu_clave CRON_SECRET=tu_frase_larga
```

Después, en el panel de Supabase, abre **SQL Editor** y corre esto con tus valores. El `cron_secret` es el mismo de arriba:

```sql
select vault.create_secret('https://xxxx.supabase.co', 'project_url');
select vault.create_secret('tu_frase_larga', 'cron_secret');
```

El recordatorio diario (Web Push) necesita un par de claves VAPID. Créalas una vez:

```bash
npx web-push generate-vapid-keys
```

La pública y la privada van en los secretos de las funciones, con un contacto (`mailto:` con tu correo); la pública también va en `frontend/.env.local` como `VITE_VAPID_PUBLIC_KEY`. Sin ella, la web no muestra el recordatorio.

```bash
npx supabase secrets set VAPID_PUBLIC_KEY=la_publica VAPID_PRIVATE_KEY=la_privada VAPID_SUBJECT=mailto:tu_correo
```

El modelo es `gemini-3.5-flash-lite`: responde en unos segundos, y `gemini-3.8-flash` pasó de los 30 s de límite. Para cambiarlo sin desplegar de nuevo: `npx supabase secrets set GEMINI_MODEL=otro_modelo`.

## 4. Configurar las cuentas

En **Authentication** del panel de Supabase:

- **Sign In / Providers → Email:** deja activo "Confirm email", con el código de **6 dígitos** ("Email OTP Length") y la contraseña de al menos **8 caracteres**.
- **Emails → SMTP:** conecta un servicio propio. **Es obligatorio y va primero:** en un proyecto gratuito, sin SMTP propio las plantillas no se pueden editar, y sin editarlas el correo trae un enlace en vez del código. Hay dos caminos:
  - **Gmail**, si no tienes dominio: usa una cuenta dedicada, activa la verificación en dos pasos y crea una contraseña de aplicación. Host `smtp.gmail.com`, puerto `587`, usuario y remitente tu correo de Gmail, contraseña la de aplicación. Son unos 500 correos al día.
  - **Resend**, si tienes un dominio y lo verificas: 100 correos al día gratis. Sin dominio verificado solo envía a tu propia dirección.
- **Emails → Templates:** en "Confirm signup" y "Reset password", cambia el enlace por el código, en español:

```html
<p>Tu código de Replica es <strong>{{ .Token }}</strong>.</p>
<p>Si no lo pediste, ignora este correo.</p>
```

- **URL Configuration:** pon la dirección de la web en "Site URL" y agrega `http://localhost:5173` en "Redirect URLs" para desarrollo.
- **Sign In / Providers → Google:** crea el cliente OAuth en Google Cloud y pega su id y su secreto. La dirección de retorno la muestra el mismo panel.

## 5. Conectar la web

Copia `frontend/.env.example` como `frontend/.env.local` y llénalo con la dirección del proyecto y su clave pública (Settings → API). Con eso, `npm run dev` ya usa el backend real. Sin ese archivo, la web sigue simulada.

## 6. Crear las cuentas de prueba y comprobar los accesos

Crea `supabase/.env` (no se sube) con esto, tomando las claves de Settings → API:

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_PUBLIC_KEY=la_clave_publica
SUPABASE_SECRET_KEY=la_clave_secreta
REPLICA_TEST_PASSWORD=una_contraseña_de_prueba
```

Crea `admin@`, `valeria@`, `ana@` y `beto@replica.test`:

```bash
npm --prefix frontend run cuentas
```

Comprueba con consultas directas que ninguna cuenta alcanza lo de otra, y que una nota privada no pasa de la función:

```bash
npm --prefix frontend run accesos
```

Debe terminar en "Todo bien.". La clave secreta salta las reglas de acceso: solo va en `supabase/.env` y en el servidor, nunca en `frontend/.env.local`.

Comprueba la réplica real de Gemini, el tiempo real, los archivos y eliminar una cuenta. Gasta una llamada a Gemini:

```bash
npm --prefix frontend run flujo
```

Comprueba la réplica del día sin que nadie la pida. Espera la próxima vuelta programada, hasta 17 minutos:

```bash
npm --prefix frontend run programada
```

Las tres pruebas usan solo las cuentas de prueba. `flujo` y `programada` borran las notas de `ana@replica.test`.

## 7. Cargar los datos de la demostración

Para mostrar el sistema con datos, después de `cuentas`:

```bash
npm --prefix frontend run demo
```

Crea o actualiza cuentas `@replica.test` con la misma contraseña de prueba:
- `lucia@replica.test`: unos tres meses de diario, con réplicas, réplicas del día, favoritas, cofre, un chat con Replica y su proceso con Valeria, con el diario compartido.
- `mateo@`, con una solicitud pendiente, y `camila@`, con un proceso terminado: el resto del panel de Valeria.
- `daniel@` (aprobado, en el directorio), `andres@` y `carolina@` (pendientes), `sofia@` (con corrección pedida) y `julian@` (rechazado): el panel de administración.

Las réplicas de estos datos están escritas a mano en la voz de Replica (`frontend/scripts/demo/diario-lucia.mjs`); no salen de Gemini. Las fechas se cuentan desde el día en que se corre, así que conviene correrlo la mañana de la demostración. Se puede repetir: borra lo que dejó la vez anterior. No toca a `ana@` ni a `beto@`.

`admin@replica.test` es la cuenta de demostración: cada nota suya que no es privada recibe su réplica al momento de Gemini, sin límite diario (`20261104000004_cuenta_de_demostracion.sql`).

## Cambios en la base de datos

Todo cambio es una migración nueva en `migrations/`. Las que ya se subieron no se editan.
