import { test, expect } from "@playwright/test";

/**
 * A researcher who finds a flaw needs to know where to send it, and security.txt
 * (RFC 9116) is the one place tools and people look first. A file that exists but
 * has no contact, or an `Expires` date that has passed, is worse than none: the
 * RFC tells readers to ignore an expired file.
 *
 * So these tests pin the two things that go wrong quietly. The contact has to be a
 * real address, and the file has to be fresh. The second one will start failing
 * a year after the date in the file, on purpose - that is the reminder to renew it.
 */

const path = "/.well-known/security.txt";
const dayMs = 24 * 60 * 60 * 1000;

test("security.txt is served as plain text", async ({ request }) => {
  const response = await request.get(path);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/plain");
});

test("security.txt names a contact", async ({ request }) => {
  const body = await (await request.get(path)).text();

  expect(body).toMatch(/^Contact: mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/m);
});

test("security.txt has not expired and does not run past a year", async ({ request }) => {
  const body = await (await request.get(path)).text();
  const expires = body.match(/^Expires: (\S+)$/m)?.[1];

  expect(expires, "an Expires line").toBeDefined();

  const time = Date.parse(expires ?? "");
  expect(Number.isNaN(time), `Expires "${expires}" is a date`).toBe(false);
  expect(time, "Expires is in the future").toBeGreaterThan(Date.now());
  // RFC 9116 asks for less than a year ahead, so a stale file cannot sit for long.
  expect(time, "Expires is within a year").toBeLessThan(Date.now() + 366 * dayMs);
});

test("security.txt points at itself and at the policy", async ({ request }) => {
  const body = await (await request.get(path)).text();

  expect(body).toMatch(/^Canonical: https:\/\/\S+\/\.well-known\/security\.txt$/m);
  expect(body).toMatch(/^Policy: https:\/\/github\.com\/patorsiang\/patstudio\/\S*SECURITY\.md$/m);
});
