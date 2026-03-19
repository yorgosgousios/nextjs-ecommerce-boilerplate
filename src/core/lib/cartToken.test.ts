import { describe, it, expect, beforeEach } from "vitest";
import { getCartToken, clearCartToken } from "@/core/lib/cartToken";

describe("cartToken", () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(";").forEach((c) => {
      document.cookie =
        c.trim().split("=")[0] +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    });
  });

  it("generates a UUID token on first call", () => {
    const token = getCartToken();
    expect(token).toBeTruthy();
    // UUID v4 format
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it("returns the same token on subsequent calls", () => {
    const first = getCartToken();
    const second = getCartToken();
    expect(first).toBe(second);
  });

  it("clears the token", () => {
    const token = getCartToken();
    expect(token).toBeTruthy();

    clearCartToken();

    // After clearing, a new call should generate a NEW token
    const newToken = getCartToken();
    expect(newToken).not.toBe(token);
  });
});
