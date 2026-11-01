import { test, expect } from "@playwright/test";

/**
 * A manifest that is valid JSON but points at a missing icon is a broken
 * install that no schema check would catch, so the icons are fetched rather
 * than merely read.
 */

test("the manifest is served and complete", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("manifest");

  const manifest = await response.json();

  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");

  const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
  expect(sizes).toContain("192x192");
  expect(sizes).toContain("512x512");
  expect(
    manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable"),
    "no maskable icon — Android will letterbox the icon on a white tile",
  ).toBe(true);
});

test("every icon the manifest references resolves", async ({ request, page }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();

  for (const icon of manifest.icons as { src: string; sizes: string }[]) {
    const response = await request.get(icon.src);

    expect(response.status(), `${icon.src} is referenced by the manifest but 404s`).toBe(200);

    // Parse expected dimensions from the sizes string (e.g., "192x192" -> [192, 192]).
    // Stops at the first space or end of string to handle "192x192 any" or "512x512 maskable".
    const sizeMatch = icon.sizes.match(/(\d+)x(\d+)/);
    if (!sizeMatch) {
      throw new Error(`Cannot parse dimensions from sizes="${icon.sizes}" on ${icon.src}`);
    }
    const [, widthStr, heightStr] = sizeMatch;
    const expectedWidth = parseInt(widthStr, 10);
    const expectedHeight = parseInt(heightStr, 10);

    // Decode the image in Chromium and verify its actual dimensions match
    // the manifest declaration. A manifest pointing at the wrong pixel size
    // is broken even if the file exists and is 200 OK.
    await page.goto("/");
    const actualDimensions = await page.evaluate(async (src: string) => {
      const img = new Image();
      img.src = src;
      await img.decode();

      return { width: img.naturalWidth, height: img.naturalHeight };
    }, icon.src);

    expect(
      actualDimensions.width,
      `${icon.src} has naturalWidth ${actualDimensions.width} but manifest declares sizes="${icon.sizes}"`,
    ).toBe(expectedWidth);

    expect(
      actualDimensions.height,
      `${icon.src} has naturalHeight ${actualDimensions.height} but manifest declares sizes="${icon.sizes}"`,
    ).toBe(expectedHeight);
  }
});

test("the document links the manifest", async ({ page }) => {
  await page.goto("/");

  const href = await page.locator('link[rel="manifest"]').first().getAttribute("href");

  expect(href, "Next emitted no manifest link").toBeTruthy();
});

test("the offline page renders and is not advertised to crawlers", async ({ page, request }) => {
  const response = await page.goto("/offline");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/offline/i);

  // A fallback page is not content. Listing it would send crawlers to a page
  // that only makes sense when the network is gone.
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/offline");
});

test("the offline banner is absent while online", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("status")).toHaveCount(0);
});

test("the offline banner appears when the browser goes offline", async ({ page, context }) => {
  await page.goto("/");
  await context.setOffline(true);

  await expect(page.getByRole("status")).toContainText(/offline/i);

  await context.setOffline(false);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test.describe("service worker", () => {
  test.use({ serviceWorkers: "allow" });

  test("registers and takes control", async ({ page }) => {
    await page.goto("/");

    const controlled = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;

      // `ready` resolves the moment the worker becomes the registration's
      // active worker — a step that happens before the `activate` event (and
      // therefore before our `clients.claim()`) has run. On a page's first
      // ever registration this is not a rare race: `controller` is
      // deterministically null at this exact point every time, so wait for
      // `controllerchange` rather than read `controller` synchronously.
      // Raced against a timeout so a worker that never claims fails this
      // assertion with our message instead of Playwright's generic 30s one.
      if (!navigator.serviceWorker.controller) {
        const controllerChange = new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), {
            once: true,
          });
        });
        await Promise.race([
          controllerChange,
          new Promise<void>((resolve) => setTimeout(resolve, 5000)),
        ]);
      }

      return Boolean(registration.active) && Boolean(navigator.serviceWorker.controller);
    });

    expect(controlled, "no service worker took control of the page").toBe(true);
  });

  test("precaches the shell routes", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);

    const shell = await page.evaluate(async () => {
      // Derived, not hardcoded: a CACHE_VERSION bump would otherwise open a
      // cache that was never populated, failing for a reason unrelated to
      // whether precaching works - which is how a load-bearing test gets
      // deleted by whoever is unlucky enough to bump the version.
      const name = (await caches.keys()).find((key) => key.startsWith("portfolio-shell-"));
      const cache = await caches.open(name ?? "portfolio-shell-missing");
      return (await cache.keys()).map((request) => new URL(request.url).pathname);
    });

    // A positive assertion, not merely an absence of foreign entries: an
    // install that fetches every sitemap URL and silently fails all of them
    // (e.g. because they resolved to another origin and got blocked) still
    // leaves the "foreign entries" check below with an empty, passing array.
    // This is the test that actually guards the pathname reduction.
    expect(shell, "the precache is empty or lost its routes").toEqual(
      expect.arrayContaining(["/", "/offline", "/about", "/en/cv/fullstack-engineer"]),
    );
  });

  test("precaches only same-origin entries", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);

    const foreign = await page.evaluate(async () => {
      const names = await caches.keys();
      const urls: string[] = [];

      for (const name of names) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          if (new URL(request.url).origin !== location.origin) urls.push(request.url);
        }
      }

      return urls;
    });

    // Guards any foreign-origin entry reaching a cache, from any code path —
    // not only `fetch`-based precaching of absolute sitemap URLs. `cache.put`
    // performs no network request, so it is untouched by CSP `connect-src`
    // and will land straight in this cache the moment anything writes one
    // (Task 4's runtime `fetch` handler is exactly such a path). CSP is a
    // second, independent barrier against the `cache.add`/`addAll` route
    // specifically, and only on deployments where `next.config.ts` headers
    // apply — `.github/workflows/nextjs.yml` deploys to GitHub Pages, which
    // drops them entirely. This test is the one that holds regardless.
    expect(foreign, `cached entries from another origin: ${foreign.join(", ")}`).toEqual([]);
  });

  test("evicts caches from an older version on activate", async ({ page }) => {
    // Seeded before the worker exists, because activate only runs for a newly
    // installing worker — there is no way to force a re-activation later.
    await page.goto("/offline");
    await page.evaluate(() => caches.open("portfolio-shell-v0"));

    await page.goto("/");

    const names = await page.evaluate(async () => {
      await navigator.serviceWorker.ready;

      // Same race as "registers and takes control": `ready` resolves before
      // the activate handler's body runs, and the `caches.delete()` calls in
      // that handler happen before its final `clients.claim()`. Waiting for
      // `controllerchange` — which can only fire once that `claim()` call has
      // resolved — makes the eviction's completion guaranteed by the time we
      // read `caches.keys()`, rather than depending on a CDP round-trip
      // happening to be slower than a sub-millisecond `caches.delete()`.
      if (!navigator.serviceWorker.controller) {
        const controllerChange = new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), {
            once: true,
          });
        });
        await Promise.race([
          controllerChange,
          new Promise<void>((resolve) => setTimeout(resolve, 5000)),
        ]);
      }

      return caches.keys();
    });

    expect(names, "a cache from an older version survived activate").not.toContain(
      "portfolio-shell-v0",
    );
  });

  test("serves a precached route while offline", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);

    await context.setOffline(true);
    const response = await page.goto("/projects");

    expect(response?.status(), "/projects did not come from cache").toBe(200);

    // Route-specific, and deliberately NOT "an h1 is visible": only the
    // homepage and the error pages have an h1, so the offline fallback
    // satisfied that assertion while every precached route was quietly
    // serving it. That is how this test passed against a dead precache.
    await expect(page.locator("body")).toContainText(/selected project samples|playground/i);
    await expect(page.locator("body")).not.toContainText(/you.re offline/i);
  });

  test("serves a route never opened in this session, straight from the precache", async ({
    page,
    context,
  }) => {
    // The property the whole sitemap precache exists for, and the one nothing
    // tested: visit ONLY the homepage, then go offline and hard-navigate
    // somewhere new. If the precache is not consulted on navigation, this
    // lands on /offline.
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          if (navigator.serviceWorker.controller) return resolve();
          navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), {
            once: true,
          });
        }),
    );
    // Install fetches the sitemap and then every route in it.
    await expect
      .poll(
        async () =>
          page.evaluate(async () => {
            const name = (await caches.keys()).find((key) => key.startsWith("portfolio-shell-"));
            if (!name) return 0;
            return (await (await caches.open(name)).keys()).length;
          }),
        { message: "the precache never filled" },
      )
      .toBeGreaterThan(5);

    await context.setOffline(true);
    await page.goto("/about");

    await expect(
      page.locator("body"),
      "a precached route fell through to the offline page",
    ).not.toContainText(/you.re offline/i);
    await expect(page.locator("body")).toContainText(
      /engineering focus|where the work concentrates/i,
    );
  });

  test("falls back to the offline page for a route that was never cached", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);

    await context.setOffline(true);
    // Deliberately not in the sitemap, so it cannot have been precached.
    await page.goto("/definitely-not-precached");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/offline/i);
  });

  test("never caches the CV export downloads", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    // page.request is an APIRequestContext - not a client the worker controls,
    // so no fetch event fires and nothing could ever be cached. This test
    // passed with the guard deleted entirely. Going through the page is what
    // makes it real.
    await page.evaluate(() => fetch("/cv/export/json?role=fullstack_engineer&lang=en"));

    const cachedExports = await page.evaluate(async () => {
      const names = await caches.keys();
      const found: string[] = [];

      for (const name of names) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          if (new URL(request.url).pathname.startsWith("/cv/export/")) found.push(request.url);
        }
      }

      return found;
    });

    // These are generated per request from query parameters. A cached copy
    // serves the wrong role or language to the next visitor.
    expect(cachedExports, `export routes were cached: ${cachedExports.join(", ")}`).toEqual([]);
  });
});
