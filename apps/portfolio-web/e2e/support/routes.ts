import { POST_FALLBACK } from "@patorsiang/content/posts";

/**
 * The canonical route list every accessibility sweep checks.
 *
 * tap-targets.e2e.ts, contrast.e2e.ts, focus-visible.e2e.ts and
 * reduced-motion.e2e.ts each used to declare their own hardcoded `routes`
 * array. Nobody decided that they should differ, but they drifted apart
 * anyway - tap-targets covered all three English CV roles while the other
 * three covered only one - so a route could pass one sweep and never be
 * checked by the others. This file exists so that cannot happen again: add a
 * route here once, and every sweep picks it up.
 *
 * Post routes are generated from POST_FALLBACK, the same list sitemap.ts reads,
 * so a new post enters every sweep without anyone editing this file. Any other
 * new route is still added by hand below - the payoff is that from then on
 * every suite stays in sync with every other one. src/lib/e2e-routes.test.ts fails if a
 * post is missing or a route is listed twice.
 *
 * `/this-route-does-not-exist` is deliberate, not a placeholder: it renders
 * not-found.tsx, which has its own controls and needs its own coverage.
 */
export const routes = [
  "/",
  "/about",
  "/experience",
  "/projects",
  "/contact",
  "/card",
  "/posts",
  // Includes line-dev-conf-2026, the only post with a wide Thai table, which
  // ran past the phone edge until render.ts wrapped tables in a scroll
  // container.
  ...POST_FALLBACK.map((post) => `/posts/${post.slug}`),
  "/en/cv/fullstack-engineer",
  "/en/cv/ai-ml-engineer",
  "/en/cv/security-engineer",
  "/en/cv/apple-specialist",
  // All four Thai CVs, not just the default. Thai sets wider and taller than
  // Latin at the same size, so the routes where a line wraps unexpectedly, a
  // control outgrows its border, or the printed CV spills onto another page
  // are these - and for a long time only one of them was swept while all four
  // English variants were.
  "/th/cv/fullstack-engineer",
  "/th/cv/ai-ml-engineer",
  "/th/cv/security-engineer",
  "/th/cv/apple-specialist",
  "/this-route-does-not-exist",
  "/offline",
] as const;
