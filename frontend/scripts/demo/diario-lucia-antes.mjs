// Los meses de Lucía antes de agosto: abrió el diario en diciembre, escribió a ratos y lo dejó en julio.
// Pocas notas por mes, lo justo para que la curva de ánimo de Evolución tenga un punto en cada uno.
// Mismo formato que diario-lucia.mjs; cada nota no privada es la primera del día y lleva su réplica.

export const EARLIER = [
  // Diciembre
  {
    ago: 336,
    notes: [
      {
        at: "22:30",
        mood: "cansancio",
        tag: "Yo",
        text: "Me descargué esto porque una amiga lo usa. No sé muy bien qué escribir. Estoy cansada y falta todo diciembre.",
        reply: [
          "No hace falta saber qué escribir para empezar.",
          "Llegaste cansada y con todo diciembre por delante, y aun así abriste una página en blanco. Eso ya dice algo de ti. Aquí puedes escribir poco, o a ratos, y está bien.",
          ["¿Qué es lo que más te pesa de este mes?", "¿Qué te gustaría que este diario fuera para ti?"],
          "Empezar sin saber cómo también es empezar.",
        ],
      },
    ],
  },
  {
    ago: 326,
    notes: [
      {
        at: "21:10",
        mood: "ansiedad",
        tag: "Trabajo",
        text: "Cierre de año en la oficina. Todos quieren todo antes del veinte. Respondí correos hasta las once.",
        reply: [
          "Hasta las once sigue siendo trabajo.",
          "El cierre de año empuja a todos hacia la misma fecha, y tú terminaste respondiendo correos hasta muy tarde. Es mucho sostener la urgencia de tanta gente a la vez. Mereces que algo del día sea tuyo.",
          ["¿Qué correo podría haber esperado a mañana?", "¿Qué te ayudaría a cortar más temprano?"],
          "No todo lo urgente es tuyo de resolver.",
        ],
      },
    ],
  },
  {
    ago: 314,
    notes: [
      {
        at: "23:40",
        mood: "tristeza",
        tag: "Familia",
        text: "Cena de Navidad en casa de mi mamá. Yo cociné, yo lavé, yo organicé. Nadie lo notó y me fui a dormir con ganas de llorar.",
        reply: [
          "Lo hiciste todo, y nadie lo vio.",
          "Cocinaste, lavaste y organizaste la cena, y al final te quedaste con ganas de llorar. Cuando el esfuerzo pasa sin que nadie lo note, duele de una forma silenciosa. Lo que sientes tiene sentido.",
          ["¿Qué te habría gustado escuchar esta noche?", "¿Quién podría ayudarte la próxima vez?"],
          "Tu esfuerzo cuenta aunque nadie lo nombre.",
        ],
      },
    ],
  },
  // Enero
  {
    ago: 302,
    notes: [
      {
        at: "20:15",
        mood: "reflexion",
        tag: "Yo",
        text: "Año nuevo. No hice propósitos. Solo quiero dormir mejor y no sentir que llego tarde a todo.",
        reply: [
          "Dormir mejor ya es un propósito enorme.",
          "Sin listas ni metas grandes, pediste algo sencillo: descansar y dejar de sentir que llegas tarde. A veces lo más simple es lo que más falta hace. Es un buen lugar para empezar el año.",
          ["¿Qué te hace sentir que llegas tarde?", "¿Qué necesitarías para dormir un poco mejor?"],
          "Lo sencillo también merece ser una meta.",
        ],
      },
    ],
  },
  {
    ago: 293,
    notes: [
      {
        at: "22:50",
        mood: "cansancio",
        tag: "Salud",
        text: "Volvió el dolor de cuello. La fisioterapeuta dice que es tensión. Yo creo que es enero.",
        reply: [
          "Enero también se carga en el cuello.",
          "La fisioterapeuta lo llama tensión, y tú le pones nombre de mes. Las dos cosas pueden ser ciertas. El cuerpo suele avisar lo que la agenda no deja decir.",
          ["¿En qué momento del día aparece más el dolor?", "¿Qué podrías soltar esta semana para aliviarlo?"],
          "El cuerpo nombra lo que la agenda calla.",
        ],
      },
    ],
  },
  {
    ago: 284,
    notes: [
      {
        at: "21:00",
        mood: "alegria",
        tag: "Pareja",
        text: "Diego me sorprendió con pizza y una película. No hablamos del trabajo ni una vez.",
        reply: [
          "Una noche entera sin hablar del trabajo.",
          "Diego llegó con pizza y una película, y el trabajo se quedó afuera. Se nota lo bien que te hizo tener un rato sin pendientes. Vale la pena recordar cómo se sintió.",
          ["¿Qué hizo que esta noche fuera tan liviana?", "¿Cómo podrías repetirla pronto?"],
          "Un rato sin pendientes también descansa.",
        ],
      },
    ],
  },
  // Febrero
  {
    ago: 270,
    notes: [
      {
        at: "22:20",
        mood: "ansiedad",
        tag: "Dinero",
        text: "Subieron el alquiler. Hice cuentas tres veces. Alcanza, pero apenas.",
        reply: [
          "Tres veces las mismas cuentas.",
          "El alquiler subió y repasaste los números una y otra vez. Alcanza, y aun así queda la preocupación de que sea justo. Esa sensación de estar al límite cansa, aunque las cuentas cierren.",
          ["¿Qué te tranquilizaría un poco este mes?", "¿Con quién podrías hablar de esto?"],
          "Que alcance no quita el peso de hacer cuentas.",
        ],
      },
    ],
  },
  {
    ago: 262,
    notes: [
      {
        at: "23:05",
        mood: "tristeza",
        tag: "Yo",
        text: "No sé por qué escribo esto aquí. Hoy no quise ver a nadie.",
        private: true,
      },
    ],
  },
  {
    ago: 255,
    notes: [
      {
        at: "19:30",
        mood: "paz",
        tag: "Amistades",
        text: "Café con Andrea después de meses. Me reí mucho. Me había olvidado de que me gusta reírme así.",
        reply: [
          "Te habías olvidado de esa risa.",
          "Después de meses, un café con Andrea te devolvió algo que tenías guardado. Reírse así no es poca cosa. Parece que esa amistad te recuerda quién eres fuera de las obligaciones.",
          ["¿Qué te hace reír así?", "¿Cuándo te gustaría volver a ver a Andrea?"],
          "Algunas personas nos devuelven partes nuestras.",
        ],
      },
    ],
  },
  // Marzo
  {
    ago: 240,
    notes: [
      {
        at: "21:45",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Auditoría externa toda la semana. Llego a la casa y no me quedan ganas ni de hablar.",
        reply: [
          "Sin ganas ni de hablar.",
          "Una semana entera de auditoría te deja vacía al llegar a casa. Cuando el día se lleva toda la energía, el silencio también es una forma de descansar. No tienes que dar más de lo que te queda.",
          ["¿Qué necesitas al llegar a casa estos días?", "¿Qué podría hacer más liviana la semana?"],
          "El silencio también puede ser descanso.",
        ],
      },
    ],
  },
  {
    ago: 231,
    notes: [
      {
        at: "20:30",
        mood: "reflexion",
        tag: "Familia",
        text: "Mi hermano me llamó para pedirme ayuda con un trámite. Otra vez yo. Le dije que sí antes de pensarlo.",
        reply: [
          "Dijiste que sí antes de pensarlo.",
          "Tu hermano te llamó y el sí salió solo, como tantas veces. Lo notaste, y eso ya es distinto a no verlo. Ser la que siempre ayuda puede ser un lugar cómodo y cansado a la vez.",
          ["¿Qué habrías dicho si te dabas un minuto?", "¿Desde cuándo eres tú la que resuelve?"],
          "Notar el sí automático es el primer paso.",
        ],
      },
    ],
  },
  {
    ago: 222,
    notes: [
      {
        at: "22:00",
        mood: "ansiedad",
        tag: "Salud",
        text: "Me dio taquicardia en una reunión. Salí al baño a respirar. Nadie se dio cuenta.",
        reply: [
          "Saliste a respirar, y eso fue cuidarte.",
          "El corazón se aceleró en plena reunión y buscaste un lugar para respirar. Hiciste lo que necesitabas en ese momento. Si esto se repite, vale la pena contarlo a un médico o a alguien que te acompañe.",
          ["¿Qué estaba pasando justo antes?", "¿Quién podría acompañarte a revisarlo?"],
          "Parar a respirar también es responder.",
        ],
      },
    ],
  },
  // Abril
  {
    ago: 210,
    notes: [
      {
        at: "18:40",
        mood: "paz",
        tag: "Pareja",
        text: "Fin de semana largo en la playa con Diego. Dormí nueve horas seguidas. No sabía que todavía podía.",
        reply: [
          "Nueve horas seguidas, y en la playa.",
          "Lejos de la oficina, el sueño volvió como si te hubiera estado esperando. Quizás no era que no pudieras dormir, sino que nunca había espacio. Vale la pena guardar cómo se sintió este fin de semana.",
          ["¿Qué fue distinto en la playa?", "¿Qué de ese descanso podrías traer a la semana?"],
          "El descanso a veces solo necesita espacio.",
        ],
      },
    ],
  },
  {
    ago: 200,
    notes: [
      {
        at: "21:20",
        mood: "cansancio",
        tag: "Trabajo",
        text: "La vuelta fue dura. Ciento veinte correos sin leer. Ya no me acuerdo de la playa.",
        reply: [
          "La playa duró menos que los correos.",
          "Volviste a ciento veinte correos y el descanso se borró rápido. Es frustrante que algo tan bueno se apague en un solo día. Lo que viviste allá sigue siendo tuyo, aunque hoy se sienta lejos.",
          ["¿Cuál de esos correos era de verdad urgente?", "¿Qué recuerdo de la playa quieres guardar?"],
          "Lo que descansaste no se pierde del todo.",
        ],
      },
    ],
  },
  {
    ago: 193,
    notes: [
      {
        at: "20:50",
        mood: "gratitud",
        tag: "Familia",
        text: "Mi mamá me regaló una planta para el escritorio. Dice que tengo cara de necesitar algo verde.",
        reply: [
          "Algo verde para el escritorio.",
          "Tu mamá vio en tu cara lo que quizás no le dijiste, y respondió con una planta. Es un cuidado pequeño y muy concreto. Se nota que te tocó.",
          ["¿Dónde la vas a poner?", "¿Cómo te sentiste al recibirla?"],
          "Los cuidados pequeños también se notan.",
        ],
      },
    ],
  },
  // Mayo
  {
    ago: 180,
    notes: [
      {
        at: "22:10",
        mood: "reflexion",
        tag: "Yo",
        text: "Cumplí treinta y cuatro. Pensé en qué quería a los treinta y en qué tengo. No es tan distinto. Solo que estoy más cansada.",
        reply: [
          "Treinta y cuatro, y una mirada honesta.",
          "Miraste hacia atrás y viste que lo que querías y lo que tienes no están tan lejos. Lo que cambió es el cansancio con que lo cargas. Eso también se puede mirar con calma.",
          ["¿Qué quieres que sea distinto a los treinta y cinco?", "¿Qué de lo que tienes te gusta de verdad?"],
          "Ver lo que se tiene también es un regalo.",
        ],
      },
    ],
  },
  {
    ago: 171,
    notes: [
      {
        at: "21:35",
        mood: "alegria",
        tag: "Amistades",
        text: "Andrea organizó una cena por mi cumpleaños, tarde pero con todos. Me sentí querida.",
        reply: [
          "Tarde, pero con todos.",
          "Andrea reunió a tu gente para celebrarte, y te sentiste querida. Dejarse celebrar no siempre es fácil para quien suele organizar. Qué bueno que esta vez te tocó recibir.",
          ["¿Qué momento de la cena quieres recordar?", "¿Cómo se sintió no ser la que organiza?"],
          "Recibir también se aprende.",
        ],
      },
    ],
  },
  {
    ago: 163,
    notes: [
      {
        at: "23:15",
        mood: "ansiedad",
        tag: "Trabajo",
        text: "Reestructuración en el área. Nadie sabe nada. Todos miran el correo con miedo.",
        reply: [
          "Cuando nadie sabe nada, todo pesa más.",
          "La incertidumbre se instaló en la oficina y cada correo parece una noticia posible. Es difícil trabajar así. Lo que sientes es una respuesta normal a no saber qué viene.",
          ["¿Qué sí depende de ti esta semana?", "¿Con quién puedes hablar de esto fuera del trabajo?"],
          "No saber cansa tanto como saber.",
        ],
      },
    ],
  },
  // Junio
  {
    ago: 150,
    notes: [
      {
        at: "20:00",
        mood: "paz",
        tag: "Trabajo",
        text: "Me quedo en el puesto. Respiré por primera vez en semanas.",
        reply: [
          "Respiraste por primera vez en semanas.",
          "La incertidumbre terminó y el cuerpo por fin pudo soltar. Semanas de tensión no se van en un minuto, pero hoy hubo alivio. Date tiempo para sentirlo.",
          ["¿Qué te gustaría hacer con este alivio?", "¿Qué aprendiste de estas semanas?"],
          "El alivio también necesita su tiempo.",
        ],
      },
    ],
  },
  {
    ago: 141,
    notes: [
      {
        at: "22:40",
        mood: "tristeza",
        tag: "Familia",
        text: "Mi abuela está en el hospital. Fui a verla y no me reconoció un rato.",
        private: true,
      },
    ],
  },
  {
    ago: 136,
    notes: [
      {
        at: "21:00",
        mood: "gratitud",
        tag: "Familia",
        text: "Mi abuela salió del hospital. Me pidió que le peinara el pelo como cuando era niña.",
        reply: [
          "Peinarla como cuando eras niña.",
          "Tu abuela volvió a casa y te pidió un gesto que viene de muy lejos. Es un momento tierno después de días difíciles. Vale la pena guardarlo.",
          ["¿Qué recuerdas de esos días de niña?", "¿Cómo te sientes ahora que está en casa?"],
          "Algunos gestos guardan toda una historia.",
        ],
      },
    ],
  },
  {
    ago: 130,
    notes: [
      {
        at: "22:25",
        mood: "reflexion",
        tag: "Yo",
        text: "Releí lo que escribí en diciembre. Sigo diciendo que estoy cansada. Quizás hay algo que no estoy viendo.",
        reply: [
          "Releíste diciembre y algo se repite.",
          "Volviste a tus notas y encontraste la misma palabra meses después. Darte cuenta de eso no es fallar, es empezar a mirar. A veces lo que se repite está pidiendo atención.",
          ["¿Qué crees que no estás viendo?", "¿Qué cambió y qué no desde diciembre?"],
          "Lo que se repite también está hablando.",
        ],
      },
    ],
  },
  // Julio
  {
    ago: 120,
    notes: [
      {
        at: "21:30",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Me dieron el cierre de otra área además del mío. Dije que sí. Otra vez.",
        reply: [
          "Otra vez el sí.",
          "Te sumaron otro cierre y aceptaste, y lo escribiste con un otra vez que pesa. Ya lo reconoces cuando pasa. Quizás la próxima vez puedas darte un momento antes de responder.",
          ["¿Qué te habría costado decir que no?", "¿Qué necesitarías para pedir un minuto?"],
          "Reconocer el patrón ya es moverse.",
        ],
      },
    ],
  },
  {
    ago: 110,
    notes: [
      {
        at: "20:10",
        mood: "alegria",
        tag: "Pareja",
        text: "Diego aprendió a hacer arepas como las de mi abuela. Casi lloro.",
        reply: [
          "Arepas como las de tu abuela.",
          "Diego aprendió algo que te une con tu familia, y te llegó muy hondo. Es una forma de decir te veo sin palabras. Qué lindo que te emocionara así.",
          ["¿Qué sentiste al probarlas?", "¿Qué te gustaría contarle a tu abuela?"],
          "El cariño también se cocina.",
        ],
      },
    ],
  },
  {
    ago: 101,
    notes: [
      {
        at: "23:30",
        mood: "cansancio",
        tag: "Yo",
        text: "Hace semanas que no escribo. Creo que dejé de abrir esto. No tengo energía ni para eso.",
        reply: [
          "Volviste, aunque sea para decir que no puedes.",
          "Pasaron semanas y la energía no alcanzaba ni para escribir. Aun así abriste el diario para contarlo. No tienes que escribir todos los días para que esto siga siendo tuyo.",
          ["¿Qué te quita más energía en estos días?", "¿Qué te gustaría que fuera distinto en agosto?"],
          "El diario espera, sin apuro.",
        ],
      },
    ],
  },
];
