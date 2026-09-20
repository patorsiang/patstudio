import { describe, expect, test } from "bun:test";

import { GET } from "./route";

describe("GET /card/whatsapp", () => {
  test("redirects to the public WhatsApp short link", () => {
    const response = GET();

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://wa.me/message/FHMNDGUQGKJNE1");
  });
});
