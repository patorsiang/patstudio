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
 * Any new route added to the app must be added here too. Nothing generates
 * this list automatically the way sitemap.ts derives CV routes from
 * cvLanguages/cvRoleSlugs, so it is on the person adding the route to also
 * add it here - the payoff is that from then on every suite stays in sync
 * with every other one.
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
  "/posts/bkkjs-summer-2026",
  "/en/cv/fullstack-engineer",
  "/en/cv/ai-ml-engineer",
  "/en/cv/security-engineer",
  "/en/cv/apple-specialist",
  "/th/cv/fullstack-engineer",
  "/this-route-does-not-exist",
  "/offline",
] as const;
