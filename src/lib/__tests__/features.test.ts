import { describe, it, expect, afterEach } from "vitest";
import { uploadsEnabled, UPLOADS_PAUSED_NOTE } from "../features";

const ENV_KEY = "NEXT_PUBLIC_UPLOADS_ENABLED";

afterEach(() => {
  delete process.env[ENV_KEY];
});

describe("uploadsEnabled", () => {
  it("returns false when env var is not set", () => {
    delete process.env[ENV_KEY];
    expect(uploadsEnabled()).toBe(false);
  });

  it("returns false when env var is 'false'", () => {
    process.env[ENV_KEY] = "false";
    expect(uploadsEnabled()).toBe(false);
  });

  it("returns false when env var is '1' (not the exact string 'true')", () => {
    process.env[ENV_KEY] = "1";
    expect(uploadsEnabled()).toBe(false);
  });

  it("returns true when env var is 'true'", () => {
    process.env[ENV_KEY] = "true";
    expect(uploadsEnabled()).toBe(true);
  });
});

describe("UPLOADS_PAUSED_NOTE", () => {
  it("is a non-empty string", () => {
    expect(typeof UPLOADS_PAUSED_NOTE).toBe("string");
    expect(UPLOADS_PAUSED_NOTE.length).toBeGreaterThan(0);
  });
});
