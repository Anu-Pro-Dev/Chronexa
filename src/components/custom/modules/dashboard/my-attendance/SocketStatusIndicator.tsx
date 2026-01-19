'use client';
import { useSocket } from '@/src/contexts/SocketContext';

export default function SocketStatusIndicator() {
  const { isConnected } = useSocket();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div 
          className={`w-2 h-2 rounded-full ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`} 
        />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>
    </div>
  );
}