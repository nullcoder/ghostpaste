import { describe, it, expect } from "vitest";
import { nanoid } from "nanoid";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";

describe("Edge Runtime Compatibility", () => {
  describe("nanoid", () => {
    it("should generate unique IDs", () => {
      const id1 = nanoid();
      const id2 = nanoid();

      expect(id1).toHaveLength(21);
      expect(id2).toHaveLength(21);
      expect(id1).not.toBe(id2);
    });

    it("should generate custom length IDs", () => {
      const shortId = nanoid(10);
      expect(shortId).toHaveLength(10);
    });

    it("should only use URL-safe characters", () => {
      const id = nanoid();
      const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
      expect(id).toMatch(urlSafeRegex);
    });
  });

  describe("CodeMirror State", () => {
    it("should create editor state without DOM", () => {
      const doc = "const hello = 'world';";
      const state = EditorState.create({
        doc,
        extensions: [javascript()],
      });

      expect(state.doc.toString()).toBe(doc);
      expect(state.doc.length).toBe(doc.length);
    });

    it("should handle multiple lines", () => {
      const doc = `function test() {
  return "Hello, World!";
}`;
      const state = EditorState.create({ doc });

      expect(state.doc.lines).toBe(3);
      expect(state.doc.line(1).text).toBe("function test() {");
    });
  });

  describe("Crypto API", () => {
    it("should have crypto.getRandomValues available", () => {
      expect(globalThis.crypto).toBeDefined();
      expect(globalThis.crypto.getRandomValues).toBeDefined();

      const array = new Uint8Array(16);
      crypto.getRandomValues(array);

      // Check that values were set
      const hasNonZero = array.some((val) => val !== 0);
      expect(hasNonZero).toBe(true);
    });

    it("should have crypto.randomUUID available", () => {
      expect(globalThis.crypto.randomUUID).toBeDefined();

      const uuid = crypto.randomUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });
});
