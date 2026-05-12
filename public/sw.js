// FC Tracker Service Worker
// Permet l'installation PWA + cache basique

const CACHE_NAME = "fc-tracker-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/leaderboard",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/logo.svg",
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS_TO_CACHE).catch(() => {})
    )
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Network-first, fallback cache (pour Supabase real-time)
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes Supabase ou API
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("supabase.io")
  ) {
    return; // Laisser passer
  }

  // Pour le reste : network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache uniquement les GET 200
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
