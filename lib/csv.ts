/**
 * CSV generation.
 *
 * Hand-rolled rather than pulled from a library, because the whole job is one
 * escaping rule and getting it wrong is what makes a spreadsheet open with the
 * columns shifted.
 */

/**
 * Quote a value if it could otherwise break the row.
 *
 * A field needs quoting when it contains a comma, a quote or a line break, and
 * a quote inside a quoted field is written twice. A leading `=`, `+`, `-` or
 * `@` is prefixed with an apostrophe: spreadsheets treat those as the start of
 * a formula, so a player called "-Baz" would otherwise be executed rather than
 * displayed.
 */
export function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text = String(value);

  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/** A row per record, with the header taken from the column list. */
export function toCsv<T>(
  rows: T[],
  columns: { header: string; value: (row: T) => unknown }[]
): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(c.value(row))).join(",")
  );
  // A trailing newline: some tools drop the last row without one.
  return [header, ...body].join("\r\n") + "\r\n";
}

/**
 * Hand the file to the browser.
 *
 * A blob URL rather than a data URI — a season of results exceeds what some
 * browsers accept in a URL. The object URL is released once the click has been
 * dispatched, since nothing holds a reference to it afterwards.
 */
export function downloadCsv(filename: string, csv: string): void {
  // The BOM is what makes Excel read it as UTF-8 rather than as the local
  // code page, which otherwise mangles any name with an accent in it.
  const blob = new Blob([`﻿${csv}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
