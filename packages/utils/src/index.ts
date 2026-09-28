// Deliberately NOT "./security" here: until 2026-09-28 it imported
// isomorphic-dompurify at module scope, and this barrel is what nearly every consumer in the app
// imports from - including the root layout and the /cv legacy-redirect
// routes, which are dynamic (server-rendered per request, not just at
// build time). Pulling jsdom into that path broke them in production
// (ERR_REQUIRE_ESM under Vercel's runtime). Only packages/content's
// render.ts actually needs the HTML sanitiser, and it imports the "./security"
// subpath directly - see sanitize-url.ts and security.ts for the full story.
// security.ts now uses sanitize-html, which needs no DOM; the split stays
// because the barrel is still the lighter import for string-only helpers.
export * from "./sanitize-url";
export * from "./logger";
