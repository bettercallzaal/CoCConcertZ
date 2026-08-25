import { describe, it, expect } from "vitest";
import { toDatetimeLocal } from "../format-date";

// new Date(year, monthIndex, day, hour, minute) creates a local-time date.
// toDatetimeLocal() reads local-time getters, so the round-trip is
// timezone-agnostic — the output always matches the local input.

describe("toDatetimeLocal", () => {
  it("formats January 1st at midnight", () => {
    expect(toDatetimeLocal(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01T00:00");
  });

  it("pads single-digit month (February = month index 1)", () => {
    expect(toDatetimeLocal(new Date(2026, 1, 5, 14, 30))).toBe("2026-02-05T14:30");
  });

  it("pads single-digit day", () => {
    expect(toDatetimeLocal(new Date(2026, 6, 9, 16, 0))).toBe("2026-07-09T16:00");
  });

  it("handles December (month index 11 → '12')", () => {
    expect(toDatetimeLocal(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31T23:59");
  });

  it("pads single-digit hours and minutes", () => {
    expect(toDatetimeLocal(new Date(2026, 7, 9, 4, 5))).toBe("2026-08-09T04:05");
  });
});
