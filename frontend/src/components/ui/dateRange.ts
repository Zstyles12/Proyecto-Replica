// Un rango de fechas en hora local, como `YYYY-MM-DD`; vacío quiere decir sin límite.
export type DateRange = { from: string; to: string };

// Si un día (`YYYY-MM-DD`, hora local) cae en el rango.
export function inRange(day: string, range: DateRange) {
  return (!range.from || day >= range.from) && (!range.to || day <= range.to);
}
