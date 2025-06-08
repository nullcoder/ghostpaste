import { describe, it, expect } from "vitest";
import { OPTIONS } from "./route";

describe("OPTIONS /api/blobs/[id]", () => {
  it("should return correct CORS headers", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://ghostpaste.dev"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS"
    );
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type"
    );
    expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
