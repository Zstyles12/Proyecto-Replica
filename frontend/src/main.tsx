import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { dropLegacyData } from "./lib/storage";
import App from "./App.tsx";

// Los datos simulados de la primera versión de la web usaban otro modelo: se borran una vez.
dropLegacyData();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
