# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Una sola identidad visual propia en iOS y Android, con el nivel de las mejores apps de iOS. No se adapta el lenguaje visual por sistema: solo se respetan las convenciones nativas de cada uno (gesto y botón atrás, hápticos, teclado, safe areas, notch/Dynamic Island).

## Stack

Expo SDK 57 + Expo Router + TypeScript estricto, con development build. NativeWind 4 (Tailwind 3) y React Native Reusables como base de componentes. Motion con Reanimated 4 + Gesture Handler (hilo de UI); efectos y gráficas con Skia y react-native-svg; expo-haptics, expo-blur, react-native-keyboard-controller, @gorhom/bottom-sheet y FlashList. Backend futuro: Supabase + Gemini (Edge Functions). En esta etapa no hay backend: datos mock tipados y un servicio de IA simulado (con streaming) fácil de reemplazar.

## Users

- **Usuario principal:** adultos hispanohablantes (sin foco en un solo país) que quieren ordenar lo que sienten en el día a día. Escriben o dictan una nota corta, casi siempre desde el teléfono, a menudo al final del día o en un momento de tensión. Parte del público tiene Android de gama media y conexión inestable.
- **Psicólogos verificados:** usan la misma app (un apartado en Usuario) para chatear con sus pacientes, coordinar sesiones por Google Meet y leer los diarios que los pacientes les compartan.

## Product Purpose

Replica es un diario personal donde se escribe sin límite y la IA responde **dos veces al día, y a veces tres**: una **réplica** a la primera nota del día (una reflexión breve con preguntas para profundizar), a la hora elegida (8 o 10 p. m.) **la réplica del día**, que lee todo lo que se escribió ese día y deja un comentario propio a cada nota, y a medianoche **una última réplica**, solo si se escribió después de la réplica de la noche, para despertar con algo. Además conecta al usuario con un psicólogo por chat. Existe porque un diario tradicional no responde y porque ir al psicólogo tiene barreras (costo, no saber a quién acudir, estigma). Éxito en la v1: la gente vuelve a escribir durante varias semanas y los psicólogos usan el chat con sus pacientes.

## Positioning

La IA no conversa: responde a cada nota con una réplica pensada, como un buen interlocutor que te devuelve la pregunta justa. El diario también es el puente con la terapia: con consentimiento, el psicólogo ve cómo estuvo la semana de su paciente entre sesiones.

## Operating Context

- Navegación de 5 pestañas: **Inicio** (escribir; ánimo y tema necesarios; las dos frases del día; el cofre junto al saludo; una sola línea avisa cuándo llega o que llegó la réplica del día, nunca la réplica entera), **Notas** (todas las notas, con su réplica si la tienen, y la réplica de cada día como una entrada arriba de sus notas), **Evolución** (curva de ánimo, patrones, cofre de aprendizajes y tu tela), **Chat** (solo con el psicólogo, uno a la vez, nunca con la IA) y **Usuario** (perfil, métricas, favoritas, ajustes plegables, cuenta y apartado de psicólogo).
- Registro: Apple, Google o correo y contraseña (un código de 6 dígitos confirma el correo al crear la cuenta y sirve para recuperar la contraseña), consentimiento explícito (18+, términos, IA que lee las notas) y una configuración corta. Recorridos breves la primera vez en cada pantalla.
- Sesiones de video por links de Google Meet, fuera de la app.
- Uso privado e íntimo, muchas veces de noche.

## Capabilities and Constraints

- Hasta tres réplicas de la IA al día (Gemini): la de la primera nota, la del día (a las 8 o 10 p. m., con un comentario propio para cada nota que lee) y, solo si se escribió después de esa, una última réplica a medianoche que lee únicamente esas notas. Sin chat con la IA. Costo acotado: máximo tres llamadas por persona al día (casi siempre dos), aplicado también en el servidor. Si la app no se abrió a esa hora, las réplicas pendientes se generan al volver (con Supabase, el servidor las hará a su hora).
- Notas privadas: no las lee la IA ni el psicólogo.
- Métricas solo calculables: racha, total de notas y palabras, ánimo autorreportado en el tiempo, etiquetas frecuentes. Nunca puntajes de salud mental inventados ni porcentajes de "mejora".
- Dictado por voz convertido a texto en el teléfono; el diario solo guarda texto.
- Bloqueo biométrico opcional del sistema (Face ID / huella). Los diálogos del sistema (permisos, galería, cámara, compartir) no lo disparan.
- El diario no entra en las copias de seguridad de Android (`allowBackup: false`): no se sube a Google Drive. Mientras no haya servidor, quien cambie de teléfono pierde sus notas.
- Diario usable sin conexión, con sincronización posterior.
- Temas claro y oscuro.
- Fuera de la v1: chat con la IA, pantalla de crisis, exportar, pagos, planes y videollamadas propias. En evaluación: una carta semanal ("la tela de la semana").
- La réplica no diagnostica ni da indicaciones clínicas. Si una nota muestra riesgo, la réplica no da consejos y sugiere ayuda profesional.

## Brand Commitments

- Nombre: **Replica** (sin tilde). La respuesta de la IA se llama "réplica" en los textos.
- Tono: calmado, contemplativo, editorial. Sin trucos agresivos de retención ni gamificación que genere culpa.
- **Sin contadores que pidan atención:** ningún número como insignia o notificación ("Ver todas (12)", "Favoritas · 5"). Se usa un ícono. Los números solo aparecen donde son el dato (métricas, palabras de una nota).
- Las favoritas se nombran por lo que son: "marcar como favorita", no "tocar el corazón".
- Los mockups de `design-reference/` (con el nombre "Serena") son la referencia visual de las pantallas: composición en tarjetas, jerarquía y riqueza de contenido. Encima va el movimiento propio de Replica. Lo que no está en el alcance (chat con IA, métricas incalculables, cifrado o exportar sin implementar) no se copia.

## Evidence on Hand

- Mockups de Google Stitch en `design-reference/` (pantallas y dos DESIGN.md como inspiración).
- Documentación del proyecto en `docs/` y `README.md`.
- Sin logo definitivo, testimonios, usuarios reales ni datos de uso todavía. No inventarlos.

## Product Principles

1. **La IA acompaña, no reemplaza.** Nunca actúa como terapeuta ni emite diagnósticos.
2. **Privacidad primero.** El diario es privado por defecto; compartirlo es explícito y revocable.
3. **Solo datos reales.** Ninguna métrica que no salga de lo que el usuario hizo o eligió.
4. **Calma sobre retención.** La app invita a volver; no presiona. Nada de contadores ni insignias numéricas.
5. **Funciona en condiciones reales:** teléfonos de gama media y conexión inestable.

## Accessibility & Inclusion

Respetar Reduce Motion y el tamaño de texto del sistema; targets táctiles de al menos 44 pt; contraste suficiente en ambos temas. Español neutro.
