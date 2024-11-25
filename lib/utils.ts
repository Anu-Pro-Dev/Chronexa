import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { USER_TOKEN } from "./Instance";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function logout() {
  localStorage.removeItem(USER_TOKEN);
  sessionStorage.removeItem(USER_TOKEN);
}
