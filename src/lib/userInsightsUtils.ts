export function toLocalDateStr(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getWeekStartStr(fromDate?: string): string {
  const date = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date();
  const day = date.getDay();

  date.setDate(date.getDate() - day);

  return toLocalDateStr(date);
}

export function buildInsightsRequestKey(
  slice: string,
  orgId: number,
  key: string,
): string {
  return `${slice}:${orgId}:${key}`;
}
