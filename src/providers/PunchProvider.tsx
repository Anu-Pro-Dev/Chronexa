"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { USER_TOKEN } from "@/src/utils/constants";

type PunchContextType = {
  isPunchedIn: boolean;
  punchInTime: string | null;
  punchOutTime: string | null;
  elapsedSeconds: number;
  togglePunch: () => void;
  updateElapsedSeconds: (seconds: number) => void;
  setIsPunchedIn: (value: boolean) => void;
  isClient: boolean;
};

const PunchContext = createContext<PunchContextType | undefined>(undefined);

export function PunchProvider({ children }: { children: React.ReactNode }) {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const getCurrentUserId = (): string | null => {
    const token = localStorage.getItem(USER_TOKEN) || sessionStorage.getItem(USER_TOKEN);
    
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decodedToken = JSON.parse(jsonPayload);
        return decodedToken.id ? String(decodedToken.id) : null;
      } catch (error) {
        console.error('Error decoding token for user ID:', error);
      }
    }
    
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.employeenumber ? String(parsedUser.employeenumber) : null;
      } catch (error) {
        console.error('Error parsing user data for ID:', error);
      }
    }
    
    return null;
  };

  const resetCurrentSessionState = () => {
    setIsPunchedIn(false);
    setPunchInTime(null);
    setPunchOutTime(null);
    setElapsedSeconds(0);
    setStartTime(null);
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const getPunchStateKey = (userId: string) => `punchState_${userId}`;

  const clearUserPunchState = (userId: string) => {
    const userPunchStateKey = getPunchStateKey(userId);
    localStorage.removeItem(userPunchStateKey);
  };

  const getLastTransactionFromStorage = () => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        return parsedUser.lastTransaction || null;
      } catch (error) {
        console.error('Error parsing user data:', error);
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
    let elapsed = 0;
    
    if (!isToday) {
      shouldBePunchedIn = false;
    } else if (type === "OUT") {
      shouldBePunchedIn = false;
    } else if (type === "IN" && (device_id === 102 || device_id === 103)) {
      shouldBePunchedIn = false;
    } else if (type === "IN") {
      shouldBePunchedIn = true;
      
      const punchDateTime = new Date(date);
      punchTime = punchDateTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      startTimestamp = punchDateTime.getTime();
      elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    }
    
    return { shouldBePunchedIn, punchTime, startTimestamp, elapsed };
  };

  useEffect(() => {
    setIsClient(true);
    
    const userId = getCurrentUserId();
    
    if (!userId) {
      resetCurrentSessionState();
      setCurrentUserId(null);
      return;
    }
    
    setCurrentUserId(userId);
    
    const lastTransaction = getLastTransactionFromStorage();
    
    if (lastTransaction) {
      const { shouldBePunchedIn, punchTime, startTimestamp, elapsed } = 
        determinePunchStateFromTransaction(lastTransaction);
      
      setIsPunchedIn(shouldBePunchedIn);
      
      if (shouldBePunchedIn && punchTime && startTimestamp) {
        setPunchInTime(punchTime);
        setStartTime(startTimestamp);
        setElapsedSeconds(elapsed || 0);
      }
    } else {
      const userPunchStateKey = getPunchStateKey(userId);
      const savedState = localStorage.getItem(userPunchStateKey);
      
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
            setElapsedSeconds(Math.floor((Date.now() - savedStartTime) / 1000));
          }
        } catch (error) {
          console.error('Error loading punch state:', error);
          localStorage.removeItem(userPunchStateKey);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkUserChange = () => {
      const newUserId = getCurrentUserId();
      
      if (!newUserId) {
        if (currentUserId) {
          resetCurrentSessionState();
          setCurrentUserId(null);
        }
        return;
      }
      
      if (!currentUserId) {
        setCurrentUserId(newUserId);
        
        const lastTransaction = getLastTransactionFromStorage();
        
        if (lastTransaction) {
          const { shouldBePunchedIn, punchTime, startTimestamp, elapsed } = 
            determinePunchStateFromTransaction(lastTransaction);
          
          setIsPunchedIn(shouldBePunchedIn);
          
          if (shouldBePunchedIn && punchTime && startTimestamp) {
            setPunchInTime(punchTime);
            setStartTime(startTimestamp);
            setElapsedSeconds(elapsed || 0);
          }
        } else {
          const userPunchStateKey = getPunchStateKey(newUserId);
          const savedState = localStorage.getItem(userPunchStateKey);
          
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
                setElapsedSeconds(Math.floor((Date.now() - savedStartTime) / 1000));
              }
            } catch (error) {
              console.error('Error loading user punch state:', error);
              localStorage.removeItem(userPunchStateKey);
            }
          }
        }
        return;
      }
      
      if (newUserId === currentUserId) {
        return;
      }
      
      if (newUserId !== currentUserId) {        
        clearUserPunchState(currentUserId);
        
        resetCurrentSessionState();
        
        setCurrentUserId(newUserId);
        
        const lastTransaction = getLastTransactionFromStorage();
        
        if (lastTransaction) {
          const { shouldBePunchedIn, punchTime, startTimestamp, elapsed } = 
            determinePunchStateFromTransaction(lastTransaction);
          
          setIsPunchedIn(shouldBePunchedIn);
          
          if (shouldBePunchedIn && punchTime && startTimestamp) {
            setPunchInTime(punchTime);
            setStartTime(startTimestamp);
            setElapsedSeconds(elapsed || 0);
          }
        } else {
          const userPunchStateKey = getPunchStateKey(newUserId);
          const savedState = localStorage.getItem(userPunchStateKey);
          
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
                setElapsedSeconds(Math.floor((Date.now() - savedStartTime) / 1000));
              }
            } catch (error) {
              console.error('Error loading new user punch state:', error);
              localStorage.removeItem(userPunchStateKey);
            }
          }
        }
      }
    };

    checkUserChange();

    const userCheckInterval = setInterval(checkUserChange, 2000);

    return () => clearInterval(userCheckInterval);
  }, [isClient, currentUserId]);

  useEffect(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    if (isPunchedIn && startTime && isClient) {
      timerInterval.current = setInterval(() => {
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(currentElapsed);
      }, 1000);
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isPunchedIn, startTime, isClient]);

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

  const togglePunch = () => {
    if (!isClient || !currentUserId) return;
    
    const currentTime = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
    
    if (!isPunchedIn) {
      const now = Date.now();
      setPunchInTime(currentTime);
      setPunchOutTime(null);
      setElapsedSeconds(0);
      setStartTime(now);
    } else {
      setPunchOutTime(currentTime);
      setStartTime(null);
    }
    
    setIsPunchedIn(!isPunchedIn);
  };

  const updateElapsedSeconds = (seconds: number) => {
    setElapsedSeconds(seconds);
  };

  return (
    <PunchContext.Provider 
      value={{ 
        isPunchedIn, 
        punchInTime, 
        punchOutTime, 
        elapsedSeconds,
        togglePunch,
        updateElapsedSeconds,
        setIsPunchedIn,
        isClient
      }}
    >
      {children}
    </PunchContext.Provider>
  );
}

export function usePunch() {
  const context = useContext(PunchContext);
  if (context === undefined) {
    throw new Error("usePunch must be used within a PunchProvider");
  }
  return context;
}