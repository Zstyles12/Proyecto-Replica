import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Las fuentes viven en la propia web, no en Google Fonts: nadie más se entera de quién abre su diario
// (DESIGN-WEB.md §9). Solo los pesos que se usan y los caracteres latinos (el español y nombres propios).
import "@fontsource/alegreya/latin-400.css";
import "@fontsource/alegreya/latin-ext-400.css";
import "@fontsource/alegreya/latin-500.css";
import "@fontsource/alegreya/latin-ext-500.css";
import "@fontsource/alegreya/latin-400-italic.css";
import "@fontsource/alegreya/latin-ext-400-italic.css";
import "@fontsource/alegreya-sans/latin-400.css";
import "@fontsource/alegreya-sans/latin-ext-400.css";
import "@fontsource/alegreya-sans/latin-500.css";
import "@fontsource/alegreya-sans/latin-ext-500.css";
import "./index.css";
import { registerServiceWorker } from "./lib/serviceWorker";
import { dropLegacyData } from "./lib/storage";
import App from "./App.tsx";

// Los datos simulados de la primera versión de la web usaban otro modelo: se borran una vez.
dropLegacyData();
// El recordatorio y abrir sin conexión (DESIGN-WEB.md §11).
void registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
