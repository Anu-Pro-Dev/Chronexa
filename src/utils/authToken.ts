import { USER_TOKEN, REMEMBER_ME_FLAG, TOKEN_EXPIRATION, REMEMBER_ME_DAYS, SESSION_ONLY_DAYS } from "@/src/utils/constants";

export const getAuthToken = (): string | null => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);

    if (!token) return null;

    const expiration = localStorage.getItem(TOKEN_EXPIRATION);
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
            document.cookie = `userToken=${token}; path=/; max-age=${maxAge}; samesite=lax`;
            document.cookie = `tokenExpiration=${expirationTime}; path=/; max-age=${maxAge}; samesite=lax`;
            document.cookie = `rememberMe=true; path=/; max-age=${maxAge}; samesite=lax`;
        } else {
            sessionStorage.setItem(USER_TOKEN, token);
            sessionStorage.setItem(TOKEN_EXPIRATION, expirationTime.toString());

            document.cookie = `userToken=${token}; path=/; samesite=lax`;
            document.cookie = `tokenExpiration=${expirationTime}; path=/; samesite=lax`;
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

    const expiration = localStorage.getItem(TOKEN_EXPIRATION) || sessionStorage.getItem(TOKEN_EXPIRATION);
    return expiration ? parseInt(expiration) : null;
};