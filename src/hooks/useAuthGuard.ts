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

    const publicRoutes = ['/auth/azure/success', '/reset-password', '/forgot-password'];
    const isPublicRoute = publicRoutes.some(route => pathname?.includes(route));

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
