import { z } from "zod";

/**
 * Import `z` from here, never from "zod" directly.
 *
 * Zod v4 builds a JIT-compiled parser for object schemas, and to decide if it
 * may it probes `new Function("")` inside a try/catch. Under the site's CSP
 * (no 'unsafe-eval' in production, see app/next.config.ts) the probe is
 * blocked, Zod handles that and falls back, but Chrome still logs a Content
 * Security Policy issue on every page and Lighthouse best-practices drops to
 * 96 (#79). `jitless` makes Zod skip the probe. Parsing a few static content
 * objects without JIT costs nothing measurable.
 *
 * The probe runs when a schema object is built, so this must run before any
 * schema module does. Importing `z` from this file guarantees that order.
 * e2e/csp-issues.e2e.ts is the guard if someone imports "zod" directly again.
 */
z.config({ jitless: true });

export { z };
