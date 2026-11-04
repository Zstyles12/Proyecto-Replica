// El Service Worker (public/sw.js): el recordatorio diario en todas las versiones, y guardar los
// archivos de la web para abrir sin conexión solo en la publicada (en desarrollo rompería la recarga).

let registering: Promise<ServiceWorkerRegistration | null> | null = null;

export function serviceWorkerSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator && window.isSecureContext;
}

export function registerServiceWorker() {
  if (registering) return registering;
  registering = serviceWorkerSupported()
    ? navigator.serviceWorker
        .register(import.meta.env.PROD ? "/sw.js?cache=1" : "/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .catch(() => null)
    : Promise.resolve(null);
  return registering;
}
