import { describe, expect, it } from "vitest";
import { soundAllowed } from "@/lib/sound";

describe("soundAllowed", () => {
  it("whistles for somebody who has never chosen", () => {
    expect(soundAllowed(null)).toBe(true);
  });

  it("stays quiet once turned off", () => {
    expect(soundAllowed("off")).toBe(false);
  });

  it("whistles when turned back on", () => {
    expect(soundAllowed("on")).toBe(true);
  });

  /** A value from some older build is not a reason to go silent. */
  it("treats anything it does not recognise as on", () => {
    expect(soundAllowed("loud")).toBe(true);
  });
});
