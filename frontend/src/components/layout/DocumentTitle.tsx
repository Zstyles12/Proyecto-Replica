import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// El título de la pestaña cambia con la sección (DESIGN-WEB.md §9): ayuda a encontrarla entre otras
// pestañas, en el historial y con lector de pantalla. Inicio y el registro dicen "Replica · Tu diario".
const HOME = "Replica · Tu diario";

const TITLES: [RegExp, string][] = [
  [/^\/notas\/[^/]+$/, "Nota"],
  [/^\/notas$/, "Notas"],
  [/^\/replica-dia\//, "Tu día"],
  [/^\/evolucion$/, "Evolución"],
  [/^\/chat\/directorio$/, "Psicólogos"],
  [/^\/chat$/, "Chat"],
  [/^\/psicologo\//, "Psicólogo"],
  [/^\/usuario\/psicologo$/, "Soy psicólogo"],
  [/^\/usuario$/, "Usuario"],
  [/^\/cofre$/, "Mi cofre"],
  [/^\/legal\/terminos$/, "Términos"],
  [/^\/legal\/privacidad$/, "Privacidad"],
];

export function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = TITLES.find(([re]) => re.test(pathname));
    document.title = match ? `${match[1]} · Replica` : HOME;
  }, [pathname]);
  return null;
}
