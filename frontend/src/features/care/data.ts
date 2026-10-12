import type { Psychologist } from './types';

// Datos sintéticos: personas, licencias y enlaces de Meet inventados para desarrollo.
export const PSYCHOLOGISTS: Psychologist[] = [
  {
    id: 'psi-valeria',
    name: 'Valeria Rondón',
    title: 'Psicóloga clínica',
    specialties: ['Ansiedad', 'Autoestima', 'Estrés laboral'],
    approach: 'Terapia cognitivo-conductual',
    years: 9,
    bio: 'Acompaño a personas que sienten que la ansiedad les está ganando. Trabajo con herramientas concretas y a tu ritmo.',
    license: 'N.º 14.382',
    meetLink: 'https://meet.google.com/rpl-valr-ond',
    hours: [9, 15, 18],
  },
  {
    id: 'psi-andres',
    name: 'Andrés Mejía',
    title: 'Psicólogo',
    specialties: ['Duelo', 'Migración', 'Depresión'],
    approach: 'Terapia humanista',
    years: 12,
    bio: 'Me especializo en duelos y en los cambios grandes de la vida, incluido dejar tu país. Aquí puedes hablar sin prisa.',
    license: 'N.º 9.117',
    meetLink: 'https://meet.google.com/rpl-andr-mej',
    hours: [10, 14, 19],
  },
  {
    id: 'psi-camila',
    name: 'Camila Ferrer',
    title: 'Psicóloga',
    specialties: ['Pareja', 'Familia', 'Comunicación'],
    approach: 'Terapia sistémica',
    years: 7,
    bio: 'Trabajo con vínculos: pareja, familia y las conversaciones difíciles que a veces evitamos.',
    license: 'N.º 18.905',
    meetLink: 'https://meet.google.com/rpl-cami-fer',
    hours: [11, 16, 20],
  },
  {
    id: 'psi-luis',
    name: 'Luis Arévalo',
    title: 'Psicólogo clínico',
    specialties: ['Ansiedad', 'Sueño', 'Hábitos'],
    approach: 'Terapia de aceptación y compromiso',
    years: 15,
    bio: 'Ayudo a construir hábitos que sostengan tu bienestar, sobre todo cuando el estrés no te deja descansar.',
    license: 'N.º 6.540',
    meetLink: 'https://meet.google.com/rpl-luis-are',
    hours: [8, 13, 17],
  },
];

export function findPsychologist(id: string | undefined) {
  return PSYCHOLOGISTS.find((p) => p.id === id) ?? null;
}

// Respuestas simuladas mientras no exista el chat real.
export const SIMULATED_REPLIES = [
  'Gracias por contármelo. ¿Quieres que lo retomemos en nuestra próxima sesión?',
  'Te leo. Si te ayuda, escríbelo también en tu diario y lo miramos juntos.',
  'Entiendo. ¿Cómo te sientes ahora mismo, mientras me lo cuentas?',
  'Tiene sentido lo que dices. Vamos paso a paso.',
];
