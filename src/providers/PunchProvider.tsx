"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getAuthToken } from "@/src/utils/authToken";

type PunchContextType = {
  isPunchedIn: boolean;
  punchInTime: string | null;
  punchOutTime: string | null;
  startTime: number | null;
  togglePunch: () => void;
  setIsPunchedIn: (value: boolean) => void;
  isClient: boolean;
};

const PunchContext = createContext<PunchContextType | undefined>(undefined);

// Custom event name for same-tab user change detection
const USER_CHANGE_EVENT = 'chronexa:user-change';

export function PunchProvider({ children }: { children: React.ReactNode }) {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const getCurrentUserId = (): string | null => {
    const token = getAuthToken();

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken.id ? String(decodedToken.id) : null;
      } catch {
        // Token decode failed
      }
    }

    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.employeenumber ? String(parsedUser.employeenumber) : null;
      } catch {
        // Parse failed
      }
    }

    return null;
  };

  const resetCurrentSessionState = useCallback(() => {
    setIsPunchedIn(false);
    setPunchInTime(null);
    setPunchOutTime(null);
    setStartTime(null);
  }, []);

  const getPunchStateKey = (userId: string) => `punchState_${userId}`;

  const clearUserPunchState = (userId: string) => {
    localStorage.removeItem(getPunchStateKey(userId));
  };

  const getLastTransactionFromStorage = () => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.lastTransaction || null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const determinePunchStateFromTransaction = (lastTransaction: any) => {
    if (!lastTransaction) {
      return { shouldBePunchedIn: false };
    }

    const { date, type, device_id } = lastTransaction;

    const transactionDate = new Date(date);
    const today = new Date();
    const isToday = transactionDate.getDate() === today.getDate() &&
                   transactionDate.getMonth() === today.getMonth() &&
                   transactionDate.getFullYear() === today.getFullYear();

    let shouldBePunchedIn = false;
    let punchTime = null;
    let startTimestamp = null;

    if (!isToday) {
      shouldBePunchedIn = false;
    } else if (type === "OUT") {
      shouldBePunchedIn = false;
    } else if (type === "IN" && (device_id === 102 || device_id === 103)) {
      shouldBePunchedIn = false;
    } else if (type === "IN") {
      shouldBePunchedIn = true;

      const match = String(date).match(/(\d{2}):(\d{2})/);
      punchTime = match ? `${match[1]}:${match[2]}` : String(date);
      startTimestamp = new Date(date).getTime();
    }

    return { shouldBePunchedIn, punchTime, startTimestamp };
  };

  const loadUserPunchState = useCallback((userId: string) => {
    const lastTransaction = getLastTransactionFromStorage();

    if (lastTransaction) {
      const { shouldBePunchedIn, punchTime, startTimestamp } =
        determinePunchStateFromTransaction(lastTransaction);

      setIsPunchedIn(shouldBePunchedIn);

      if (shouldBePunchedIn && punchTime && startTimestamp) {
        setPunchInTime(punchTime);
        setStartTime(startTimestamp);
      }
    } else {
      const savedState = localStorage.getItem(getPunchStateKey(userId));

      if (savedState) {
        try {
          const {
            isPunchedIn: savedIsPunchedIn,
            punchInTime: savedPunchInTime,
            startTime: savedStartTime
          } = JSON.parse(savedState);

          if (savedIsPunchedIn && savedStartTime) {
            setIsPunchedIn(true);
            setPunchInTime(savedPunchInTime);
            setStartTime(savedStartTime);
          }
        } catch {
          localStorage.removeItem(getPunchStateKey(userId));
        }
      }
    }
  }, []);

  // Initial mount: load punch state
  useEffect(() => {
    setIsClient(true);

    const userId = getCurrentUserId();

    if (!userId) {
      resetCurrentSessionState();
      setCurrentUserId(null);
      return;
    }

    setCurrentUserId(userId);
    loadUserPunchState(userId);
  }, [resetCurrentSessionState, loadUserPunchState]);

  // Listen for user changes via storage events (cross-tab) and custom events (same-tab)
  useEffect(() => {
    if (!isClient) return;

    const handleUserChange = () => {
      const newUserId = getCurrentUserId();

      if (!newUserId) {
        if (currentUserId) {
          resetCurrentSessionState();
          setCurrentUserId(null);
        }
        return;
      }

      if (newUserId === currentUserId) return;

      // User changed
      if (currentUserId) {
        clearUserPunchState(currentUserId);
      }
      resetCurrentSessionState();
      setCurrentUserId(newUserId);
      loadUserPunchState(newUserId);
    };

    // Cross-tab storage changes
    window.addEventListener('storage', handleUserChange);
    // Same-tab user changes (dispatched from login/logout)
    window.addEventListener(USER_CHANGE_EVENT, handleUserChange);

    return () => {
      window.removeEventListener('storage', handleUserChange);
      window.removeEventListener(USER_CHANGE_EVENT, handleUserChange);
    };
  }, [isClient, currentUserId, resetCurrentSessionState, loadUserPunchState]);

  // Persist punch state to localStorage
  useEffect(() => {
    if (isClient && currentUserId) {
      const userPunchStateKey = getPunchStateKey(currentUserId);

      if (isPunchedIn && startTime) {
        localStorage.setItem(userPunchStateKey, JSON.stringify({
          isPunchedIn,
          punchInTime,
          startTime
        }));
      } else {
        localStorage.removeItem(userPunchStateKey);
      }
    }
  }, [isPunchedIn, punchInTime, startTime, isClient, currentUserId]);

  const togglePunch = useCallback(() => {
    if (!isClient || !currentUserId) return;

    const d = new Date();
    const currentTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    if (!isPunchedIn) {
      const now = Date.now();
      setPunchInTime(currentTime);
      setPunchOutTime(null);
      setStartTime(now);
    } else {
      setPunchOutTime(currentTime);
      setStartTime(null);
    }

    setIsPunchedIn(!isPunchedIn);
  }, [isClient, currentUserId, isPunchedIn]);

  const value = useMemo(() => ({
    isPunchedIn,
    punchInTime,
    punchOutTime,
    startTime,
    togglePunch,
    setIsPunchedIn,
    isClient
  }), [isPunchedIn, punchInTime, punchOutTime, startTime, togglePunch, isClient]);

  return (
    <PunchContext.Provider value={value}>
      {children}
    </PunchContext.Provider>
  );
}

// Dispatch this from login/logout to notify PunchProvider of user changes
export function notifyUserChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(USER_CHANGE_EVENT));
  }
}

export function usePunch() {
  const context = useContext(PunchContext);
  if (context === undefined) {
    throw new Error("usePunch must be used within a PunchProvider");
  }
  return context;
}