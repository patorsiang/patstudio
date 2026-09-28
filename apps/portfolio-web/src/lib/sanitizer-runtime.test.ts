import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import nextConfig from "../../next.config";

/**
 * The production failure this guards against never shows up in `bun test` or a
 * local `next start`: Vercel's serverless runtime refuses a synchronous
 * require() of an ES module. jsdom's dependency chain (html-encoding-sniffer ->
 * @exodus/bytes) does exactly that, so every post rendered at request time - an
 * unknown slug, a new post, an hourly revalidation - died with ERR_REQUIRE_ESM
 * and a 500, while build-time prerendering hid it from 2026-09-06 onward.
 *
 * The sanitiser is bundled the way Next ships it - everything inlined except
 * `serverExternalPackages`, read from next.config itself so a package added
 * there later is covered too - then loaded in a real Node process with
 * `--no-experimental-require-module`, which reproduces that runtime locally.
 */
describe("post sanitiser under a runtime without require(esm)", () => {
  test("loads and sanitises without ERR_REQUIRE_ESM", async () => {
    const entry = Bun.resolveSync("@patorsiang/utils/security", import.meta.dir);
    // Inside the app, because an ES module resolves its imports relative to its
    // own file: a bundle in /tmp would find no node_modules for the externals.
    const cacheDir = fileURLToPath(new URL("../../node_modules/.cache", import.meta.url));
    mkdirSync(cacheDir, { recursive: true });
    const outdir = mkdtempSync(join(cacheDir, "sanitizer-runtime-"));

    const build = await Bun.build({
      entrypoints: [entry],
      outdir,
      target: "node",
      external: nextConfig.serverExternalPackages ?? [],
    });
    expect(build.success).toBe(true);

    const script = `const m = await import(${JSON.stringify(build.outputs[0].path)});
      process.stdout.write(m.sanitizeArticleHTML('<p>ok</p><script>x</script>'));`;
    const result = Bun.spawnSync(
      ["node", "--no-experimental-require-module", "--input-type=module", "-e", script],
      { stderr: "pipe", stdout: "pipe" },
    );

    expect(result.stderr.toString()).not.toContain("ERR_REQUIRE_ESM");
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toBe("<p>ok</p>");
  });
});
