import { afterEach, describe, expect, test } from "bun:test";

import { GET } from "./route";

const original = process.env.CONTACT_PHONE_E164;

afterEach(() => {
  if (original === undefined) delete process.env.CONTACT_PHONE_E164;
  else process.env.CONTACT_PHONE_E164 = original;
});

describe("GET /card/whatsapp", () => {
  test("redirects to wa.me with the configured number, without the leading +", () => {
    process.env.CONTACT_PHONE_E164 = "+66812345678";

    const response = GET();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://wa.me/66812345678");
  });

  test("404s when no number is configured", () => {
    delete process.env.CONTACT_PHONE_E164;

    expect(GET().status).toBe(404);
  });

  test("404s rather than redirecting when the number is not valid E.164", () => {
    process.env.CONTACT_PHONE_E164 = "0812345678";

    expect(GET().status).toBe(404);
  });
});
