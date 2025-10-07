'use client';
import React, { createContext, useContext, useState, ReactNode } from "react";
import { apiRequest } from "@/src/lib/apiHandler";
import { useRouter } from "next/navigation";

interface AuthContextType {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticating: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const login = async (username: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const response = await apiRequest("/auth/login", "POST", { username, password });
      if (response?.user?.role) {
        setUserRole(response.user.role);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setUserRole(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticating, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
