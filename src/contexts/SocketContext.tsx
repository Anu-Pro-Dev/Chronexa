'use client';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSocketIO } from '@/src/hooks/useSocketIO';
import { getAuthToken } from '@/src/utils/authToken';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const userDataStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setAuthToken(token);
        setUserId(userData.userId?.toString());
      } catch (error) {
        // Failed to parse user data
      }
    }
  }, []);

  const authConfig = useMemo(() => ({
    token: authToken,
    userId: userId,
  }), [authToken, userId]);

  const socketData = useSocketIO({ auth: authConfig });

  const contextValue = useMemo(() => ({
    socket: socketData.socket,
    isConnected: socketData.isConnected,
    emit: socketData.emit,
    on: socketData.on,
  }), [socketData.socket, socketData.isConnected, socketData.emit, socketData.on]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
