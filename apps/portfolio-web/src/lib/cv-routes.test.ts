import { describe, expect, test } from "bun:test";

import { cvRoleIdToSlug, cvRoleSlugToId, cvRoleSlugs } from "./cv-routes";

describe("cvRoleSlugToId", () => {
  test("resolves every slug the sitemap publishes", () => {
    // cvRoleSlugs is what robots/sitemap and the nav links are built from, so
    // a slug listed there that this cannot resolve is a live 404.
    for (const slug of cvRoleSlugs) {
      expect(cvRoleSlugToId(slug)).not.toBeNull();
    }
  });

  test("round-trips back to the same slug", () => {
    for (const slug of cvRoleSlugs) {
      const role = cvRoleSlugToId(slug);
      expect(role).not.toBeNull();
      expect(cvRoleIdToSlug(role!)).toBe(slug);
    }
  });

  test("returns null for an unknown slug", () => {
    expect(cvRoleSlugToId("not-a-role")).toBeNull();
    expect(cvRoleSlugToId("")).toBeNull();
  });

  test("returns null for keys inherited from Object.prototype", () => {
    // A plain object literal answers `constructor`, `toString` and friends
    // with an inherited value, which is truthy - so `map[slug] ?? null` hands
    // back a function, the `notFound()` guard in app/cv/[role]/page.tsx is
    // skipped, and /cv/constructor redirects to /en/cv/undefined instead of
    // 404ing. Same-origin, so not an open redirect, but it is a dead end the
    // router should have refused outright.
    for (const key of ["constructor", "toString", "valueOf", "hasOwnProperty", "__proto__"]) {
      expect(cvRoleSlugToId(key)).toBeNull();
    }
  });
});
