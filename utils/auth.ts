import { USER_TOKEN } from "@/utils/constants";

export const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
};
  
export const setAuthToken = (token: string, rememberMe: boolean): void => {
    if (typeof window === "undefined") return;
  
    if (rememberMe) {
      localStorage.setItem(USER_TOKEN, token);
    } else {
      sessionStorage.setItem(USER_TOKEN, token);
    }
};

export const clearAuthToken = (): void => {
    if (typeof window === "undefined") return;
  
    localStorage.removeItem(USER_TOKEN);
    sessionStorage.removeItem(USER_TOKEN);
};