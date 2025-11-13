/**
 * Converts a camelCase string to snake_case
 * Example: "userId" → "user_id"
 * 
 * @param str - The camelCase string to convert
 * @returns The converted snake_case string
 */
export function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * Converts a snake_case string to camelCase
 * Example: "user_id" → "userId"
 * 
 * @param str - The snake_case string to convert
 * @returns The converted camelCase string
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Converts a snake_case string to a sentence format
 * Example: "first_name" → "First name"
 * 
 * @param str - The snake_case string to convert
 * @returns The converted sentence format string
 */
export function snakeToSentence(str: string): string {
  const normal = str.replace(/_/g, " ");
  return normal.charAt(0).toUpperCase() + normal.slice(1).toLowerCase();
}

/**
 * Converts a snake_case string to Title Case format
 * Example: "first_name" → "First Name"
 * 
 * @param str - The snake_case string to convert
 * @returns The converted Title Case string
 */
export function snakeToTitleCase(str: string): string {
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Converts a camelCase string to a sentence format
 * Example: "firstName" → "First name"
 * 
 * @param str - The camelCase string to convert
 * @returns The converted sentence format string
 */
export function camelToSentence(str: string): string {
  const withSpaces = str.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}

/**
 * Converts a camelCase string to Title Case format
 * Example: "firstName" → "First Name"
 * 
 * @param str - The camelCase string to convert
 * @returns The converted Title Case string
 */
export function camelToTitleCase(str: string): string {
  const withSpaces = str.replace(/([A-Z])/g, " $1");
  return withSpaces
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Converts an ALL_CAPS string to First Letter Caps format
 * Example: "USER_ID" → "User id"
 * 
 * @param str - The ALL_CAPS string to convert
 * @returns The converted First Letter Caps string
 */
export function allCapsToFirstLetterCaps(str: string): string {
  const withSpaces = str.replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
}