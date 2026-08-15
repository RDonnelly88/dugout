import { describe, expect, it } from "vitest";
import { escapeCell, toCsv } from "@/lib/csv";

describe("escapeCell", () => {
  it("leaves an ordinary value alone", () => {
    expect(escapeCell("Baz")).toBe("Baz");
    expect(escapeCell(42)).toBe("42");
  });

  it("writes nothing for a missing value", () => {
    expect(escapeCell(null)).toBe("");
    expect(escapeCell(undefined)).toBe("");
  });

  it("quotes a value containing a comma", () => {
    expect(escapeCell("Bibs, Skins")).toBe('"Bibs, Skins"');
  });

  it("doubles a quote inside a quoted value", () => {
    expect(escapeCell('He said "no"')).toBe('"He said ""no"""');
  });

  it("quotes a value spanning lines", () => {
    expect(escapeCell("one\ntwo")).toBe('"one\ntwo"');
  });

  it("defuses a value a spreadsheet would treat as a formula", () => {
    // Without this, opening the file runs the cell.
    expect(escapeCell("=1+1")).toBe("'=1+1");
    expect(escapeCell("+44 7700")).toBe("'+44 7700");
    expect(escapeCell("-Baz")).toBe("'-Baz");
    expect(escapeCell("@here")).toBe("'@here");
  });

  it("quotes a formula that also contains a comma", () => {
    expect(escapeCell("=SUM(A1,B1)")).toBe(`"'=SUM(A1,B1)"`);
  });
});

describe("toCsv", () => {
  const columns = [
    { header: "Name", value: (r: { name: string; points: number }) => r.name },
    { header: "Points", value: (r: { name: string; points: number }) => r.points },
  ];

  it("writes a header even with no rows", () => {
    expect(toCsv([], columns)).toBe("Name,Points\r\n");
  });

  it("writes a row per record", () => {
    const csv = toCsv(
      [
        { name: "Baz", points: 19 },
        { name: "Deano", points: 39 },
      ],
      columns
    );

    expect(csv).toBe("Name,Points\r\nBaz,19\r\nDeano,39\r\n");
  });

  it("escapes inside rows as well as the header", () => {
    const csv = toCsv([{ name: 'Bibs, "the" lot', points: 3 }], columns);

    expect(csv).toContain('"Bibs, ""the"" lot",3');
  });

  it("ends with a newline, which some readers need to keep the last row", () => {
    expect(toCsv([{ name: "Baz", points: 1 }], columns).endsWith("\r\n")).toBe(true);
  });
});
