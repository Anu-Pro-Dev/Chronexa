export function sortTableData<T>(
  data: T[],
  sortField: string,
  sortDirection: "asc" | "desc",
  idField: string = "id",
  timestampFields: string[] = []
): T[] {
  return [...data].sort((a: any, b: any) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === idField) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }
    else if (timestampFields.includes(sortField)) {
      aValue = a.timestamp || a[sortField];
      bValue = b.timestamp || b[sortField];
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}