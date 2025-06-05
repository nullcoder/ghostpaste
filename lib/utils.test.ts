import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", undefined, null, "visible");
    expect(result).toBe("base visible");
  });

  it("should merge Tailwind classes properly", () => {
    const result = cn(
      "bg-red-500 hover:bg-red-600",
      "bg-blue-500 hover:bg-blue-600"
    );
    expect(result).toBe("bg-blue-500 hover:bg-blue-600");
  });

  it("should handle arrays", () => {
    const result = cn(["text-sm", "font-bold"], "text-lg");
    expect(result).toBe("font-bold text-lg");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn(undefined, null, false)).toBe("");
  });
});
