export function detectCategory(
  headers: string[],
  rows: Record<string, string>[]
): string {

  const cols = headers.map(h => h.toLowerCase());

  // Header detection
  if (cols.some(h => h.includes("electricity") || h.includes("kwh")))
    return "electricity";

  if (cols.some(h => h.includes("diesel")))
    return "diesel";

  if (cols.some(h => h.includes("petrol")))
    return "petrol";

  if (cols.some(h => h.includes("water")))
    return "water";

  if (cols.some(h => h.includes("waste")))
    return "waste";

  // Unit detection
  for (const row of rows) {

    const unit = (row.unit || "").toLowerCase();

    if (unit === "kwh")
      return "electricity";

    if (unit === "l" || unit === "litre" || unit === "liter") {

      const source = (row.source || "").toLowerCase();

      if (source.includes("diesel"))
        return "diesel";

      if (source.includes("petrol"))
        return "petrol";
    }

    if (
      unit === "m³" ||
      unit === "m3"
    )
      return "water";

    if (unit === "kg")
      return "waste";
  }

  return "unknown";
}