import { describe, it, expect } from "vitest";
import { formatPrice, slugify, truncate } from "@/core/lib/formatters";

describe("formatPrice", () => {
  it("formats cents to EUR with Greek locale", () => {
    const result = formatPrice(4990);
    expect(result).toContain("49,90");
    expect(result).toContain("€");
  });

  it("handles zero", () => {
    const result = formatPrice(0);
    expect(result).toContain("0,00");
  });

  it("handles large amounts", () => {
    const result = formatPrice(9990000);
    expect(result).toContain("99.900,00");
  });
});

describe("slugify", () => {
  it("converts text to lowercase URL-safe string", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Γόβες & Πέδιλα!")).toBe("-");
  });

  it("handles multiple spaces", () => {
    expect(slugify("too   many   spaces")).toBe("too-many-spaces");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("truncate", () => {
  it("returns original text if under max length", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("this is a long text", 10)).toBe("this is a…");
  });

  it("handles exact length", () => {
    expect(truncate("exact", 5)).toBe("exact");
  });

  it("handles empty string", () => {
    expect(truncate("", 10)).toBe("");
  });
});
