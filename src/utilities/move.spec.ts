import { describe, expect, it } from "vitest";
import { formatAnnotations } from "./move";

describe("formatAnnotations", () => {
  it("joins the symbols of known annotations", () => {
    expect(formatAnnotations([1, 14])).toBe("!⩲");
  });

  it("leaves out annotations without a symbol", () => {
    expect(formatAnnotations([9, 3])).toBe("‼");
    expect(formatAnnotations(undefined)).toBe("");
  });
});
