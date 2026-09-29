import { authService } from "./auth";

/**
 * Modelo 1:1 con la tabla `entries` de 03-base-de-datos.md
 */
export interface Entry {
  id: string;
  user_id: string;
  content: string;
  mood: string; // 'paz' | 'alegria' | 'gratitud' | 'reflexion' | 'cansancio' | 'ansiedad' | 'tristeza'
  tag: string; // 'Trabajo' | 'Familia' | 'Pareja' | 'Amistades' | 'Salud' | 'Estudios' | 'Dinero' | 'Yo'
  is_private: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Modelo 1:1 con la tabla `ai_replies` de 03-base-de-datos.md
 */
export interface AIReply {
  id: string;
  entry_id: string;
  title: string;
  content: string;
  quote?: string;
  questions?: string[];
  created_at: string;
}

/**
 * Modelo 1:1 con la tabla `day_replies` de 03-base-de-datos.md
 */
export interface DayReply {
  id: string;
  user_id: string;
  day: string; // "YYYY-MM-DD"
  headline: string;
  synthesis: string;
  notes_count: number;
  has_late_reply: boolean;
  created_at: string;
}

const ENTRIES_KEY = "replica_entries";
const REPLIES_KEY = "replica_ai_replies";
const DAY_REPLIES_KEY = "replica_day_replies";

const SEED_VERSION_KEY = "replica_seed_version";
const CURRENT_SEED_VERSION = "v3";

function getSeedDate(daysAgo: number, hours: number, minutes: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function getDayKey(dateStr: string): string {
  return dateStr.slice(0, 10);
}

interface SeedNoteDef {
  days: number;
  hour: number;
  minute: number;
  mood: string;
  tag: string;
  text: string;
  is_favorite?: boolean;
  is_private?: boolean;
  replyTitle?: string;
  replyContent?: string;
  replyQuote?: string;
  replyQuestions?: string[];
}

const SEED_NOTES_DEF: SeedNoteDef[] = [
  {
    days: 1,
    hour: 21,
    minute: 40,
    mood: "ansiedad",
    tag: "Trabajo",
    text: "Hoy en la reunión sentí ese nudo en el pecho de siempre. Quería anticipar cada error de los demás. Respiré profundo y, por primera vez, dejé que otro tomara la decisión.",
    replyTitle: "Ana, permitir que otro decida es un acto de confianza y descanso.",
    replyContent: "Noto que sostener tu lugar te costó, y aun así lo hiciste. Querer controlar cada detalle suele ser una forma de protegerte ante la incertidumbre, pero soltar esa carga te devuelve energía.",
    replyQuote: "Respiré profundo y, por primera vez, dejé que otro tomara la decisión...",
    replyQuestions: [
      "¿Qué sentiste en el cuerpo cuando viste que las cosas salieron bien sin tu intervención directa?",
      "¿En qué otro ámbito pequeño podrías practicar soltar el control esta semana?",
    ],
  },
  {
    days: 2,
    hour: 19,
    minute: 15,
    mood: "paz",
    tag: "Yo",
    text: "Salí a caminar sin audífonos. Empezó a llover y no me importó. Escuché todo: los carros, la gente, mi propia respiración.",
    is_favorite: true,
    replyTitle: "Ana, estar presente en lo simple es una forma de arraigo.",
    replyContent: "Caminar bajo la lluvia sin prisa ni distracciones muestra que estás aprendiendo a habitar el presente sin necesidad de llenarlo con ruido. Quédate con esa ligereza.",
    replyQuote: "Salí a caminar sin audífonos. Empezó a llover y no me importó...",
    replyQuestions: [
      "¿Qué fue lo que más te sorprendió de escuchar tu propia respiración?",
      "¿Cómo puedes proteger estos instantes de silencio en los días que vienen?",
    ],
  },
  {
    days: 3,
    hour: 22,
    minute: 5,
    mood: "alegria",
    tag: "Familia",
    text: "Llamé a mi mamá y terminamos riéndonos de historias de mi infancia. Hacía tiempo que no me reía así.",
    is_favorite: true,
    replyTitle: "Ana, la risa compartida tiene el poder de restaurar la calma.",
    replyContent: "Conectar con tus raíces desde el humor y la ternura repara el cansancio de la semana. Esos momentos quedan guardados como un refugio al que siempre puedes volver.",
    replyQuote: "Hacía tiempo que no me reía así...",
    replyQuestions: [
      "¿Qué recuerdo de esa conversación te sacó la sonrisa más genuina?",
      "¿De qué manera puedes mantener más cerca esa sensación de calidez?",
    ],
  },
  {
    days: 4,
    hour: 20,
    minute: 30,
    mood: "cansancio",
    tag: "Trabajo",
    text: "Un día largo. Llegué a casa sin ganas de nada, ni siquiera de cocinar. Solo quería dormir.",
    replyTitle: "Ana, el descanso no se negocia: el cuerpo sabe cuándo parar.",
    replyContent: "Reconocer el agotamiento sin juzgarte por no ser productiva por la noche es cuidarte. A veces lo más sabio y amoroso que puedes hacer es simplemente apagar todo y dormir.",
    replyQuote: "Llegué a casa sin ganas de nada, ni siquiera de cocinar...",
    replyQuestions: [
      "¿Qué parte de la jornada consumió más tu energía hoy?",
      "¿Qué pequeña pausa reparadora puedes regalarte mañana al despertar?",
    ],
  },
  {
    days: 6,
    hour: 21,
    minute: 10,
    mood: "gratitud",
    tag: "Amistades",
    text: "Me escribió una amiga de la universidad solo para saber cómo estaba. Me hizo sentir recordada.",
    is_favorite: true,
    replyTitle: "Ana, ser vista y recordada nutre el alma silenciosamente.",
    replyContent: "En medio de las rutinas aceleradas, un mensaje inesperado que no pide nada a cambio nos recuerda que no estamos solos. Esa calidez es un bálsamo reconfortante.",
    replyQuote: "Me escribió una amiga de la universidad solo para saber cómo estaba...",
    replyQuestions: [
      "¿A quién te gustaría escribirle un mensaje similar sin esperar nada a cambio?",
      "¿Qué palabra define lo que sentiste al leer su mensaje?",
    ],
  },
  {
    days: 7,
    hour: 23,
    minute: 0,
    mood: "ansiedad",
    tag: "Dinero",
    text: "No logro dormir pensando en la entrega del viernes y en las cuentas del mes. Todo se siente urgente a la vez.",
    replyTitle: "Ana, en la noche todo se agranda; la mañana traerá otra luz.",
    replyContent: "Cuando la mente intenta resolver todas las urgencias en la cama, el cuerpo se tensa. Nombrar lo que te preocupa en este cuaderno ayuda a sacarlo de tu cabeza para que puedas descansar.",
    replyQuote: "No logro dormir pensando en la entrega del viernes...",
    replyQuestions: [
      "Si eligieras una sola cosa para resolver mañana, ¿cuál sería la primera?",
      "¿Cómo puedes recordarte que la noche es para reposar, no para resolver?",
    ],
  },
  {
    days: 8,
    hour: 18,
    minute: 45,
    mood: "reflexion",
    tag: "Yo",
    text: "Me di cuenta de que digo que sí a todo por miedo a quedar mal. Quiero empezar a notar cuándo lo hago.",
    replyTitle: "Ana, un “no” a tiempo también es un sí a ti misma.",
    replyContent: "Darte cuenta ya cambia algo: el sí automático suele proteger un viejo temor a decepcionar. Nombrarlo te devuelve la posibilidad y la libertad de elegir conscientemente.",
    replyQuote: "Me di cuenta de que digo que sí a todo por miedo a quedar mal...",
    replyQuestions: [
      "¿En qué situación pequeña podrías practicar responder 'déjame pensarlo'?",
      "¿Qué espacio ganarías para ti si dijeras un no con serenidad?",
    ],
  },
  {
    days: 10,
    hour: 21,
    minute: 20,
    mood: "paz",
    tag: "Salud",
    text: "Hice yoga por primera vez en semanas. El cuerpo estaba rígido pero al final respiré distinto.",
    replyTitle: "Ana, volver al cuerpo es regresar a tu propio centro.",
    replyContent: "La rigidez física muchas veces refleja las tensiones acumuladas en la mente. El solo hecho de estirar y respirar le avisa a tu sistema que estás a salvo.",
    replyQuote: "El cuerpo estaba rígido pero al final respiré distinto...",
    replyQuestions: [
      "¿En qué parte del cuerpo sentiste el mayor alivio al terminar?",
      "¿Cómo puedes integrar 5 minutos de respiración consciente en tu día?",
    ],
  },
  {
    days: 11,
    hour: 22,
    minute: 40,
    mood: "tristeza",
    tag: "Pareja",
    text: "Discutimos por algo pequeño y me quedé con una sensación de distancia que no sé cómo nombrar.",
    replyTitle: "Ana, nombrar la distancia es el primer paso para acortarla.",
    replyContent: "A veces una discusión menor es el síntoma de una necesidad más profunda que no supimos expresar a tiempo. Darle espacio a esa tristeza permite mirarla sin juzgar.",
    replyQuote: "Discutimos por algo pequeño y me quedé con una sensación de distancia...",
    replyQuestions: [
      "¿Qué necesitabas de la otra persona en ese instante?",
      "¿Cómo podrías expresar lo que sientes con suavidad y sin reproche?",
    ],
  },
  {
    days: 13,
    hour: 20,
    minute: 0,
    mood: "alegria",
    tag: "Familia",
    text: "Cumpleaños de mi sobrino. Verlo feliz me recordó lo simple que puede ser estar bien.",
    is_favorite: true,
    replyTitle: "Ana, la inocencia infantil nos recuerda lo esencial de la vida.",
    replyContent: "Los niños habitan el gozo sin condiciones ni análisis complicados. Permitirte contagiarte de esa sencillez es una lección de presencia que vale la pena atesorar.",
    replyQuote: "Verlo feliz me recordó lo simple que puede ser estar bien...",
    replyQuestions: [
      "¿Qué juego o momento te hizo sentir más ligera?",
      "¿Cómo puedes cultivar un momento de juego o espontaneidad hoy?",
    ],
  },
  {
    days: 15,
    hour: 21,
    minute: 15,
    mood: "ansiedad",
    tag: "Trabajo",
    text: "Mi jefe me pidió otro proyecto y dije que sí aunque ya no puedo con más. Me temblaba la voz.",
    replyTitle: "Ana, notar el temblor es el principio de aprender a poner límites.",
    replyContent: "El cuerpo avisa cuando estamos rebasando nuestra capacidad. No te reproches haber dicho que sí; date cuenta de la señal para que en la próxima oportunidad puedas respirar antes de responder.",
    replyQuote: "Mi jefe me pidió otro proyecto y dije que sí aunque ya no puedo con más...",
    replyQuestions: [
      "¿Qué sería lo peor que podría pasar si comunicas que necesitas renegociar plazos?",
      "¿Qué apoyo o claridad necesitas pedir mañana para no sobrecargarte sola?",
    ],
  },
  {
    days: 17,
    hour: 19,
    minute: 30,
    mood: "gratitud",
    tag: "Yo",
    text: "Terminé el libro que tenía pendiente desde hace meses. Pequeño logro, pero mío.",
    is_favorite: true,
    replyTitle: "Ana, honrar tus pequeñas metas personales es respetarte.",
    replyContent: "Cerrar ciclos que no tienen que ver con el trabajo ni con complacer a otros fortalece tu intimidad y tu sentido de logro personal. Celébralo con orgullo silencioso.",
    replyQuote: "Terminé el libro que tenía pendiente desde hace meses...",
    replyQuestions: [
      "¿Qué idea o pasaje del libro resonó con mayor fuerza en ti?",
      "¿Qué nueva lectura o espacio propio te gustaría inaugurar?",
    ],
  },
  {
    days: 19,
    hour: 22,
    minute: 10,
    mood: "cansancio",
    tag: "Estudios",
    text: "Estudié toda la tarde y siento que no retuve nada. Estoy agotada.",
    replyTitle: "Ana, asimilar también requiere pausas silenciosas.",
    replyContent: "El cerebro no aprende por acumulación forzada, sino por descanso y consolidación durante el sueño. Confía en que lo sembrado germinará cuando le des tregua a tu mente.",
    replyQuote: "Estudié toda la tarde y siento que no retuve nada...",
    replyQuestions: [
      "¿Cómo cambiaría tu tarde de estudio si hicieras pausas regulares de 10 minutos?",
      "¿Qué puedes hacer esta noche para desconectar por completo antes de dormir?",
    ],
  },
  {
    days: 22,
    hour: 20,
    minute: 45,
    mood: "paz",
    tag: "Salud",
    text: "Caminata larga al atardecer. El silencio me ordenó los pensamientos.",
    replyTitle: "Ana, el movimiento pausado ordena lo que la quietud a veces enreda.",
    replyContent: "Caminar al atardecer permite que las ideas se acomoden por su propio peso. Encontraste un ritmo que te hace bien; guárdalo como tu recurso más preciado.",
    replyQuote: "Caminata larga al atardecer. El silencio me ordenó los pensamientos...",
    replyQuestions: [
      "¿Qué pensamiento que parecía confuso se aclaró durante la caminata?",
      "¿Qué paisaje o luz del atardecer te trajo mayor serenidad?",
    ],
  },
  {
    days: 45,
    hour: 19,
    minute: 30,
    mood: "reflexion",
    tag: "Yo",
    text: "Mirando fotos viejas comprendí cuánto he cambiado en este último tiempo. Hay cosas que antes me dolían y hoy ya no me pesan tanto.",
    replyTitle: "Ana, la distancia del tiempo revela tu propia madurez.",
    replyContent: "Mirar hacia atrás con compasión te permite reconocer el camino recorrido. No eres la misma persona de hace un año, y esa serenidad ganada es tu mayor logro.",
    replyQuote: "Hay cosas que antes me dolían y hoy ya no me pesan tanto...",
    replyQuestions: [
      "¿Qué vieja carga agradeces haber soltado en este camino?",
      "¿Cómo describirías la paz que sientes hoy respecto a ese pasado?",
    ],
  },
  {
    days: 75,
    hour: 20,
    minute: 15,
    mood: "gratitud",
    tag: "Familia",
    text: "Un fin de semana tranquilo en casa de mis abuelos. Conversaciones sencillas que sanan y devuelven la perspectiva.",
    replyTitle: "Ana, los afectos sinceros son el puerto al que siempre podemos regresar.",
    replyContent: "La sencillez de la cocina familiar y las charlas sin prisa desarticulan las falsas urgencias del día a día. Quédate con ese abrigo en el corazón.",
    replyQuote: "Conversaciones sencillas que sanan y devuelven la perspectiva...",
    replyQuestions: [
      "¿Qué frase o gesto de ese encuentro guardas con especial ternura?",
      "¿Cómo puedes llevar un poco de esa calma a tu semana?",
    ],
  },
];

function seedInitialDataIfEmpty() {
  if (typeof window === "undefined") return;

  const currentVersion = localStorage.getItem(SEED_VERSION_KEY);
  const existingRaw = localStorage.getItem(ENTRIES_KEY);

  // Si ya tiene la versión v3 y contiene entradas, no se sobreescribe
  if (currentVersion === CURRENT_SEED_VERSION && existingRaw && existingRaw !== "[]") {
    return;
  }

  // Preservar cualquier entrada que haya creado el usuario manualmente (sin prefijo seed-)
  let userEntries: Entry[] = [];
  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw) as Entry[];
      userEntries = parsed.filter((e) => !e.id.startsWith("seed-"));
    } catch {
      userEntries = [];
    }
  }

  const generatedSeedEntries: Entry[] = [];
  const generatedReplies: AIReply[] = [];
  const generatedDayReplies: Record<string, DayReply> = {};

  SEED_NOTES_DEF.forEach((def, index) => {
    const entryId = `seed-${index + 1}`;
    const dateStr = getSeedDate(def.days, def.hour, def.minute);

    const entry: Entry = {
      id: entryId,
      user_id: "user_seed",
      content: def.text,
      mood: def.mood,
      tag: def.tag,
      is_private: def.is_private ?? false,
      is_favorite: def.is_favorite ?? false,
      created_at: dateStr,
      updated_at: dateStr,
    };
    generatedSeedEntries.push(entry);

    if (def.replyTitle && def.replyContent) {
      generatedReplies.push({
        id: `reply-${entryId}`,
        entry_id: entryId,
        title: def.replyTitle,
        content: def.replyContent,
        quote: def.replyQuote,
        questions: def.replyQuestions,
        created_at: dateStr,
      });
    }

    // Agregar síntesis diaria para días clave
    const dayKey = getDayKey(dateStr);
    if (!generatedDayReplies[dayKey]) {
      generatedDayReplies[dayKey] = {
        id: `day-reply-${dayKey}`,
        user_id: "user_seed",
        day: dayKey,
        headline: `Cerraste este día cultivando momentos de ${def.mood}.`,
        synthesis: `Entre tus notas sobre #${def.tag}, encontraste un instante para pausar, registrar cómo te sentías y tejer con calma.`,
        notes_count: 1,
        has_late_reply: false,
        created_at: dateStr,
      };
    } else {
      generatedDayReplies[dayKey].notes_count += 1;
    }
  });

  const allEntries = [...userEntries, ...generatedSeedEntries];
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(allEntries));
  localStorage.setItem(REPLIES_KEY, JSON.stringify(generatedReplies));
  localStorage.setItem(DAY_REPLIES_KEY, JSON.stringify(generatedDayReplies));
  localStorage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION);
}

// Inicializar semillas al cargar el módulo
if (typeof window !== "undefined") {
  seedInitialDataIfEmpty();
}

function getStoredEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ENTRIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

function getStoredReplies(): AIReply[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(REPLIES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AIReply[];
  } catch {
    return [];
  }
}

function getStoredDayReplies(): Record<string, DayReply> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(DAY_REPLIES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, DayReply>;
  } catch {
    return {};
  }
}

export const journalService = {
  getEntries(): Entry[] {
    const entries = getStoredEntries();
    return entries.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getRecentEntries(limit: number = 3): Entry[] {
    return this.getEntries().slice(0, limit);
  },

  getReplyForEntry(entryId: string): AIReply | null {
    const replies = getStoredReplies();
    return replies.find((r) => r.entry_id === entryId) || null;
  },

  getDayReplies(): Record<string, DayReply> {
    return getStoredDayReplies();
  },

  getDayReplyForDay(dayKey: string): DayReply | null {
    const map = getStoredDayReplies();
    return map[dayKey] || null;
  },

  async createEntry(data: {
    content: string;
    mood: string;
    tag: string;
    is_private: boolean;
  }): Promise<{ entry: Entry; reply?: AIReply }> {
    const session = authService.getSession();
    const userId = session?.user.id || "guest_user";
    const userName = session?.user.name || "Ana";

    const now = new Date().toISOString();
    const entryId = `entry_${Date.now()}`;

    const newEntry: Entry = {
      id: entryId,
      user_id: userId,
      content: data.content.trim(),
      mood: data.mood,
      tag: data.tag,
      is_private: data.is_private,
      is_favorite: false,
      created_at: now,
      updated_at: now,
    };

    const entries = getStoredEntries();
    entries.unshift(newEntry);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));

    // Si la nota es privada, no genera réplica (Sección 11 regla 2 de DESIGN.md)
    if (data.is_private) {
      return { entry: newEntry };
    }

    // Generar Réplica de IA simulada (1:1 con la tabla ai_replies)
    const quoteWords = data.content.split(" ").slice(0, 10).join(" ");
    const quote = quoteWords.length > 0 ? `${quoteWords}...` : undefined;

    const replyTitle = `${userName}, poner una pausa también es tejer con calma.`;
    const replyContent = `Noto que al escribir sobre ${data.tag} te encontraste en un momento de ${data.mood}. A veces nombrar lo que sentimos es el paso más valiente para comenzar a ordenarlo. ¿Cómo se sintió dejar esa carga en estas líneas?`;

    const replyQuestions = [
      `¿Qué necesitarías hoy para que esa sensación de ${data.mood} te acompañe sin abrumarte?`,
      `Si miraras este momento dentro de una semana, ¿qué consejo crees que te darías?`,
    ];

    const newReply: AIReply = {
      id: `reply_${Date.now()}`,
      entry_id: entryId,
      title: replyTitle,
      content: replyContent,
      quote,
      questions: replyQuestions,
      created_at: new Date().toISOString(),
    };

    const replies = getStoredReplies();
    replies.unshift(newReply);
    localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));

    return { entry: newEntry, reply: newReply };
  },

  toggleFavorite(entryId: string): boolean {
    const entries = getStoredEntries();
    const target = entries.find((e) => e.id === entryId);
    if (!target) return false;

    target.is_favorite = !target.is_favorite;
    target.updated_at = new Date().toISOString();
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return target.is_favorite;
  },

  deleteEntry(entryId: string): void {
    const entries = getStoredEntries().filter((e) => e.id !== entryId);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));

    const replies = getStoredReplies().filter((r) => r.entry_id !== entryId);
    localStorage.setItem(REPLIES_KEY, JSON.stringify(replies));
  },
};
