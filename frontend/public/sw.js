// El Service Worker de Replica (DESIGN-WEB.md §11). Dos trabajos:
//   1. El recordatorio diario (RF-53): muestra el aviso que llega por Web Push y abre Inicio al tocarlo.
//   2. Sin conexión (RNF-13), solo en la versión publicada (?cache=1): guarda los archivos de la web
//      para que abra sin red. Nunca guarda datos del diario: esos van en IndexedDB, por cuenta.

const CACHING = new URL(self.location.href).searchParams.get("cache") === "1";
const CACHE = "replica-web-v1";
const SHELL = "/index.html";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  if (!CACHING) return;
  // La lista de archivos del build la escribe vite.config.ts (precache.json).
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      const files = await fetch("/precache.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []);
      await cache.addAll([SHELL, "/tema.js", ...files.map((f) => `/${f}`)]).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE || !CACHING).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

if (CACHING) {
  self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Las páginas: primero la red, y sin red la última versión guardada.
    if (request.mode === "navigate") {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            if (response.ok) void caches.open(CACHE).then((cache) => cache.put(SHELL, copy));
            return response;
          })
          .catch(() => caches.match(SHELL).then((r) => r || Response.error()))
      );
      return;
    }

    // Los archivos con huella (assets/) no cambian: primero lo guardado.
    if (url.pathname.startsWith("/assets/") || url.pathname === "/tema.js" || /\.(png|svg|ico|woff2|mp3)$/.test(url.pathname)) {
      event.respondWith(
        caches.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((response) => {
              const copy = response.clone();
              if (response.ok) void caches.open(CACHE).then((cache) => cache.put(request, copy));
              return response;
            })
        )
      );
    }
  });
}

// El aviso: sin números, sin rachas y sin culpa.
self.addEventListener("push", (event) => {
  let data = { title: "Replica", body: "Tu hoja está aquí, si quieres escribir hoy.", url: "/" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // Un aviso sin datos usa el texto de siempre.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "replica-recordatorio",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => new URL(c.url).origin === self.location.origin);
      if (open) {
        void open.navigate(target).catch(() => {});
        return open.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
