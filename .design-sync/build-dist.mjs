#!/usr/bin/env node
// Builds .design-sync/ds-package/dist from the app's real component source.
// The app is not a library (no dist, `@/` aliases, next/* imports), so this
// is the one place that adapts it into the shape the design-sync converter
// reads. Run from the repo root before package-build.mjs / resync.mjs.
//   1. esbuild: bundle src/index.ts -> dist/index.js (ESM; react external)
//   2. tsc: emit .d.ts -> dist/types, then rewrite `@/` specifiers to relative
//   3. dist/index.d.ts re-exports the emitted barrel
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, symlinkSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { createRequire } from "node:module";

const root = resolve(import.meta.dirname, "..");
const pkg = join(root, ".design-sync/ds-package");
const appSrc = join(root, "apps/portfolio-web/src");
const dist = join(pkg, "dist");
// esbuild is installed in the isolated .ds-sync/ deps, not the repo lockfile.
const { build } = createRequire(join(root, ".ds-sync/package.json"))("esbuild");

// Bun does not hoist, so @types/react exists only under the app. The converter
// finds React's types by walking up from the package dir for node_modules/@types/react;
// without them every `ComponentPropsWithoutRef<"x">["onClick"]` collapses to a wrong type.
const nm = join(pkg, "node_modules");
try { lstatSync(nm); } catch { symlinkSync("../../apps/portfolio-web/node_modules", nm); }

rmSync(dist, { recursive: true, force: true });

// -- 1. bundle ---------------------------------------------------------------
const sanitizeUrl = join(root, "packages/utils/src/sanitize-url.ts");
await build({
  entryPoints: [join(pkg, "src/index.ts")],
  outfile: join(dist, "index.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  jsx: "automatic",
  target: "es2022",
  external: ["react", "react-dom", "react/jsx-runtime"],
  logLevel: "warning",
  // Next inlines NEXT_PUBLIC_* at build time; a browser bundle has no `process`.
  // seo.ts falls back to the production URL when this is undefined.
  define: { "process.env.NEXT_PUBLIC_SITE_URL": "undefined" },
  plugins: [
    {
      name: "ds-resolve",
      setup(b) {
        const shim = (name, file) => ({ path: join(pkg, "shims", file) });
        b.onResolve({ filter: /^next\/link$/ }, () => shim("link", "next-link.tsx"));
        b.onResolve({ filter: /^next\/image$/ }, () => shim("image", "next-image.tsx"));
        b.onResolve({ filter: /^next\/navigation$/ }, () => shim("navigation", "next-navigation.tsx"));
        // Workspace packages ship TS source; map to it directly (Bun does not link them at the root).
        b.onResolve({ filter: /^@patorsiang\/content$/ }, () => ({ path: join(root, "packages/content/src/index.ts") }));
        b.onResolve({ filter: /^@patorsiang\/cv-engine$/ }, () => ({ path: join(root, "packages/cv-engine/src/index.ts") }));
        // The utils barrel pulls in sanitize-html (Node-only); components only need sanitizeUrl.
        b.onResolve({ filter: /^@patorsiang\/utils$/ }, () => ({ path: sanitizeUrl }));
        b.onResolve({ filter: /^@\// }, (a) => {
          const base = join(appSrc, a.path.slice(2));
          for (const ext of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
            if (existsSync(base + ext) && statSync(base + ext).isFile()) return { path: base + ext };
          }
          return { errors: [{ text: `cannot resolve ${a.path}` }] };
        });
      },
    },
  ],
});

// -- 2. declarations ---------------------------------------------------------
const tsc = join(root, "node_modules/.bin/tsc");
execFileSync(tsc, ["-p", join(pkg, "tsconfig.json")], { stdio: "inherit" });

const typesRoot = join(dist, "types");
// tsc mirrors the repo layout, so our own files land under a dot-directory the
// converter's walkers skip. Same-depth rename keeps every relative import valid.
renameSync(join(typesRoot, ".design-sync"), join(typesRoot, "_ds"));

// tsc keeps `@/x` specifiers; rewrite to relative so ts-morph can follow them.
const appTypes = join(typesRoot, relative(root, appSrc));
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith(".d.ts") ? [p] : [];
});
for (const f of walk(typesRoot)) {
  const src = readFileSync(f, "utf8");
  const out = src.replace(/(from\s+|import\()(["'])@\/([^"']+)\2/g, (_, pre, q, spec) => {
    let rel = relative(dirname(f), join(appTypes, spec));
    if (!rel.startsWith(".")) rel = "./" + rel;
    return `${pre}${q}${rel}${q}`;
  });
  if (out !== src) writeFileSync(f, out);
}

// -- 3. entry types ----------------------------------------------------------
const barrel = "types/_ds/ds-package/src/index";
writeFileSync(join(dist, "index.d.ts"), `export * from "./${barrel}";\n`);
console.error(`built ${relative(root, dist)}`);
