import { describe, expect, it } from "vitest";
import { shortNames } from "@/lib/short-names";

describe("shortNames", () => {
  it("uses the first name when nobody else has it", () => {
    const names = shortNames([
      { id: "a", name: "Ross Donnelly" },
      { id: "b", name: "Boyd" },
    ]);

    expect(names.get("a")).toBe("Ross");
    expect(names.get("b")).toBe("Boyd");
  });

  it("keeps the full name for everyone sharing a first name", () => {
    const names = shortNames([
      { id: "a", name: "Ross Donnelly" },
      { id: "b", name: "ross Smith" },
      { id: "c", name: "Ian Kerr" },
    ]);

    expect(names.get("a")).toBe("Ross Donnelly");
    expect(names.get("b")).toBe("ross Smith");
    expect(names.get("c")).toBe("Ian");
  });

  it("copes with stray spaces", () => {
    expect(shortNames([{ id: "a", name: "  Gary   Lyle " }]).get("a")).toBe("Gary");
  });
});
