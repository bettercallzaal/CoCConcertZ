import { describe, it, expect } from "vitest";
import { tally } from "../tally";

function snap(choices: Array<string | undefined>) {
  return {
    forEach(fn: (doc: { data(): { choice?: string } }) => void) {
      for (const choice of choices) fn({ data: () => ({ choice }) });
    },
  };
}

describe("tally", () => {
  it("returns zeros for an empty snapshot", () => {
    expect(tally(snap([]))).toEqual({ a: 0, b: 0 });
  });

  it("counts a single 'a' vote", () => {
    expect(tally(snap(["a"]))).toEqual({ a: 1, b: 0 });
  });

  it("counts a single 'b' vote", () => {
    expect(tally(snap(["b"]))).toEqual({ a: 0, b: 1 });
  });

  it("counts multiple votes correctly", () => {
    expect(tally(snap(["a", "b", "a", "a", "b"]))).toEqual({ a: 3, b: 2 });
  });

  it("ignores unrecognised choice values", () => {
    expect(tally(snap(["a", "c", "x", "b"]))).toEqual({ a: 1, b: 1 });
  });

  it("ignores undefined choice (doc with no choice field)", () => {
    expect(tally(snap([undefined, "a"]))).toEqual({ a: 1, b: 0 });
  });

  it("returns a tie when a === b", () => {
    const { a, b } = tally(snap(["a", "b"]));
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(a === b).toBe(true);
  });

  it("all-a sweep", () => {
    expect(tally(snap(["a", "a", "a"]))).toEqual({ a: 3, b: 0 });
  });
});
