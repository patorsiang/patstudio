/*
 * Hand-written service worker. No dependency, no build step.
 *
 * Bump CACHE_VERSION when the caching logic changes. `activate` deletes every
 * cache whose name does not carry the current version, so a bump is the whole
 * eviction mechanism.
 *
 * Deliberately no skipWaiting: a new worker waits for tabs to close. Documents
 * are network-first, so content stays fresh regardless, and waiting avoids
 * swapping content-hashed chunks under a page that is already running.
 */
const CACHE_VERSION = "v1";
const SHELL_CACHE = `portfolio-shell-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

/**
 * The routes to precache come from the sitemap, which is already the single
 * source of truth for canonical routes and already has a test asserting every
 * URL in it returns 200. A hand-maintained list here would silently omit every
 * route added after it was written.
 *
 * Only the pathname is used. The sitemap holds absolute production URLs, so
 * fetching them literally from a preview deploy or localhost would cache the
 * live site as this origin's offline shell.
 */
async function precacheRoutes() {
  try {
    // Inside the try: caches.open rejects under private browsing and quota
    // exhaustion, and an uncaught rejection here fails install, which silently
    // disables the whole feature in exactly the modes you cannot reproduce
    // locally.
    const cache = await caches.open(SHELL_CACHE);

    await cache.addAll([OFFLINE_URL, "/"]);

    const response = await fetch("/sitemap.xml");
    if (!response.ok) return;

    const xml = await response.text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => {
        try {
          return new URL(match[1].trim()).pathname;
        } catch {
          return null;
        }
      })
      .filter((path) => path !== null);

    // Individually, so one 404 cannot fail the whole install.
    await Promise.all(paths.map((path) => cache.add(path).catch(() => {})));
  } catch {
    // A failed precache degrades the offline experience. It must never stop
    // the worker installing — runtime caching will fill in as the user browses.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheRoutes());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();

      await Promise.all(
        names
          .filter((name) => name.startsWith("portfolio-") && !name.endsWith(`-${CACHE_VERSION}`))
          .map((name) => caches.delete(name)),
      );

      await self.clients.claim();
    })(),
  );
});

const PAGE_CACHE = `portfolio-pages-${CACHE_VERSION}`;
const ASSET_CACHE = `portfolio-assets-${CACHE_VERSION}`;

/** Content-hashed by the build, so a cached entry can never be the wrong version. */
const isImmutableAsset = (url) => url.pathname.startsWith("/_next/static/");

/** Generated per request from query parameters — a cached copy is the wrong answer. */
const isNeverCacheable = (url) => url.pathname.startsWith("/cv/export/");

/*
 * The extension half is gated on mode, because a navigation to a deep link
 * like /avataaars.svg would otherwise take the image path - and that path has
 * no /offline fallback, so offline it produced the browser's own error page.
 */
const isImage = (request, url) =>
  request.destination === "image" ||
  (request.mode !== "navigate" && /\.(png|svg|jpg|jpeg|webp|ico)$/.test(url.pathname));

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Only navigations get the offline page; a failed asset should stay failed
    // rather than resolve to an HTML document.
    if (request.mode === "navigate") {
      const shell = await caches.open(SHELL_CACHE);

      // The precache has to be consulted here or it is dead weight: install
      // stores routes in SHELL_CACHE, but navigations run through PAGE_CACHE,
      // which only ever holds routes this visitor already opened under worker
      // control. Without this lookup every precached route - including "/" -
      // served the offline page, which is precisely what shipped before.
      //
      // ignoreVary because Next varies document responses on RSC routing
      // headers, and a precache entry fetched without them would otherwise
      // never match a real navigation.
      const precached =
        (await shell.match(request, { ignoreVary: true })) ??
        (await shell.match(new URL(request.url).pathname, { ignoreVary: true }));
      if (precached) return precached;

      const offline = await shell.match(OFFLINE_URL, { ignoreVary: true });
      if (offline) return offline;
    }

    throw new Error("offline and not cached");
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  // Never resolve to undefined: respondWith(Promise<undefined>) is a spec
  // violation the browser turns into an opaque network error, which reads as a
  // broken page rather than a missing asset.
  return cached ?? (await network) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) return;
  if (isNeverCacheable(url)) return;

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isImage(request, url)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // Documents and everything else: the network is the source of truth, and the
  // cache exists only for when it is genuinely unreachable.
  event.respondWith(networkFirst(request, request.mode === "navigate" ? PAGE_CACHE : SHELL_CACHE));
});
