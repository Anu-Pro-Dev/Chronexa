"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { logoutRequest } from "@/src/lib/apiHandler";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function NoAccessPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutRequest();
    } catch {
      // cleanup happens in logoutRequest's finally block
    }
    // Clear stores
    useDashboardStore.getState().clearRoleAndPrivileges();
    useAuthStore.setState({
      isAuthenticated: false,
      isChecking: false,
      employeeId: null,
      userInfo: null,
      userRole: "",
      isGeofenceEnabled: false,
      _initialized: false,
    });
    router.replace("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-700">
      <h1 className="text-4xl font-bold mb-4 text-destructive">Access Denied</h1>
      <p className="mb-6 text-center">You do not have permission to access this page.</p>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="px-4 py-2 bg-primary text-white hover:bg-primary-100 transition rounded-full disabled:opacity-50"
      >
        {loggingOut ? "Redirecting..." : "Go to Login"}
      </button>
    </div>
  );
}