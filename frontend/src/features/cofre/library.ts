// Frases del día: aliento escrito para Replica y citas de autores cuya obra ya es de dominio público.
// Las citas van traducidas o adaptadas al español por nosotros, siempre con su autor.
// Para sumar frases, basta con agregarlas aquí con un id nuevo (el id no se reutiliza: guarda favoritos).

export type LibraryPhrase = {
  id: string;
  text: string;
  // Sin autor: es una frase de aliento de Replica.
  author?: string;
};

export const LIBRARY: LibraryPhrase[] = [
  { id: 'a01', text: 'No tienes que resolverlo todo hoy. Basta con el siguiente paso.' },
  { id: 'a02', text: 'Descansar también es avanzar.' },
  { id: 'a03', text: 'Lo que sientes es válido, aunque todavía no sepas nombrarlo.' },
  { id: 'a04', text: 'Hoy puedes tratarte con la misma ternura que a alguien que quieres.' },
  { id: 'a05', text: 'Pedir ayuda es un acto de valentía, no de debilidad.' },
  { id: 'a06', text: 'Un mal día no es una mala vida.' },
  { id: 'a07', text: 'Respira. Este momento también va a pasar.' },
  { id: 'a08', text: 'No necesitas ganarte el descanso.' },
  { id: 'a09', text: 'Está bien ir despacio.' },
  { id: 'a10', text: 'Tus límites cuidan lo que te importa.' },
  { id: 'a11', text: 'Poner en palabras lo que duele ya es empezar a aliviarlo.' },
  { id: 'a12', text: 'Lo pequeño que haces cada día también cuenta.' },
  { id: 'a13', text: 'Escúchate con la misma paciencia que les tienes a los demás.' },
  { id: 'a14', text: 'Cerrar un día difícil sin castigarte ya es un logro.' },
  { id: 'a15', text: 'La calma no se encuentra: se practica.' },
  { id: 'a16', text: 'Está bien no tener todas las respuestas.' },
  { id: 'a17', text: 'Agradecer algo pequeño cambia el tono del día.' },
  { id: 'a18', text: 'Tu valor no depende de lo productivo que fuiste hoy.' },
  { id: 'a19', text: 'Sentir mucho no es un defecto: es tu forma de estar en el mundo.' },
  { id: 'a20', text: 'Mañana es otra página en blanco.' },
  { id: 'a21', text: 'Lo que hoy pesa, mañana puede verse distinto.' },
  { id: 'a22', text: 'Decir que no a algo también es decir que sí a ti.' },
  { id: 'a23', text: 'Tienes permiso para empezar de nuevo, las veces que haga falta.' },
  { id: 'a24', text: 'Puedes cambiar la forma en que te hablas.' },
  { id: 'a25', text: 'No todo lo urgente es importante.' },
  { id: 'a26', text: 'Cuidarte no es egoísmo: es lo que te permite cuidar a otros.' },
  { id: 'a27', text: 'Hoy, con estar un poco más presente, alcanza.' },
  { id: 'a28', text: 'Nadie florece todo el año.' },

  { id: 'c01', text: 'No es que tengamos poco tiempo, es que perdemos mucho.', author: 'Séneca' },
  {
    id: 'c02',
    text: 'Sufrimos más en la imaginación que en la realidad.',
    author: 'Séneca',
  },
  { id: 'c03', text: 'Mientras vivas, sigue aprendiendo a vivir.', author: 'Séneca' },
  {
    id: 'c04',
    text: 'No nos inquietan las cosas, sino las opiniones que tenemos sobre ellas.',
    author: 'Epicteto',
  },
  {
    id: 'c05',
    text: 'Dite primero quién quieres ser; luego haz lo que tengas que hacer.',
    author: 'Epicteto',
  },
  { id: 'c06', text: 'El alma se tiñe del color de sus pensamientos.', author: 'Marco Aurelio' },
  { id: 'c07', text: 'Muy poco se necesita para tener una vida feliz.', author: 'Marco Aurelio' },
  {
    id: 'c08',
    text: 'No arruines lo que tienes deseando lo que no tienes.',
    author: 'Epicuro',
  },
  { id: 'c09', text: 'Un viaje de mil millas empieza con un solo paso.', author: 'Lao Tse' },
  { id: 'c10', text: 'Nadie se baña dos veces en el mismo río.', author: 'Heráclito' },
  {
    id: 'c11',
    text: 'Caminante, no hay camino, se hace camino al andar.',
    author: 'Antonio Machado',
  },
  { id: 'c12', text: 'Paciencia y barajar.', author: 'Miguel de Cervantes' },
  {
    id: 'c13',
    text: 'Hoy la tierra y los cielos me sonríen; hoy llega al fondo de mi alma el sol.',
    author: 'Gustavo Adolfo Bécquer',
  },
  {
    id: 'c14',
    text: 'La esperanza es esa cosa con plumas que se posa en el alma.',
    author: 'Emily Dickinson',
  },
];

export function findLibraryPhrase(id: string) {
  return LIBRARY.find((p) => p.id === id);
}

function dayNumber(date: Date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

// Un orden fijo pero mezclado (siempre el mismo), para que días seguidos no traigan frases parecidas.
const ORDER = (() => {
  const ids = LIBRARY.map((_, i) => i);
  let seed = 7;
  for (let i = ids.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
})();

// Las dos frases de hoy: iguales todo el día, distintas mañana. Recorren toda la biblioteca antes de repetir.
export function phrasesForDay(date = new Date(), count = 2): LibraryPhrase[] {
  const start = (dayNumber(date) * count) % ORDER.length;
  return Array.from({ length: count }, (_, i) => LIBRARY[ORDER[(start + i) % ORDER.length]]);
}
