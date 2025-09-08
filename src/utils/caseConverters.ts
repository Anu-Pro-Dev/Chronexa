export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function snakeToSentence(str: string): string {
  const normal = str.replace(/_/g, " ");
  return normal.charAt(0).toUpperCase() + normal.slice(1).toLowerCase();
}

export function snakeToTitleCase(str: string): string {
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function camelToSentence(str: string): string {
  const withSpaces = str.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}

export function camelToTitleCase(str: string): string {
  const withSpaces = str.replace(/([A-Z])/g, " $1");
  return withSpaces
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
