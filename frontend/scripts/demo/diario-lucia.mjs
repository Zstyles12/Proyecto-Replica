// El diario de Lucía Méndez, la persona de la demostración: unos tres meses de notas con sus réplicas,
// escritas a mano en la voz de Replica (docs/DESIGN.md §9). Todo es ficticio. Cada día se cuenta hacia
// atrás desde el día en que corre el script (`ago`), así que nunca nombra fechas ni días de la semana.
//
// Nota: { at, mood, tag, text, private?, favorite?, saved?, reply? }
//   reply: [titular, cuerpo, [pregunta, pregunta], aprendizaje]   (la réplica al momento)
// Día: { ago, notes, day? }
//   day: [titular, cuerpo, [pregunta, pregunta], aprendizaje, [comentario por nota no privada]]

export const DAYS = [
  {
    ago: 92,
    notes: [
      {
        at: "22:15",
        mood: "cansancio",
        tag: "Yo",
        text: "Primera vez que escribo en un diario desde el colegio. Hoy cerramos el mes en la oficina y salí a las nueve. Me duele el cuello y aun así no puedo dormir. Quiero entender por qué me canso tanto.",
        reply: [
          "Lucía, empezaste por la pregunta que más te importa.",
          "Escribes que te cansas tanto que el cuerpo duele y el sueño no llega. Es mucho para un solo día, y aun así te sentaste a escribirlo. Aquí no hace falta tener la respuesta todavía.",
          ["¿Qué parte del día te deja más agotada?", "¿Cuándo fue la última vez que descansaste sin culpa?"],
          "Preguntarse por el cansancio ya es empezar a escucharlo.",
        ],
      },
    ],
  },
  {
    ago: 91,
    notes: [
      {
        at: "20:40",
        mood: "ansiedad",
        tag: "Trabajo",
        text: "Mi jefe pidió el informe para mañana temprano, otra vez sin avisar. Lo terminé, pero me quedé con el pecho apretado toda la tarde. Odio sentir que todo es urgente.",
        reply: [
          "Cuando todo es urgente, el pecho lo sabe primero.",
          "Terminaste el informe, y aun así el apretón se quedó contigo toda la tarde. Parece que lo pesado no fue el trabajo, sino la sensación de no poder pararlo. Eso también cuenta como esfuerzo.",
          ["¿Qué pasaría si algo no fuera urgente esta semana?", "¿Dónde sientes el apretón cuando llega?"],
          "Terminar algo no siempre apaga la urgencia que dejó.",
        ],
      },
    ],
  },
  {
    ago: 89,
    notes: [
      {
        at: "07:30",
        mood: "cansancio",
        tag: "Salud",
        text: "Dormí cuatro horas. Me desperté a las tres pensando en las conciliaciones del banco y ya no pude volver a dormir.",
        reply: [
          "Las tres de la mañana no son buena hora para el banco.",
          "Cuatro horas de sueño y la cabeza ya en las conciliaciones. Se nota que el trabajo te acompaña incluso antes de que empiece el día. Hoy quizás baste con ir un poco más despacio.",
          ["¿Qué te gustaría dejar fuera de la cama esta noche?", "¿Hay alguna tarea que puedas soltar hoy?"],
          "El trabajo puede esperar a que amanezca.",
        ],
      },
      {
        at: "22:10",
        mood: "alegria",
        tag: "Amistades",
        text: "Mariela me sacó a comer arepas después del trabajo. Me reí tanto que se me olvidó el banco por dos horas.",
      },
    ],
    day: [
      "Un día que empezó a las tres y terminó riendo.",
      "Lucía, hoy pasaste del insomnio a la risa en el mismo día. Las dos cosas son verdad: el cansancio de la mañana y el alivio de la noche con Mariela. Vale la pena mirar qué te dio esa pausa.",
      ["¿Qué tiene Mariela que te ayuda a soltar?", "¿Cómo podrías regalarte otra pausa así esta semana?"],
      "Dos horas de risa también descansan.",
      ["Escribirlo temprano ya fue una forma de sacarlo de la cabeza.", "Se nota el cambio: aquí el banco ya no aparece."],
    ],
  },
  {
    ago: 87,
    notes: [
      {
        at: "23:05",
        mood: "tristeza",
        tag: "Pareja",
        favorite: true,
        text: "Diego canceló la cena otra vez por su trabajo. Le dije que no pasaba nada, pero sí pasaba. Me quedé viendo series sola.",
        reply: [
          "Decir que no pasaba nada cuando sí pasaba.",
          "Escribes que le dijiste a Diego que todo estaba bien, aunque no lo estaba. A veces callamos para no sumar peso, y el peso se queda con nosotras. Aquí puedes decirlo tal como fue.",
          ["¿Qué te habría gustado decirle en ese momento?", "¿Qué necesitabas de esa cena?"],
          "Lo que se calla también se siente.",
        ],
      },
    ],
  },
  {
    ago: 86,
    notes: [
      {
        at: "00:40",
        mood: "tristeza",
        tag: "Pareja",
        private: true,
        text: "No sé si Diego y yo queremos lo mismo. Me da miedo escribirlo.",
      },
    ],
  },
  {
    ago: 84,
    notes: [
      {
        at: "21:20",
        mood: "reflexion",
        tag: "Yo",
        saved: true,
        text: "Pensé en por qué me cuesta tanto decir que no. En la casa siempre fui la que resolvía. Ahora en la oficina también.",
        reply: [
          "La que resuelve también necesita que la resuelvan.",
          "Notas un hilo entre la Lucía de la casa y la de la oficina: la que siempre resuelve. Verlo así ya es mirar de dónde viene el cansancio. No tienes que cambiarlo de golpe para entenderlo.",
          ["¿Qué pasaría si un día no fueras tú quien lo resuelve?", "¿Quién te cuida a ti cuando todo se complica?"],
          "Ver de dónde viene un hábito ya lo cambia un poco.",
        ],
      },
    ],
  },
  {
    ago: 82,
    notes: [
      {
        at: "19:50",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Semana de cierre. Almorcé frente a la computadora los cinco días. No tengo nada más que decir, solo quería dejarlo aquí.",
        reply: [
          "Cinco almuerzos frente a la pantalla.",
          "Dejarlo aquí, aunque sea en dos líneas, es una forma de no cargarlo sola. La semana de cierre pidió mucho de ti. Que ahora no tengas más que decir también está bien.",
          ["¿Qué te gustaría hacer este fin de semana solo para ti?", "¿Cómo se siente tu cuerpo ahora que la semana termina?"],
          "A veces basta con dejarlo escrito.",
        ],
      },
    ],
  },
  {
    ago: 81,
    notes: [
      {
        at: "10:30",
        mood: "paz",
        tag: "Familia",
        favorite: true,
        text: "Sábado sin alarma. Desayuné en el balcón con Sofi y leímos cada una su libro sin hablar. Fue perfecto.",
        reply: [
          "Un desayuno en silencio que no pedía nada.",
          "Sin alarma, con Sofi y un libro cada una. Hay una calma en lo que describes que vale la pena guardar. Recordar que esto también es posible ayuda en las semanas difíciles.",
          ["¿Qué hizo que esta mañana se sintiera tan bien?", "¿Cómo podrías traer un poco de este balcón a un día de semana?"],
          "La calma también cabe en un sábado cualquiera.",
        ],
      },
    ],
  },
  {
    ago: 79,
    notes: [
      {
        at: "08:15",
        mood: "ansiedad",
        tag: "Dinero",
        text: "Llegó el recibo del condominio más alto de lo que pensaba. Sofi todavía no consigue trabajo y yo cubro casi todo.",
        reply: [
          "El recibo llegó con más peso que números.",
          "Cubrir casi todo mientras Sofi busca trabajo es mucho para una sola persona. Escribes el monto, pero se lee también la preocupación de sostener la casa. Esa preocupación tiene sentido.",
          ["¿Qué parte de esto te gustaría conversar con Sofi?", "¿Qué te preocupa más: el dinero o hacerlo sola?"],
          "Sostener la casa sola cansa más que cualquier recibo.",
        ],
      },
      {
        at: "21:30",
        mood: "reflexion",
        tag: "Familia",
        text: "Hablé con Sofi del dinero sin pelear. Me dijo que va a buscar algo de medio tiempo. Me sentí menos sola en esto.",
      },
    ],
    day: [
      "De cargar el recibo a compartirlo.",
      "Lucía, en la mañana el dinero era algo que cargabas sola, y en la noche ya era una conversación con Sofi. No se resolvió todo, pero cambió cómo lo llevas. Eso no es poca cosa.",
      ["¿Cómo te sentiste al hablarlo sin pelear?", "¿Qué otra cosa te gustaría dejar de cargar sola?"],
      "Hablarlo a tiempo aligera el peso.",
      ["Nombraste lo que más pesaba: hacerlo sola.", "Menos sola: esas dos palabras dicen mucho del día."],
    ],
  },
  {
    ago: 77,
    notes: [
      {
        at: "20:05",
        mood: "ansiedad",
        tag: "Salud",
        text: "Me dio un dolor de cabeza fortísimo en la oficina. Fui al médico y dijo que es tensión. Me mandó a descansar y a tomar agua. Me reí, como si fuera fácil.",
        reply: [
          "Descansar suena fácil hasta que hay que hacerlo.",
          "El médico dijo tensión y descanso, y tú te reíste porque sabes lo difícil que es. Es una risa que dice mucho de cómo vienen estas semanas. El cuerpo está pidiendo algo que todavía no encuentra lugar.",
          ["¿Qué haría falta para que descansar no fuera un chiste?", "¿Qué te dice tu cuerpo que tu agenda no escucha?"],
          "El cuerpo avisa antes de que la agenda entienda.",
        ],
      },
    ],
  },
  {
    ago: 75,
    notes: [
      {
        at: "18:45",
        mood: "gratitud",
        tag: "Amistades",
        favorite: true,
        saved: true,
        text: "Mariela me mandó un audio larguísimo solo para preguntar cómo seguía la cabeza. Tengo buena gente cerca.",
        reply: [
          "Un audio larguísimo para preguntar por ti.",
          "Que Mariela se tome el tiempo de preguntarte cómo sigues dice que importas. Y que tú lo notes y lo escribas dice que también sabes recibirlo. Eso no siempre es fácil para quien suele resolverlo todo.",
          ["¿Cómo te sentiste al escucharla?", "¿A quién más tienes cerca que te cuida así?"],
          "Dejarse cuidar también se aprende.",
        ],
      },
    ],
  },
  {
    ago: 73,
    notes: [
      {
        at: "21:00",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Otra vez me quedé hasta tarde. Mi compañero Luis se fue a las cinco y nadie le dijo nada. Yo no me atrevo.",
        reply: [
          "Irse a las cinco, y que nadie diga nada.",
          "Notas que Luis se va a su hora sin que pase nada, y tú no te atreves. Esa diferencia parece decir más de lo que te exiges que de lo que te piden. Vale la pena mirarla con calma.",
          ["¿Qué crees que pasaría si un día te fueras a tu hora?", "¿De quién es la voz que te dice que te quedes?"],
          "A veces la exigencia más fuerte es la propia.",
        ],
      },
    ],
  },
  {
    ago: 71,
    notes: [
      {
        at: "12:40",
        mood: "tristeza",
        tag: "Familia",
        text: "Mamá llamó para decir que la van a operar de la rodilla el mes que viene. Ella dice que no es nada. Yo ya estoy pensando en cómo pedir días en el trabajo.",
        reply: [
          "Ella dice que no es nada, y tú ya estás organizando.",
          "Mamá le quita peso a la operación, y tú ya piensas en cómo pedir días. Es tu manera de cuidar: adelantarte. Detrás de esa organización también puede haber preocupación, y está bien sentirla.",
          ["¿Qué sentiste cuando te lo contó?", "¿Qué necesitarías para estar tranquila el mes que viene?"],
          "Organizar también es una forma de preocuparse.",
        ],
      },
      {
        at: "20:00",
        mood: "ansiedad",
        tag: "Familia",
        private: true,
        text: "Tengo miedo de que algo salga mal en la operación y yo esté lejos.",
      },
      {
        at: "22:30",
        mood: "reflexion",
        tag: "Yo",
        text: "Me di cuenta de que lo primero que pensé fue en el trabajo, no en mamá. Eso me dejó pensando.",
      },
    ],
    day: [
      "Del calendario a la pregunta de fondo.",
      "Lucía, hoy empezaste pensando en días libres y terminaste preguntándote por qué fue lo primero que pensaste. Esa pregunta no tiene que doler: muestra cuánto espacio ocupa el trabajo en tu cabeza. Mirarla ya es abrir un poco ese espacio.",
      ["¿Qué te gustaría pensar primero la próxima vez?", "¿Qué lugar quieres que tenga el trabajo en tu vida?"],
      "Notarlo es el primer paso para cambiar el orden.",
      ["Adelantarte fue tu forma de cuidarla.", "Una pregunta honesta, sin juicio: vale la pena seguirla."],
    ],
  },
  {
    ago: 68,
    notes: [
      {
        at: "06:50",
        mood: "paz",
        tag: "Salud",
        favorite: true,
        text: "Probé salir a caminar a las seis de la mañana por la urbanización. Todo estaba callado. Volví con hambre y de buen humor.",
        reply: [
          "Una caminata callada antes de que el día empiece.",
          "Salir a las seis, con todo en silencio, y volver con hambre y buen humor. Se lee como un rato que fue completamente tuyo. Tal vez valga la pena repetirlo sin convertirlo en obligación.",
          ["¿Qué notaste en el camino que te gustó?", "¿Cómo cambió el resto del día después de caminar?"],
          "Un rato propio cambia el tono del día.",
        ],
      },
    ],
  },
  {
    ago: 66,
    notes: [
      {
        at: "23:20",
        mood: "alegria",
        tag: "Pareja",
        saved: true,
        text: "Diego apareció con helado sin avisar y vimos una película mala. Hablamos de lo de la cena. Me pidió perdón y yo le dije cómo me había sentido.",
        reply: [
          "Esta vez dijiste cómo te habías sentido.",
          "Le contaste a Diego cómo te sentiste y él te pidió perdón. Decir lo que nos dolió no siempre es fácil, y aquí pasó entre helado y una película mala. A veces las conversaciones importantes llegan así, sin aviso.",
          ["¿Cómo fue decirlo en voz alta?", "¿Qué te gustaría cuidar de esta conversación?"],
          "Decir lo que sentiste abre espacio para los dos.",
        ],
      },
    ],
  },
  {
    ago: 64,
    notes: [
      {
        at: "21:35",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Auditoría la semana que viene. Ya siento el cansancio antes de empezar.",
        reply: [
          "Cansada antes de empezar.",
          "La auditoría todavía no llega y el cansancio ya está aquí. Anticipar lo pesado también agota, a veces tanto como hacerlo. Quizás hoy no toque prepararse, sino guardar fuerzas.",
          ["¿Qué es lo que más te preocupa de la auditoría?", "¿Qué podrías hacer hoy para llegar con más energía?"],
          "Anticipar el cansancio también cansa.",
        ],
      },
    ],
  },
  {
    ago: 62,
    notes: [
      {
        at: "20:15",
        mood: "ansiedad",
        tag: "Trabajo",
        saved: true,
        text: "Primer día de auditoría. Encontraron un error en una cuenta que llevé yo. Me sentí la peor contadora del mundo, aunque se corrigió en diez minutos.",
        reply: [
          "Un error de diez minutos y un juicio de todo el día.",
          "El error se corrigió en diez minutos, pero el juicio sobre ti misma se quedó mucho más. Eres muy dura contigo cuando algo sale mal. Un error en una cuenta no dice quién eres como contadora.",
          ["¿Qué le dirías a un compañero que cometiera el mismo error?", "¿Qué hiciste bien hoy, además de corregirlo?"],
          "Un error no resume lo que sabes hacer.",
        ],
      },
    ],
  },
  {
    ago: 60,
    notes: [
      {
        at: "17:30",
        mood: "alegria",
        tag: "Trabajo",
        text: "Terminó la auditoría. Cero observaciones graves. Mi jefe me dijo \"buen trabajo\" en el pasillo y casi lloro.",
        reply: [
          "Un buen trabajo dicho en el pasillo.",
          "Cero observaciones graves y un reconocimiento que casi te hace llorar. Se nota cuánto necesitabas escucharlo después de estas semanas. Ese casi llanto también es alivio.",
          ["¿Qué te hizo sentir más orgullosa de estas semanas?", "¿Cómo te gustaría reconocerte tú misma?"],
          "El alivio también llega con lágrimas.",
        ],
      },
      {
        at: "21:00",
        mood: "gratitud",
        tag: "Yo",
        text: "Me compré un cuaderno nuevo para celebrar. Pequeña celebración, pero mía.",
      },
    ],
    day: [
      "Una celebración pequeña, pero tuya.",
      "Lucía, hoy terminaste la auditoría con buenas noticias y te diste un regalo para marcarlo. Es bonito ver que no esperaste a que otro celebrara por ti. Ese cuaderno guarda algo más que hojas.",
      ["¿Qué te gustaría escribir en ese cuaderno?", "¿Qué otras celebraciones pequeñas te debes?"],
      "Celebrarse también es una forma de descansar.",
      ["Ese reconocimiento te llegó hondo, y se nota por qué.", "Pequeña, pero mía: una manera hermosa de nombrarlo."],
    ],
  },
  {
    ago: 58,
    notes: [
      {
        at: "07:05",
        mood: "paz",
        tag: "Salud",
        favorite: true,
        text: "Volví a caminar. Tercera vez esta semana. No es disciplina, es que me gusta cómo se ve el cerro a esa hora.",
        reply: [
          "No es disciplina, es el cerro a esa hora.",
          "Caminas porque te gusta lo que ves, no porque debas. Esa diferencia es importante: lo que se disfruta se queda más fácil. El cerro parece haberse vuelto un pequeño refugio.",
          ["¿Qué sientes al ver el cerro a esa hora?", "¿Qué otras cosas haces porque te gustan, no porque debas?"],
          "Lo que se disfruta no necesita disciplina.",
        ],
      },
    ],
  },
  {
    ago: 56,
    notes: [
      {
        at: "22:00",
        mood: "ansiedad",
        tag: "Familia",
        text: "Llegué a Valencia para la operación de mamá. Ella está tranquila. Yo no. La casa huele igual que cuando era niña.",
        reply: [
          "Ella tranquila, tú no, en la casa de siempre.",
          "Llegaste a Valencia y encontraste a mamá en calma mientras tú cargas la preocupación. La casa con su olor de siempre también trae a la Lucía de antes, la que resolvía. Es normal que todo se mezcle.",
          ["¿Qué te trae ese olor de la casa?", "¿Qué necesitas tú mientras cuidas de ella?"],
          "Cuidar a otros no apaga la propia preocupación.",
        ],
      },
    ],
  },
  {
    ago: 55,
    notes: [
      {
        at: "10:00",
        mood: "gratitud",
        tag: "Familia",
        text: "La operación salió bien. El doctor dijo que en seis semanas camina normal. Lloré en el baño del hospital de puro alivio.",
        reply: [
          "Llorar de alivio en el baño del hospital.",
          "La operación salió bien y tu cuerpo soltó lo que venía guardando. Ese llanto parece haber esperado el momento seguro para salir. Hoy fue un día para respirar.",
          ["¿Qué sentiste justo cuando el doctor dio la noticia?", "¿Qué te gustaría decirle a tu mamá esta noche?"],
          "El alivio también necesita su espacio.",
        ],
      },
      {
        at: "23:10",
        mood: "cansancio",
        tag: "Salud",
        text: "Dormí un rato en la silla del hospital. Me duele todo, pero no me importa.",
      },
    ],
    day: [
      "Un día de alivio que terminó en una silla.",
      "Lucía, hoy empezaste con la mejor noticia y terminaste agotada en una silla del hospital. Dices que no te importa el dolor, y se entiende: el alivio pesa más. Aun así, tu cuerpo también hizo mucho hoy.",
      ["¿Cómo podrías descansar mañana, aunque sea un rato?", "¿Quién podría relevarte una noche?"],
      "Cuidar también cansa, aunque valga la pena.",
      ["Ese llanto tenía mucho guardado.", "Que no te importe el dolor no significa que no esté."],
    ],
  },
  {
    ago: 53,
    notes: [
      {
        at: "21:40",
        mood: "reflexion",
        tag: "Familia",
        favorite: true,
        saved: true,
        text: "Mamá me contó historias de cuando yo era chiquita mientras le cambiaba el hielo. Me dijo que siempre fui \"la responsable\". No sé si eso es un elogio.",
        reply: [
          "La responsable: ¿elogio o carga?",
          "Mamá te recordó que siempre fuiste la responsable, y tú te quedaste dudando de si eso es bueno. La pregunta es valiosa: a veces lo que nos elogian también nos encierra. No hace falta decidirlo hoy.",
          ["¿Qué te ha dado ser la responsable?", "¿Qué te ha quitado?"],
          "Un elogio también puede ser un peso.",
        ],
      },
    ],
  },
  {
    ago: 51,
    notes: [
      {
        at: "23:30",
        mood: "tristeza",
        tag: "Yo",
        private: true,
        text: "A veces siento que nadie me pregunta a mí cómo estoy.",
      },
    ],
  },
  {
    ago: 50,
    notes: [
      {
        at: "19:15",
        mood: "alegria",
        tag: "Familia",
        text: "Mamá dio sus primeros pasos con el andador. Hicimos una videollamada con Sofi y las tres nos reímos de cómo caminaba como pingüino.",
        reply: [
          "Tres risas y un pingüino con andador.",
          "Los primeros pasos de mamá, Sofi en la pantalla y las tres riéndose. Después de días de preocupación, esta escena se lee ligera. Es bonito que la recuperación también tenga humor.",
          ["¿Qué te gustó más de ese momento?", "¿Cómo te sientes ahora que la ves avanzar?"],
          "La risa también acompaña la recuperación.",
        ],
      },
    ],
  },
  {
    ago: 48,
    notes: [
      {
        at: "21:50",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Volví a Caracas. Cuarenta correos sin leer y mi jefe ya preguntando por el reporte trimestral. Siento que nunca me fui.",
        reply: [
          "Cuarenta correos y la sensación de no haberte ido.",
          "Volviste de cuidar a tu mamá y el trabajo te recibió como si nada hubiera pasado. Es normal que sientas el choque: vienes de días muy intensos. Quizás no tienes que ponerte al día en una sola tarde.",
          ["¿Qué es lo más urgente de verdad entre esos correos?", "¿Qué te trajiste de Valencia que quieras cuidar?"],
          "Volver no exige ponerse al día de golpe.",
        ],
      },
    ],
  },
  {
    ago: 46,
    notes: [
      {
        at: "23:55",
        mood: "ansiedad",
        tag: "Dinero",
        text: "Sumé los gastos del viaje y de las medicinas de mamá. Me asusté. Hice una tabla en Excel a medianoche, como buena contadora.",
        reply: [
          "Una tabla a medianoche para ordenar el susto.",
          "Sumaste los gastos, te asustaste y abriste Excel. Ordenar los números es tu forma de recuperar algo de control, y tiene sentido. Aun así, el susto también merece un lugar, no solo la tabla.",
          ["¿Qué te dijo la tabla cuando la terminaste?", "¿Con quién podrías hablar de estos gastos?"],
          "Ordenar ayuda, pero el susto también merece escucharse.",
        ],
      },
    ],
  },
  {
    ago: 45,
    notes: [
      {
        at: "20:30",
        mood: "reflexion",
        tag: "Dinero",
        favorite: true,
        saved: true,
        text: "Hablé con Sofi y con mi tía. Vamos a repartir los gastos de mamá entre las tres. No tenía que hacerlo todo yo.",
        reply: [
          "No tenías que hacerlo todo tú.",
          "Repartir los gastos entre las tres cambió cómo se ve el problema. Escribes la frase que parece haber estado esperando: no tenías que hacerlo todo. Esa idea quizás sirva también fuera del dinero.",
          ["¿Cómo te sentiste al pedir ayuda?", "¿Dónde más te gustaría repartir la carga?"],
          "Pedir ayuda también es resolver.",
        ],
      },
    ],
  },
  {
    ago: 43,
    notes: [
      {
        at: "18:20",
        mood: "paz",
        tag: "Pareja",
        text: "Caminata larga el domingo con Diego. Subimos hasta el mirador. Él no habló de trabajo ni una vez. Yo tampoco.",
        reply: [
          "Un domingo sin trabajo de por medio.",
          "Subieron al mirador y ninguno de los dos habló de trabajo. Se lee como un día en el que pudieron estar solo juntos. Esos domingos también construyen la relación.",
          ["¿De qué hablaron en lugar del trabajo?", "¿Qué te gustaría repetir de este domingo?"],
          "Estar juntos también es dejar el trabajo abajo.",
        ],
      },
    ],
  },
  {
    ago: 41,
    notes: [
      {
        at: "09:20",
        mood: "ansiedad",
        tag: "Trabajo",
        text: "Me ofrecieron coordinar el equipo de cuentas por pagar. Más sueldo, más responsabilidad. Dije que lo pensaría y me temblaban las manos.",
        reply: [
          "Más sueldo, más responsabilidad, y las manos temblando.",
          "Te ofrecieron coordinar el equipo y pediste tiempo para pensarlo. Que te tiemblen las manos no dice que no puedas, dice que te importa. Darte tiempo para decidir ya es cuidarte.",
          ["¿Qué parte de la propuesta te entusiasma?", "¿Qué es lo que más te asusta de aceptar?"],
          "El temblor también puede ser señal de que importa.",
        ],
      },
      {
        at: "22:00",
        mood: "reflexion",
        tag: "Yo",
        text: "Hice una lista de pros y contras. Los contras son casi todos miedos, no hechos.",
      },
    ],
    day: [
      "Los contras eran miedos, no hechos.",
      "Lucía, hoy recibiste una propuesta grande y, en la noche, descubriste algo sobre tus dudas: la mayoría son miedos. Separar lo que sientes de lo que pasa es un paso importante para decidir. No tienes que tener la respuesta todavía.",
      ["¿Qué miedo de la lista te gustaría mirar primero?", "¿Cómo decidirías si el miedo no estuviera?"],
      "No todo lo que asusta es un hecho.",
      ["Pedir tiempo fue una buena primera respuesta.", "Esa distinción entre miedos y hechos es muy valiosa."],
    ],
  },
  {
    ago: 39,
    notes: [
      {
        at: "19:00",
        mood: "alegria",
        tag: "Trabajo",
        favorite: true,
        text: "Acepté. Empiezo el lunes como coordinadora. Mi jefe me dijo que lo venían pensando hace meses.",
        reply: [
          "Lo venían pensando hace meses.",
          "Aceptaste, y además descubriste que te veían para ese puesto desde hace tiempo. A veces los demás ven antes lo que nosotras todavía dudamos. Hoy vale la pena quedarse un momento con eso.",
          ["¿Cómo te sentiste al escuchar que lo pensaban hace meses?", "¿Qué tipo de coordinadora te gustaría ser?"],
          "A veces otros ven antes lo que una todavía duda.",
        ],
      },
    ],
  },
  {
    ago: 36,
    notes: [
      {
        at: "21:15",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Primera semana como coordinadora. Todos me preguntan todo. Al final del día no me queda voz ni paciencia.",
        reply: [
          "Una semana en la que todos te preguntaron todo.",
          "La primera semana pidió mucho: respuestas, voz y paciencia. Es normal que al final del día no quede nada. Aprender un rol nuevo también cansa, aunque lo hayas elegido.",
          ["¿Qué pregunta te repitieron más esta semana?", "¿Qué necesitas para recuperar la voz este fin de semana?"],
          "Elegir algo no lo hace menos cansado.",
        ],
      },
    ],
  },
  {
    ago: 34,
    notes: [
      {
        at: "22:45",
        mood: "tristeza",
        tag: "Pareja",
        text: "Diego dice que desde el ascenso estoy distinta, que siempre hablo de la oficina. Me molestó porque tiene razón.",
        reply: [
          "Te molestó porque tenía razón.",
          "Diego notó que hablas mucho de la oficina, y te molestó reconocerlo. Escribirlo con esa honestidad dice mucho de ti. No hace falta castigarte por eso: el trabajo está ocupando mucho espacio estas semanas.",
          ["¿Qué te gustaría contarle a Diego que no sea de la oficina?", "¿Qué espacio quieres que tenga el trabajo en la relación?"],
          "Reconocer algo incómodo también es cuidarse.",
        ],
      },
    ],
  },
  {
    ago: 32,
    notes: [
      {
        at: "05:40",
        mood: "ansiedad",
        tag: "Salud",
        private: true,
        text: "Me desperté con el corazón acelerado otra vez. Creo que necesito hablar con alguien de verdad, no solo escribir.",
      },
    ],
  },
  {
    ago: 30,
    notes: [
      {
        at: "21:10",
        mood: "reflexion",
        tag: "Salud",
        saved: true,
        text: "Estuve viendo el directorio de psicólogos de Replica. Leí el perfil de Valeria tres veces. Habla de estrés laboral y de autoestima. Me da vergüenza pedirlo, pero creo que me haría bien.",
        reply: [
          "Leíste su perfil tres veces.",
          "Leer el perfil tres veces dice que algo te resonó. Pedir acompañamiento puede dar vergüenza, y aun así lo estás considerando porque intuyes que te haría bien. Esa intuición merece atención.",
          ["¿Qué te resonó de lo que leíste?", "¿Qué te diría la Lucía de dentro de unos meses sobre esta decisión?"],
          "Pedir ayuda no es fallar, es cuidarse.",
        ],
      },
    ],
  },
  {
    ago: 29,
    notes: [
      {
        at: "21:30",
        mood: "ansiedad",
        tag: "Yo",
        text: "Le escribí a Valeria. Ahora estoy esperando respuesta y reviso el teléfono cada cinco minutos.",
        reply: [
          "Escribir y esperar.",
          "Diste el paso de escribirle, y ahora la espera se siente larga. Revisar el teléfono es una forma de calmar la incertidumbre. Lo importante ya lo hiciste.",
          ["¿Cómo te sentiste justo después de enviarlo?", "¿Qué podrías hacer mientras esperas que te calme?"],
          "Lo difícil ya está hecho: pediste ayuda.",
        ],
      },
    ],
  },
  {
    ago: 28,
    notes: [
      {
        at: "12:30",
        mood: "alegria",
        tag: "Yo",
        text: "Valeria aceptó. Me escribió muy amable y quedamos en vernos por Meet. Siento un alivio raro.",
        reply: [
          "Un alivio raro después de un sí.",
          "Valeria aceptó y el alivio llegó, aunque se siente extraño. Tal vez es el alivio de no tener que seguir sola con todo esto. Darte ese espacio fue un regalo para ti.",
          ["¿Qué esperas de la primera sesión?", "¿Qué te gustaría contarle primero?"],
          "No tener que hacerlo sola también alivia.",
        ],
      },
    ],
  },
  {
    ago: 26,
    notes: [
      {
        at: "19:10",
        mood: "reflexion",
        tag: "Yo",
        text: "Primera sesión con Valeria. Hablamos de la Lucía responsable. Me hizo una pregunta que no supe responder: ¿qué haces tú solo por placer?",
        reply: [
          "Una pregunta que no supiste responder.",
          "En la primera sesión apareció de nuevo la Lucía responsable, y con ella una pregunta difícil: qué haces solo por placer. No saber responderla no es un fracaso, es un punto de partida. Las preguntas que incomodan suelen ser las que abren algo.",
          ["¿Qué te viene a la mente al pensar en placer?", "¿Qué hacías por gusto cuando eras más joven?"],
          "No saber la respuesta también es empezar.",
        ],
      },
      {
        at: "22:40",
        mood: "tristeza",
        tag: "Yo",
        text: "Sigo pensando en la pregunta. Hice una lista y solo puse caminar y leer. Me dio un poco de pena.",
      },
    ],
    day: [
      "Caminar y leer: un comienzo, no una pena.",
      "Lucía, hoy una pregunta te acompañó todo el día. La lista fue corta y te dio pena, pero caminar y leer ya son dos cosas tuyas, elegidas sin obligación. Desde ahí se puede seguir.",
      ["¿Qué tercera cosa te gustaría probar?", "¿Qué sientes cuando caminas o lees?"],
      "Una lista corta también es un comienzo.",
      ["Esa pregunta parece haber tocado algo importante.", "Dos cosas tuyas: ahí hay más de lo que parece."],
    ],
  },
  {
    ago: 25,
    notes: [
      {
        at: "20:30",
        mood: "paz",
        tag: "Yo",
        text: "Decidí compartir mi diario con Valeria. Mis notas privadas siguen siendo solo mías. Me da tranquilidad que ella sepa cómo voy entre sesión y sesión.",
        reply: [
          "Compartir lo que quieres, guardar lo que es tuyo.",
          "Decidiste compartir el diario con Valeria y te da tranquilidad que ella sepa cómo vas. Y las notas privadas siguen siendo solo tuyas. Elegir qué mostrar y qué guardar también es cuidarte.",
          ["¿Qué te gustaría que Valeria notara en tus notas?", "¿Cómo te sientes al tenerla cerca entre sesiones?"],
          "Elegir qué compartir también es cuidarse.",
        ],
      },
    ],
  },
  {
    ago: 23,
    notes: [
      {
        at: "18:50",
        mood: "gratitud",
        tag: "Familia",
        favorite: true,
        text: "Mamá ya camina sin andador. Me mandó un video subiendo las escaleras de la casa.",
        reply: [
          "Un video subiendo las escaleras.",
          "Mamá ya camina sin andador y quiso que lo vieras. Después de semanas de preocupación, este video se lee como un pequeño triunfo compartido. Tú también fuiste parte de esa recuperación.",
          ["¿Qué sentiste al verla subir?", "¿Qué te gustaría celebrar con ella?"],
          "Las recuperaciones también se comparten.",
        ],
      },
    ],
  },
  {
    ago: 22,
    notes: [
      {
        at: "20:20",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Reunión de tres horas que pudo ser un correo. Le dije a mi equipo que se fuera a su hora. Yo me quedé, claro.",
        reply: [
          "Le diste a tu equipo lo que todavía no te das.",
          "Le dijiste a tu equipo que se fuera a su hora, y tú te quedaste. Ese \"claro\" al final dice mucho. Cuidas a los demás con algo que todavía no te permites.",
          ["¿Qué pasaría si mañana te fueras tú también a tu hora?", "¿Qué te haría falta para darte el mismo permiso?"],
          "El permiso que das también puede ser para ti.",
        ],
      },
    ],
  },
  {
    ago: 20,
    notes: [
      {
        at: "13:15",
        mood: "alegria",
        tag: "Amistades",
        favorite: true,
        saved: true,
        text: "Ayer fue el cumpleaños de Mariela. Bailamos salsa hasta la una. No pensé en la oficina ni una vez.",
        reply: [
          "Salsa hasta la una y la oficina lejos.",
          "Bailaste hasta tarde en el cumpleaños de Mariela y la oficina no apareció. Se nota que esa noche fue completamente tuya. El cuerpo también descansa cuando baila.",
          ["¿Qué te hizo sentir más libre esa noche?", "¿Cuándo fue la última vez que bailaste así?"],
          "Bailar también es descansar.",
        ],
      },
    ],
  },
  {
    ago: 19,
    notes: [
      {
        at: "19:00",
        mood: "reflexion",
        tag: "Yo",
        text: "Segunda sesión. Hablamos de límites. Valeria me propuso practicar un no pequeño esta semana. Elegí no contestar correos después de las siete.",
        reply: [
          "Un no pequeño: correos hasta las siete.",
          "Elegiste un límite concreto y posible: no contestar correos después de las siete. Empezar por algo pequeño es una forma sabia de practicar. Lo importante no es hacerlo perfecto, sino notarlo.",
          ["¿Qué crees que te va a costar más de este límite?", "¿Cómo te gustaría usar el tiempo que ganes?"],
          "Los límites también se practican en pequeño.",
        ],
      },
      {
        at: "21:15",
        mood: "ansiedad",
        tag: "Trabajo",
        text: "Son las nueve y llegó un correo de mi jefe. No lo abrí. Me sudan las manos.",
      },
    ],
    day: [
      "El primer no costó, y aun así lo sostuviste.",
      "Lucía, hoy pusiste un límite y en la noche lo pusieron a prueba. Te sudaron las manos, pero no abriste el correo. Sostener un no incómodo también es avanzar, aunque no se sienta como un triunfo.",
      ["¿Qué pasó con esa ansiedad después de un rato?", "¿Qué te dirías mañana al ver ese correo?"],
      "Sostener un límite incomoda, y aun así se puede.",
      ["Elegiste un límite que puedes cumplir.", "No abrirlo, aun con las manos sudando, fue sostenerlo."],
    ],
  },
  {
    ago: 18,
    notes: [
      {
        at: "08:20",
        mood: "paz",
        tag: "Trabajo",
        favorite: true,
        saved: true,
        sharedInChat: true,
        text: "Abrí el correo de anoche hoy a las ocho. Era para preguntar algo que podía esperar al viernes. No se acabó el mundo.",
        reply: [
          "No se acabó el mundo.",
          "El correo podía esperar, y esperó. Descubrir que no se acabó el mundo es una experiencia valiosa para tu cuerpo, no solo para tu cabeza. La próxima vez quizás cueste un poco menos.",
          ["¿Qué aprendiste de este pequeño experimento?", "¿Qué otro límite te gustaría probar?"],
          "Lo que puede esperar, espera.",
        ],
      },
    ],
  },
  {
    ago: 16,
    notes: [
      {
        at: "21:00",
        mood: "tristeza",
        tag: "Familia",
        text: "Hoy hace cinco años que murió mi abuelo. Mamá llamó y lloramos juntas por teléfono. Lo extraño mucho.",
        reply: [
          "Cinco años, y lo sigues extrañando.",
          "Hoy fue un día para recordar a tu abuelo, y lo hiciste acompañada de tu mamá. Llorar juntas por teléfono es una forma de seguir queriéndolo. Extrañarlo dice cuánto significó para ti.",
          ["¿Qué recuerdo de él te gustaría guardar hoy?", "¿Qué te enseñó que todavía llevas contigo?"],
          "Extrañar es otra forma de seguir queriendo.",
        ],
      },
    ],
  },
  {
    ago: 15,
    notes: [
      {
        at: "23:15",
        mood: "reflexion",
        tag: "Pareja",
        private: true,
        text: "Pienso en si quiero vivir con Diego el año que viene. Todavía no estoy lista para decirlo en voz alta.",
      },
    ],
  },
  {
    ago: 13,
    notes: [
      {
        at: "22:30",
        mood: "gratitud",
        tag: "Pareja",
        text: "Le conté a Diego lo de los límites con los correos. Me dijo que se notaba, que estoy más presente. Cenamos sin teléfonos.",
        reply: [
          "Más presente, y él lo notó.",
          "Diego notó que estás más presente, y la cena sin teléfonos lo confirma. Los cambios pequeños que estás practicando también llegan a las personas que quieres. Eso vale la pena reconocerlo.",
          ["¿Qué sentiste cuando te dijo que se notaba?", "¿Qué más te gustaría cuidar de estos momentos?"],
          "Lo que cambias por dentro también se nota afuera.",
        ],
      },
    ],
  },
  {
    ago: 12,
    notes: [
      {
        at: "19:30",
        mood: "reflexion",
        tag: "Yo",
        text: "Tercera sesión. Valeria me preguntó qué diría la Lucía de hace tres meses si me viera ahora. Creo que no lo creería.",
        reply: [
          "La Lucía de hace tres meses no lo creería.",
          "La pregunta de Valeria te hizo mirar el camino recorrido. Que la Lucía de hace tres meses no lo creería dice que algo cambió de verdad. Vale la pena nombrar qué fue.",
          ["¿Qué es lo que más ha cambiado?", "¿Qué sigue igual y te gustaría cuidar?"],
          "Mirar atrás también muestra cuánto se avanzó.",
        ],
      },
      {
        at: "22:20",
        mood: "gratitud",
        tag: "Yo",
        text: "Leí mis notas de hace tres meses. Tanto cansancio. Me dieron ganas de abrazar a esa Lucía.",
      },
    ],
    day: [
      "Ganas de abrazar a la Lucía de antes.",
      "Lucía, hoy miraste hacia atrás dos veces: en la sesión y en tus notas. Lo que encontraste no fue juicio, sino ganas de abrazarte. Esa ternura hacia ti misma es algo nuevo en estas páginas.",
      ["¿Qué le dirías hoy a la Lucía de hace tres meses?", "¿Cómo podrías tratarte así esta semana?"],
      "La ternura hacia una misma también se aprende.",
      ["Esa pregunta abrió una mirada amplia sobre ti.", "Abrazar a la Lucía de antes es una forma de cuidarte ahora."],
    ],
  },
  {
    ago: 10,
    notes: [
      {
        at: "11:00",
        mood: "cansancio",
        tag: "Salud",
        text: "Gripe. Me quedé en cama y por primera vez avisé temprano que no iba. No me sentí culpable. Bueno, un poco.",
        reply: [
          "Avisar temprano, con solo un poco de culpa.",
          "Te enfermaste y avisaste temprano que no ibas, algo que antes quizás no hacías. Ese \"bueno, un poco\" es honesto: la culpa no desaparece de un día para otro. Hoy lo importante es descansar.",
          ["¿Qué necesitas para recuperarte estos días?", "¿Qué notas distinto en cómo lo manejaste?"],
          "Descansar cuando el cuerpo lo pide también es responsable.",
        ],
      },
    ],
  },
  {
    ago: 8,
    notes: [
      {
        at: "07:10",
        mood: "paz",
        tag: "Salud",
        favorite: true,
        text: "Volví a caminar después de la gripe. El cerro seguía ahí. Yo también.",
        reply: [
          "El cerro seguía ahí, y tú también.",
          "Volviste a caminar y encontraste el cerro de siempre. Esa frase final tiene algo de calma: también estás aquí, después de todo. A veces lo que permanece nos ayuda a sentirnos en casa.",
          ["¿Qué sentiste al volver a caminar?", "¿Qué otras cosas te hacen sentir en casa?"],
          "Volver también es una forma de llegar.",
        ],
      },
    ],
  },
  {
    ago: 7,
    notes: [
      {
        at: "08:45",
        mood: "ansiedad",
        tag: "Trabajo",
        text: "Hoy presento los resultados ante gerencia. Me preparé dos semanas. Igual siento que voy a olvidar todo.",
        reply: [
          "Dos semanas de preparación y el miedo a olvidarlo todo.",
          "Te preparaste dos semanas, y aun así el miedo dice que vas a olvidar todo. Ese miedo habla más de lo importante que es para ti que de lo que sabes. Lo que preparaste sigue ahí.",
          ["¿Qué es lo que más dominas de esa presentación?", "¿Qué te ayudaría a llegar más tranquila?"],
          "El miedo a olvidar no borra lo que sabes.",
        ],
      },
      {
        at: "17:40",
        mood: "alegria",
        tag: "Trabajo",
        text: "Salió bien. Hice una pregunta a gerencia que nadie se había atrevido a hacer y me dieron la razón.",
      },
    ],
    day: [
      "Del miedo a olvidarlo todo a hacer la pregunta difícil.",
      "Lucía, en la mañana temías olvidar todo, y en la tarde hiciste la pregunta que nadie se atrevía. El día muestra que el miedo y la confianza pueden convivir. Ese contraste vale la pena guardarlo.",
      ["¿Qué te dio el valor de hacer esa pregunta?", "¿Cómo quieres recordar este día?"],
      "El miedo y la confianza caben en el mismo día.",
      ["Prepararte fue tu forma de cuidarte.", "Atreverte a preguntar dice mucho de tu lugar en el equipo."],
    ],
  },
  {
    ago: 5,
    notes: [
      {
        at: "19:10",
        mood: "reflexion",
        tag: "Yo",
        favorite: true,
        saved: true,
        text: "Cuarta sesión. Hablamos de qué quiero para el próximo año, no en el trabajo, en mi vida. Me costó, pero dije: más tiempo para mí y aprender cerámica.",
        reply: [
          "Más tiempo para ti y aprender cerámica.",
          "Pensar en lo que quieres para tu vida, no solo para el trabajo, te costó, y aun así encontraste respuestas. La cerámica aparece como algo nuevo, elegido por gusto. Es bonito ver que la lista de placeres está creciendo.",
          ["¿Qué te atrae de la cerámica?", "¿Qué necesitarías para tener más tiempo para ti?"],
          "Lo que quieres para tu vida también merece planes.",
        ],
      },
    ],
  },
  {
    ago: 4,
    notes: [
      {
        at: "21:25",
        mood: "gratitud",
        tag: "Familia",
        text: "Sofi consiguió trabajo en una librería. Llegó saltando. Cenamos pizza para celebrar.",
        reply: [
          "Sofi llegó saltando.",
          "Sofi consiguió trabajo y lo celebraron con pizza. Después de meses sosteniendo la casa, esta noticia también es tuya. Se lee alegría compartida.",
          ["¿Qué sentiste al verla tan contenta?", "¿Cómo cambia esto la vida en casa?"],
          "Las alegrías de los que quieres también son tuyas.",
        ],
      },
    ],
  },
  {
    ago: 3,
    notes: [
      {
        at: "18:40",
        mood: "paz",
        tag: "Yo",
        text: "Me inscribí en un taller de cerámica los sábados. La primera clase es el próximo fin de semana.",
        reply: [
          "Un taller los sábados, solo para ti.",
          "Te inscribiste en cerámica, algo que hace poco era solo una idea. Pasar de la idea al hecho es un paso grande. Ese sábado ya es tuyo.",
          ["¿Qué esperas sentir en la primera clase?", "¿Qué te gustaría crear primero?"],
          "Las ideas también se vuelven sábados.",
        ],
      },
    ],
  },
  {
    ago: 2,
    notes: [
      {
        at: "20:50",
        mood: "cansancio",
        tag: "Trabajo",
        text: "Semana pesada de nuevo, cierre de mes. Pero me fui a las seis tres días. El cansancio es distinto, no me come.",
        reply: [
          "Un cansancio que ya no te come.",
          "El cierre de mes volvió a ser pesado, pero esta vez te fuiste a las seis tres días. Notas que el cansancio es distinto: está, pero no te consume. Esa diferencia habla de los límites que estás practicando.",
          ["¿Qué hizo posible irte a las seis?", "¿Qué te dice este cansancio distinto?"],
          "No todo cansancio pesa igual.",
        ],
      },
    ],
  },
  {
    ago: 1,
    notes: [
      {
        at: "07:10",
        mood: "paz",
        tag: "Pareja",
        text: "Caminé con Diego antes del trabajo. Hablamos de vivir juntos el año que viene. Lo dije en voz alta y no me dio miedo.",
        reply: [
          "Lo dijiste en voz alta y no te dio miedo.",
          "Caminando con Diego hablaron de vivir juntos, y pudiste decirlo sin miedo. Decir algo importante en voz alta cambia cómo se siente. Hoy empezó con una conversación que parece abrir camino.",
          ["¿Cómo te sentiste después de decirlo?", "¿Qué te gustaría construir con Diego?"],
          "Decirlo en voz alta lo vuelve más real.",
        ],
      },
      {
        at: "21:45",
        mood: "gratitud",
        tag: "Yo",
        text: "Pensé en todo lo que pasó en estos tres meses. Estoy cansada a veces, pero ya no estoy sola con eso.",
      },
    ],
    day: [
      "Cansada a veces, pero ya no sola.",
      "Lucía, hoy dijiste en voz alta algo que antes guardabas, y en la noche miraste todo el camino. Tu última frase lo resume con calma: el cansancio aparece, pero ya no lo cargas sola. Esa es una manera distinta de vivir lo mismo.",
      ["¿Quiénes te acompañan hoy que antes no estaban?", "¿Qué te gustaría recordar de estos tres meses?"],
      "No estar sola cambia el peso de todo.",
      ["Esa caminata trajo una conversación importante.", "Una mirada amplia y amable sobre estos meses."],
    ],
  },
];
