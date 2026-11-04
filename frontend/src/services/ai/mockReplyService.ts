import { paceReply } from './pace';
import { showsRisk } from '../../lib/risk';
import type { ReplyContent, ReplyRequest, ReplyService } from './types';

// Datos sintéticos: réplicas de ejemplo mientras no exista el backend con Gemini.
// Se elige una según palabras de la nota, y se cita un fragmento de lo que escribiste.

type Template = {
  match: RegExp;
  build: (quote: string) => ReplyContent;
};

// Ordenadas de lo más específico a lo más general (desempata el orden).
const TEMPLATES: Template[] = [
  {
    match: /miedo a quedar mal|digo que s[ií]|dije que s[ií]|l[ií]mite/i,
    build: (q) => ({
      headline: 'Decir que sí a todo también tiene un costo.',
      learning: 'Un “no” a tiempo también es un sí a ti.',
      body: `Escribiste “${q}”. Darte cuenta ya cambia algo: el sí automático suele proteger un miedo, y nombrarlo te devuelve la posibilidad de elegir.`,
      questions: [
        '¿Qué temes que pase si alguna vez dices que no?',
        '¿En qué situación pequeña podrías practicar un “déjame pensarlo”?',
      ],
    }),
  },
  {
    match: /jefe|trabajo|reuni[oó]n|oficina/i,
    build: (q) => ({
      headline: 'Poner un límite también es una forma de cuidarte.',
      learning: 'Sostener tu lugar no te hace menos amable.',
      body: `Noto que sostener tu lugar te costó, y aun así lo hiciste. Cuando escribes “${q}”, se siente el esfuerzo. La culpa que a veces aparece después suele ser la costumbre de ceder, no una señal de que hiciste algo mal.`,
      questions: [
        '¿A quién sentías que estabas decepcionando realmente?',
        '¿Cómo podrías honrar esa misma firmeza en algo personal esta semana?',
      ],
    }),
  },
  {
    match: /discut|distancia|pareja|peleamos/i,
    build: (q) => ({
      headline: 'Lo pequeño a veces carga algo más grande.',
      learning: 'Nombrar la distancia es el primer paso para acortarla.',
      body: `Cuando escribes “${q}”, parece que la discusión fue la superficie de otra cosa. Esa distancia que no sabes nombrar merece tiempo, no una respuesta rápida.`,
      questions: [
        '¿Qué necesitabas de la otra persona en ese momento?',
        '¿Cómo podrías decirlo sin que suene a reproche?',
      ],
    }),
  },
  {
    match: /cansad|agotad|sin ganas|no retuve|largo/i,
    build: (q) => ({
      headline: 'El cansancio también es información.',
      learning: 'El descanso no se gana: es parte del camino.',
      body: `Escribiste “${q}”. A veces el cuerpo habla antes de que encontremos las palabras, y pide una pausa que la agenda no deja. Reconocerlo ya es una forma de escucharte.`,
      questions: [
        '¿Qué parte del día te pidió más de lo que tenías para dar?',
        '¿Qué pequeña pausa podrías regalarte mañana?',
      ],
    }),
  },
  {
    match: /dormir|urgente|cuentas|preocup|ansiedad/i,
    build: (q) => ({
      headline: 'No todo lo urgente es para esta noche.',
      learning: 'No todo lo urgente necesita resolverse hoy.',
      body: `Leo “${q}” y se siente el peso de tenerlo todo encima a la vez. La mente, cuando se asusta, junta los pendientes en uno solo; separarlos suele bajar el volumen.`,
      questions: [
        '¿Cuál de esas preocupaciones depende de ti mañana?',
        '¿Qué podrías dejar anotado para soltarlo por hoy?',
      ],
    }),
  },
  {
    match: /mam[aá]|pap[aá]|familia|herman|abuel|sobrin|infancia/i,
    build: (q) => ({
      headline: 'Hay vínculos que te devuelven a ti.',
      learning: 'Hay risas que te recuerdan quién eres.',
      body: `Lo que contaste, “${q}”, tiene la ligereza de los reencuentros. Esos momentos compartidos suelen recordarnos quiénes somos cuando no tenemos que demostrar nada.`,
      questions: [
        '¿Qué te gustaría conservar de ese momento para los días más pesados?',
        '¿Con quién más te gustaría sentir algo así?',
      ],
    }),
  },
  {
    match: /amig|recordad|escribi[oó]/i,
    build: (q) => ({
      headline: 'Que alguien piense en ti también cuenta.',
      learning: 'Que te recuerden también es una forma de pertenecer.',
      body: `Escribiste “${q}”. Sentirte recordada o recordado toca algo simple y profundo: saber que existes en la vida de otros aunque no estés delante.`,
      questions: [
        '¿Qué te dice ese mensaje sobre el lugar que ocupas para otros?',
        '¿A quién te gustaría hacer sentir lo mismo esta semana?',
      ],
    }),
  },
  {
    match: /termin[eé]|logr|por fin|pendiente/i,
    build: (q) => ({
      headline: 'Los logros pequeños también son tuyos.',
      learning: 'Lo pequeño, cuando es tuyo, también cuenta.',
      body: `“${q}”. Cerrar algo que llevaba tiempo abierto deja espacio. No necesita ser grande para merecer que lo mires con orgullo.`,
      questions: [
        '¿Qué te ayudó a terminarlo esta vez?',
        '¿Qué otro pendiente se sentiría bien cerrar?',
      ],
    }),
  },
  {
    match: /camin|lluvia|silencio|respir|yoga|naturaleza|paz/i,
    build: (q) => ({
      headline: 'El silencio también te estaba hablando.',
      learning: 'Bajar el ritmo también es avanzar.',
      body: `Hay algo tranquilo en cómo lo describes: “${q}”. Parece que bajar el ritmo te devolvió al cuerpo, a lo que pasa aquí y ahora.`,
      questions: [
        '¿Qué cambió en ti entre el primer paso y el último?',
        '¿Dónde más podrías encontrar ese espacio durante la semana?',
      ],
    }),
  },
];

const FALLBACK = (q: string): ReplyContent => ({
  headline: 'Lo que escribes hoy ya es un paso.',
  learning: 'Ponerlo en palabras ya es empezar a entenderlo.',
  body: `Leo en tu nota “${q}”. Ponerlo en palabras ayuda a mirarlo con un poco más de distancia, sin tener que resolverlo todo de una vez.`,
  questions: [
    '¿Qué parte de esto te gustaría entender mejor?',
    '¿Qué necesitarías para sentirte un poco más en calma mañana?',
  ],
});

// Un fragmento corto de la nota para citarlo: la primera frase, recortada a unas 7 palabras.
function quoteFrom(text: string) {
  const first = text.split(/[.!?\n]/)[0]?.trim() ?? text.trim();
  const words = first.split(/\s+/);
  const cut = words.slice(0, 7).join(' ');
  return words.length > 7 ? `${cut}…` : cut;
}

// Gana la plantilla con más coincidencias en la nota; si empatan, la más específica (la primera).
// Así una nota sobre caminar "después del trabajo" recibe la réplica del silencio, no la del trabajo.
function bestTemplate(text: string) {
  let best: Template | undefined;
  let bestScore = 0;
  for (const t of TEMPLATES) {
    const score = text.match(new RegExp(t.match.source, 'gi'))?.length ?? 0;
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best;
}

// Con nombre, el titular le habla a la persona: “Ana, el cansancio también es información.”
function addressed(headline: string, name?: string) {
  const first = name?.trim().split(/\s+/)[0];
  if (!first) return headline;
  return `${first}, ${headline.charAt(0).toLowerCase()}${headline.slice(1)}`;
}

// La misma réplica de cuidado del servidor (_shared/voice.ts): sin consejos, con calidez y con la
// ayuda en crisis a la vista.
function careReply(name?: string): ReplyContent {
  const opening = name ? `${name}, leí` : 'Leí';
  return {
    headline: 'Gracias por escribir esto aquí.',
    body: `${opening} lo que escribiste y me importa. Lo que sientes merece más compañía de la que yo puedo darte: no tienes por qué cargarlo a solas. Hablar hoy con alguien de confianza o con una línea de ayuda de tu país puede acompañarte de verdad.`,
    questions: ['¿Hay alguien a quien puedas escribirle hoy?'],
    learning: 'No tienes que cargarlo a solas.',
    risk: true,
  };
}

export function buildMockReply(
  request: Pick<ReplyRequest, 'text' | 'tone' | 'name'>
): ReplyContent {
  if (showsRisk(request.text)) return careReply(request.name);
  const quote = quoteFrom(request.text);
  const template = bestTemplate(request.text);
  const base = template ? template.build(quote) : FALLBACK(quote);
  const reply = { ...base, headline: addressed(base.headline, request.name) };
  if (request.tone === 'directo') {
    // Tono directo: el análisis se queda en su primera frase.
    return { ...reply, body: reply.body.split('. ')[0] + '.' };
  }
  if (request.tone === 'profundo') {
    // Tono profundo: una pregunta más, que mira detrás de lo que pasó.
    return {
      ...reply,
      questions: [...reply.questions, '¿Qué idea sobre ti aparece detrás de lo que sentiste?'],
    };
  }
  return reply;
}

// El comentario de la réplica del día para una nota: dónde cae en el día, qué dijiste y lo que se
// ve de eso mirado junto al resto. Cambia con cada nota, así no se repite de una a otra.
function dayComment(text: string, index: number, total: number, late: boolean) {
  const quote = quoteFrom(text);
  const when = late
    ? index === 0
      ? `Ya de noche, después de tu réplica, escribiste “${quote}”.`
      : index === total - 1
        ? `Y lo último que escribiste fue “${quote}”.`
        : `Luego escribiste “${quote}”.`
    : index === 0
      ? `Empezaste el día con “${quote}”.`
      : index === total - 1
        ? `Y lo cerraste con “${quote}”.`
        : `Más tarde escribiste “${quote}”.`;
  const template = bestTemplate(text);
  const insight = (template ? template.build(quote) : FALLBACK(quote)).headline;
  const lead = late ? 'Mirado con calma' : 'Visto junto al resto de tu día';
  return `${when} ${lead}: ${insight.charAt(0).toLowerCase()}${insight.slice(1)}`;
}

// La réplica del día: une el principio y el final de lo que escribiste y lo mira como un todo.
// Con kind 'late' es la última réplica, a medianoche: solo lo escrito después de la de la noche,
// para despertar con algo.
export function buildMockDayReply(
  request: Pick<ReplyRequest, 'text' | 'tone' | 'name' | 'count' | 'notes' | 'kind'>
): ReplyContent {
  const late = request.kind === 'late';
  const parts = request.text.split(/\n\s*\n/).filter(Boolean);
  const first = quoteFrom(parts[0] ?? request.text);
  const last = quoteFrom(parts[parts.length - 1] ?? request.text);
  const count = request.count ?? parts.length;
  const template = bestTemplate(request.text);
  const base = template ? template.build(last) : FALLBACK(last);
  const body = late
    ? count > 1
      ? `Después de tu réplica todavía escribiste ${count} veces, desde “${first}” hasta “${last}”. De noche las cosas pesan distinto; dejarlas en palabras antes de dormir es una forma de soltarlas un poco.`
      : `Después de tu réplica todavía escribiste “${first}”. De noche las cosas pesan distinto; dejarlas en palabras antes de dormir es una forma de soltarlas un poco.`
    : count > 1
      ? `Hoy escribiste ${count} veces. Empezaste con “${first}” y cerraste con “${last}”. Mirado entero, tu día no fue una sola cosa: hubo momentos que pesaron y otros en los que te sostuviste. Que lo hayas puesto en palabras ya le da un orden.`
      : base.body;
  const reply = {
    headline: addressed(
      late
        ? 'Lo que escribiste ya de noche también cuenta.'
        : 'Tu día tuvo más de un momento, y los escuchaste todos.',
      request.name
    ),
    body: request.tone === 'directo' ? body.split('. ').slice(0, 2).join('. ') + '.' : body,
    questions: late
      ? ['¿Con qué te quieres quedar al despertar?', '¿Qué de anoche se ve distinto hoy?']
      : [
          '¿Qué momento de hoy te gustaría recordar mañana?',
          '¿Qué te llevas de este día para el que viene?',
        ],
    learning: base.learning,
    comments: (request.notes ?? []).map((n, i, all) => ({
      noteId: n.id,
      text: dayComment(n.text, i, all.length, late),
    })),
  };
  // Con riesgo, la réplica del día tampoco analiza: acompaña, y cada nota conserva su comentario.
  if (showsRisk(request.text)) return { ...careReply(request.name), comments: reply.comments };
  return reply;
}

const FIRST_DELAY = 650;

export const mockReplyService: ReplyService = {
  streamReply(request, handlers) {
    const reply =
      request.kind === 'day' || request.kind === 'late'
        ? buildMockDayReply(request)
        : buildMockReply(request);
    return paceReply(reply, handlers, FIRST_DELAY);
  },
};
