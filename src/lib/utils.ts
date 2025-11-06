import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind CSS classes with conflict resolution.
 * @param inputs - List of class values (strings, objects, arrays).
 * @returns A merged className string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a random integer between `min` and `max` (inclusive).
 * @param min - The minimum integer value.
 * @param max - The maximum integer value.
 * @returns A random integer.
 */
export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
