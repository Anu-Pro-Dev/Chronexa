// utils/caseConverters.ts

/**
 * Convert camelCase or PascalCase to snake_case
 * @param str string in camelCase or PascalCase
 */
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * Convert snake_case to camelCase
 * @param str string in snake_case
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Convert snake_case to normal sentence case
 * Example: "organization_type" → "Organization type"
 * @param str string in snake_case
 */
export function snakeToSentence(str: string): string {
  const normal = str.replace(/_/g, " ");
  return normal.charAt(0).toUpperCase() + normal.slice(1).toLowerCase();
}

/**
 * Convert snake_case to Title Case (each word capitalized)
 * Example: "organization_type" → "Organization Type"
 * @param str string in snake_case
 */
export function snakeToTitleCase(str: string): string {
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Convert camelCase to Normal Text (first letter caps only, rest lowercase, spaces before capitals)
 * Example: "organizationType" → "Organization type"
 * @param str string in camelCase
 */
export function camelToSentence(str: string): string {
  const withSpaces = str.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}

/**
 * Convert camelCase to Title Case (each word capitalized, spaces before capitals)
 * Example: "organizationType" → "Organization Type"
 * @param str string in camelCase
 */
export function camelToTitleCase(str: string): string {
  const withSpaces = str.replace(/([A-Z])/g, " $1");
  return withSpaces
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
