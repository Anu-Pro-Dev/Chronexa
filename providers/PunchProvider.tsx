"use client";
import React, { createContext, useContext, useState } from "react";

type PunchContextType = {
  isPunchedIn: boolean;
  punchInTime: string | null;
  punchOutTime: string | null;
  elapsedSeconds: number;
  togglePunch: () => void;
  updateElapsedSeconds: (seconds: number) => void;
};

const PunchContext = createContext<PunchContextType | undefined>(undefined);

export function PunchProvider({ children }: { children: React.ReactNode }) {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const togglePunch = () => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    if (!isPunchedIn) {
      setPunchInTime(currentTime);
      setPunchOutTime(null);
      setElapsedSeconds(0);
    } else {
      setPunchOutTime(currentTime);
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
        updateElapsedSeconds
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
