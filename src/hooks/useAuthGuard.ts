"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getAuthToken } from "@/src/utils/authToken";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isChecking = useAuthStore(s => s.isChecking);
  const employeeId = useAuthStore(s => s.employeeId);
  const userInfo = useAuthStore(s => s.userInfo);
  const userRole = useAuthStore(s => s.userRole);
  const isGeofenceEnabled = useAuthStore(s => s.isGeofenceEnabled);
  const initialize = useAuthStore(s => s.initialize);

  // Initialize the store once
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (isChecking) return;

    // The login page ("/") and other public routes should never trigger
    // an unauthenticated redirect — they ARE the destination for
    // unauthenticated users. Without this, calling router.replace("/")
    // while already on "/" creates an infinite RSC fetch loop.
    const publicRoutes = ['/', '/login', '/auth/azure/success', '/reset-password', '/forgot-password', '/no-access'];
    const isPublicRoute = publicRoutes.some(route =>
      route === '/' || route === '/login'
        ? pathname === route
        : pathname?.includes(route)
    );

    if (!isPublicRoute && !isAuthenticated) {
      // NEVER bounce to "/" while a usable token still exists in storage OR in
      // the tab-shared session cookie. If we redirect while the cookie is
      // valid, the middleware redirects straight back to the dashboard, and
      // the two layers fight each other in an infinite loop → blank white
      // screen (e.g. opening the dashboard URL in a new tab after a
      // session-only login). The async initialize() will finish rehydrating
      // the session and flip isAuthenticated; only a genuinely token-less
      // state should redirect to login.
      const hasToken = typeof window !== "undefined" && !!getAuthToken();
      if (!hasToken) {
        router.replace("/");
      }
    }
  }, [isChecking, isAuthenticated, pathname, router]);

  return {
    isAuthenticated,
    isChecking,
    employeeId,
    userInfo,
    userRole,
    isGeofenceEnabled
  };
}