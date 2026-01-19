import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketIOProps {
  auth?: {
    token?: string | null;
    userId?: string | null;
  };
}

export function useSocketIO({ auth }: UseSocketIOProps = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have valid auth data
    if (!auth?.token || !auth?.userId) {
      console.log('⚠️ No auth data provided, socket will not connect');
      return;
    }

    console.log('🔌 Attempting to connect with userId:', auth.userId);

    // Create socket with authentication
    const newSocket = io('http://localhost:8000', {
      auth: {
        token: auth.token,
        userId: auth.userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully:', newSocket.id);
      console.log('👤 Authenticated as userId:', auth.userId);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔴 Reconnection error:', error.message);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('🔴 Reconnection failed after all attempts');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [auth?.token, auth?.userId]);

  const emit = useCallback((event: string, data?: any) => {
    if (!socket) {
      console.warn('⚠️ Cannot emit, socket not connected');
      return;
    }
    if (!isConnected) {
      console.warn('⚠️ Socket is not connected, event may not be sent');
    }
    console.log('📤 Emitting event:', event, data);
    socket.emit(event, data);
  }, [socket, isConnected]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socket) {
      console.warn('⚠️ Cannot listen, socket not available');
      return () => {};
    }
    
    console.log('👂 Listening for event:', event);
    socket.on(event, callback);
    
    // Return cleanup function
    return () => {
      console.log('🧹 Cleaning up listener for:', event);
      socket.off(event, callback);
    };
  }, [socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (!socket) {
      console.warn('⚠️ Cannot remove listener, socket not available');
      return;
    }
    
    console.log('🔇 Removing listener for:', event);
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }, [socket]);

  return { 
    socket, 
    isConnected, 
    emit, 
    on, 
    off 
  };
}