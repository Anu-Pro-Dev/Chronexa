"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";

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
    const publicRoutes = ['/', '/login', '/auth/azure/success', '/reset-password', '/forgot-password'];
    const isPublicRoute = publicRoutes.some(route =>
      route === '/' || route === '/login'
        ? pathname === route
        : pathname?.includes(route)
    );

    if (!isPublicRoute && !isAuthenticated) {
      router.replace("/");
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