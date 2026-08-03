import { USER_TOKEN, REMEMBER_ME_FLAG, TOKEN_EXPIRATION, REMEMBER_ME_DAYS, SESSION_ONLY_DAYS } from "@/src/utils/constants";

/**
 * The middleware gate (src/middleware.ts) authenticates requests using the
 * `userToken` cookie, which is SHARED across all tabs of the same browser.
 * However, session-only logins store the token in `sessionStorage`, which is
 * PER-TAB — a freshly opened tab gets an empty sessionStorage. That mismatch
 * caused a new tab to pass the middleware but fail client-side auth, producing
 * the infinite redirect loop / blank white screen.
 *
 * To keep the client and the middleware on a single source of truth, token
 * lookups now fall back to the (tab-shared) cookie when storage is empty.
 */

const isBrowser = (): boolean => typeof window !== "undefined";

const readCookie = (name: string): string | null => {
    if (!isBrowser()) return null;
    const match = document.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));
    return match ? match.slice(name.length + 1) : null;
};

const isProduction = (): boolean => process.env.NODE_ENV === "production";

/** Attributes shared by every auth cookie. `Secure` only in production (HTTPS). */
const cookieAttributes = (maxAge?: number): string => {
    const attrs = `path=/; samesite=lax${isProduction() ? "; secure" : ""}`;
    return maxAge === undefined ? attrs : `${attrs}; max-age=${maxAge}`;
};

export const getAuthToken = (): string | null => {
    if (!isBrowser()) return null;

    // 1. Per-tab storage (original login tab)
    // 2. Tab-shared cookie (new tabs / page reloads)
    const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN) || readCookie(USER_TOKEN);

    if (!token) return null;

    const expiration = localStorage.getItem(TOKEN_EXPIRATION) || sessionStorage.getItem(TOKEN_EXPIRATION) || readCookie(TOKEN_EXPIRATION);
    if (expiration && Date.now() > parseInt(expiration)) {
        clearAuthToken();
        return null;
    }

    return token;
};

export const setAuthToken = (token: string | null, rememberMe: boolean): void => {
    if (typeof window === "undefined") return;

    if (token) {
        const expirationDays = rememberMe ? REMEMBER_ME_DAYS : SESSION_ONLY_DAYS;
        const expirationTime = Date.now() + (expirationDays * 24 * 60 * 60 * 1000);

        localStorage.removeItem(USER_TOKEN);
        localStorage.removeItem(REMEMBER_ME_FLAG);
        localStorage.removeItem(TOKEN_EXPIRATION);
        sessionStorage.removeItem(USER_TOKEN);
        sessionStorage.removeItem(TOKEN_EXPIRATION);

        document.cookie = `userToken=; path=/; max-age=0`;
        document.cookie = `tokenExpiration=; path=/; max-age=0`;
        document.cookie = `rememberMe=; path=/; max-age=0`;

        if (rememberMe) {
            localStorage.setItem(USER_TOKEN, token);
            localStorage.setItem(REMEMBER_ME_FLAG, "true");
            localStorage.setItem(TOKEN_EXPIRATION, expirationTime.toString());

            const maxAge = REMEMBER_ME_DAYS * 24 * 60 * 60;
            document.cookie = `userToken=${token}; ${cookieAttributes(maxAge)}`;
            document.cookie = `tokenExpiration=${expirationTime}; ${cookieAttributes(maxAge)}`;
            document.cookie = `rememberMe=true; ${cookieAttributes(maxAge)}`;
        } else {
            sessionStorage.setItem(USER_TOKEN, token);
            sessionStorage.setItem(TOKEN_EXPIRATION, expirationTime.toString());

            // Session cookies (no max-age) — shared across tabs in this browser
            // session, which is what lets a new tab resume the same login.
            document.cookie = `userToken=${token}; ${cookieAttributes()}`;
            document.cookie = `tokenExpiration=${expirationTime}; ${cookieAttributes()}`;
        }
    } else {
        clearAuthToken();
    }
};

export const clearAuthToken = (): void => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(USER_TOKEN);
    localStorage.removeItem(REMEMBER_ME_FLAG);
    localStorage.removeItem(TOKEN_EXPIRATION);

    sessionStorage.removeItem(USER_TOKEN);
    sessionStorage.removeItem(TOKEN_EXPIRATION);

    document.cookie = `userToken=; path=/; max-age=0`;
    document.cookie = `tokenExpiration=; path=/; max-age=0`;
    document.cookie = `rememberMe=; path=/; max-age=0`;
};

export const isRemembered = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(REMEMBER_ME_FLAG) === "true";
};

export const getTokenExpiration = (): number | null => {
    if (typeof window === "undefined") return null;

    const expiration = localStorage.getItem(TOKEN_EXPIRATION) || sessionStorage.getItem(TOKEN_EXPIRATION) || readCookie(TOKEN_EXPIRATION);
    return expiration ? parseInt(expiration) : null;
};
