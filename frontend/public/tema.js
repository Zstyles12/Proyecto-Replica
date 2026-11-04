// El tema guardado se aplica antes del primer dibujo para que no parpadee (hooks/useTheme.ts).
// Va en un archivo y no dentro de index.html para que la CSP no tenga que permitir scripts en línea.
try {
  var theme = localStorage.getItem("replica-theme");
  if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
} catch {}
