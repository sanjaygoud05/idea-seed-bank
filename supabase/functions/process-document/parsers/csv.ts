export interface ParsedDocument {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseCSV(file: Blob): Promise<ParsedDocument> {
  const text = await file.text();

  const lines = text
  .trim()
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line.length > 0);
  if (lines.length === 0) {
    throw new Error("CSV is empty");
  }

  const headers = lines[0]
    .split(",")
    .map(h => h.trim());

  const rows = lines.slice(1).map(line => {
    const values = line.split(",");

    return Object.fromEntries(
      headers.map((header, index) => [
        header,
        values[index]?.trim() ?? ""
      ])
    );
  });

  return {
    headers,
    rows
  };
}