"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { USER_TOKEN } from "@/utils/constants";

export function useAuthGuard() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
    
    if (!token) {
      router.replace("/");  // redirect to login if not authenticated
    } else {
      setIsAuthenticated(true);
    }
    
    setIsChecking(false);
  }, [router]);

  return { isAuthenticated, isChecking };
}
