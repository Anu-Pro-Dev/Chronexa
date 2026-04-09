import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const isDev = process.env.NODE_ENV === 'development';

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
    if (!auth?.token || !auth?.userId) {
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "https://wfm.khidmah.com:5000", {
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

    newSocket.on('connect', () => {
      if (isDev) console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      if (isDev) console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      if (isDev) console.error('Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      if (isDev) console.error('Socket error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      if (isDev) console.log('Reconnected after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      if (isDev) console.log('Reconnection attempt', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      if (isDev) console.error('Reconnection error:', error.message);
    });

    newSocket.on('reconnect_failed', () => {
      if (isDev) console.error('Reconnection failed after all attempts');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [auth?.token, auth?.userId]);

  const emit = useCallback((event: string, data?: any) => {
    if (!socket) return;
    socket.emit(event, data);
  }, [socket]);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (!socket) return () => {};

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket]);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (!socket) return;

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
