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
    console.log('🔍 SocketProvider mounted - checking auth...');
    
    const token = getAuthToken();
    console.log('Token from getAuthToken():', token ? 'Found' : 'Not found');
    
    const userDataStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    console.log('user from storage:', userDataStr ? 'Found' : 'Not found');
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log('✅ Parsed user data:', userData);
        setAuthToken(token);
        setUserId(userData.userId?.toString());
        console.log('✅ Socket auth loaded for userId:', userData.userId);
      } catch (error) {
        console.error('❌ Failed to parse user data:', error);
      }
    } else {
      console.warn('⚠️ Missing auth data - Token:', !!token, 'UserData:', !!userDataStr);
    }
  }, []);

  const authConfig = useMemo(() => {
    console.log('📦 Auth config:', { hasToken: !!authToken, userId });
    return {
      token: authToken,
      userId: userId,
    };
  }, [authToken, userId]);

  const socketData = useSocketIO({ auth: authConfig });

  useEffect(() => {
    console.log('🔌 Socket connection status:', socketData.isConnected);
  }, [socketData.isConnected]);

  return (
    <SocketContext.Provider value={socketData}>
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