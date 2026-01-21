'use client';
import { useEffect, useState, useMemo } from "react";
import { useSocketIO } from "@/src/hooks/useSocketIO";
import { getAuthToken } from "@/src/utils/authToken";

export default function SocketTestPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthData = () => {
      try {
        const token = getAuthToken();
        
        if (!token) {
          setAuthError('No valid authentication token found. Please login first.');
          console.warn('⚠️ No auth token found');
          return;
        }

        const userDataStr = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          setAuthToken(token);
          setUserId(user.userId?.toString());
          setUserData(user);
          setAuthError(null);
          console.log('Loaded real auth data:', { userId: user.userId, hasToken: !!token });
        } else {
          setAuthError('User data not found. Please login again.');
          console.warn('No user data found');
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
        setAuthError('Failed to load authentication data');
      }
    };

    loadAuthData();
  }, []);

  const authConfig = useMemo(() => ({
    token: authToken,
    userId: userId,
  }), [authToken, userId]);

  const { isConnected, socket, emit, on } = useSocketIO({
    auth: authConfig,
  });

  useEffect(() => {
    if (!isConnected) return;

    console.log('Setting up listeners...');

    const eventNames = ['message', 'update', 'notification', 'test', 'attendance', 'punch'];
    
    const cleanups = eventNames.map(eventName => {
      return on(eventName, (data: any) => {
        const msg = `[${eventName}] ${JSON.stringify(data)}`;
        console.log('Event received:', msg);
        setMessages(prev => [...prev, msg]);
      });
    });

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [isConnected, on]);

  const handleSendTest = () => {
    console.log('Sending test message...');
    emit('test', { message: 'Hello from Next.js!', timestamp: Date.now() });
    setEvents(prev => [...prev, `Sent: test event at ${new Date().toLocaleTimeString()}`]);
  };

  const handleClearLogs = () => {
    setMessages([]);
    setEvents([]);
  };

  const handleGoToLogin = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-2">Socket.IO Connection Test</h1>
          <p className="text-gray-600">Check your browser console (F12) for detailed logs</p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-1">Authentication Required</h3>
                <p className="text-red-700 text-sm mb-3">{authError}</p>
                <button
                  onClick={handleGoToLogin}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Go to Login Page
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Token:</span>
              <span className={authToken ? 'text-green-600' : 'text-red-600'}>
                {authToken ? '✓ Valid' : '✗ Not found'}
              </span>
              {authToken && (
                <code className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {authToken.substring(0, 20)}...
                </code>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">User ID:</span>
              <span className={userId ? 'text-green-600' : 'text-red-600'}>
                {userId || '✗ Not found'}
              </span>
            </div>
            
            {userData && (
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="font-semibold mb-2">User Details:</div>
                <div className="space-y-1 text-xs">
                  <div><span className="font-medium">Name:</span> {userData.employeename?.firsteng} {userData.employeename?.lasteng}</div>
                  {userData.employeename?.firstarb && (
                    <div><span className="font-medium">Arabic:</span> {userData.employeename.firstarb}</div>
                  )}
                  <div><span className="font-medium">Role:</span> {userData.role}</div>
                  <div><span className="font-medium">Employee #:</span> {userData.employeenumber}</div>
                  <div><span className="font-medium">Subject ID:</span> {userData.subjectId}</div>
                  <div><span className="font-medium">Geofence:</span> {userData.isGeofence ? 'Enabled' : 'Disabled'}</div>
                  <div><span className="font-medium">Radius:</span> {userData.radius}m</div>
                  {userData.lastTransaction && (
                    <div><span className="font-medium">Last Transaction:</span> {userData.lastTransaction.type} at {new Date(userData.lastTransaction.date).toLocaleString()}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Connection Status</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-semibold text-lg">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {!isConnected && authToken && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                Socket is attempting to connect. If this persists, check:
                <ul className="list-disc list-inside mt-2 ml-2">
                  <li>Backend server is running on http://localhost:8000</li>
                  <li>Your token is valid and not expired</li>
                  <li>Backend authentication middleware is configured correctly</li>
                </ul>
              </div>
            )}
            
            {socket && (
              <>
                <div className="text-sm">
                  <span className="font-semibold">Socket ID:</span>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">{socket.id}</code>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Server URL:</span>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8000</code>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSendTest}
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Test Message
            </button>
            <button
              onClick={() => {
                if (isConnected && userData) {
                  emit('attendance:punch', { 
                    userId: userData.userId, 
                    type: 'IN',
                    timestamp: Date.now() 
                  });
                  setEvents(prev => [...prev, `Sent: punch IN at ${new Date().toLocaleTimeString()}`]);
                }
              }}
              disabled={!isConnected || !userData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Punch IN
            </button>
            <button
              onClick={() => {
                if (isConnected && userData) {
                  emit('attendance:punch', { 
                    userId: userData.userId, 
                    type: 'OUT',
                    timestamp: Date.now() 
                  });
                  setEvents(prev => [...prev, `Sent: punch OUT at ${new Date().toLocaleTimeString()}`]);
                }
              }}
              disabled={!isConnected || !userData}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Punch OUT
            </button>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Events Sent */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Events Sent</h2>
          <div className="bg-gray-50 p-4 rounded max-h-48 overflow-auto font-mono text-sm">
            {events.length === 0 ? (
              <div className="text-gray-400">No events sent yet...</div>
            ) : (
              events.map((event, i) => (
                <div key={i} className="mb-1 text-blue-600">{event}</div>
              ))
            )}
          </div>
        </div>

        {/* Messages Received */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Messages Received</h2>
          <div className="bg-gray-50 p-4 rounded max-h-64 overflow-auto font-mono text-sm">
            {messages.length === 0 ? (
              <div className="text-gray-400">No messages received yet...</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="mb-1 text-green-600 break-all">{msg}</div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold mb-2">📋 How to Use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>Login Required</strong> - You must be logged in to test the Socket connection</li>
            <li>This page automatically loads your authentication from the login session</li>
            <li>Check if "Token" and "User ID" show as "Valid/Found"</li>
            <li>Check if "Connection Status" shows "Connected"</li>
            <li>Open browser console (F12) to see detailed logs</li>
            <li>Use the action buttons to test Socket events</li>
            <li>Watch for messages in the "Messages Received" section</li>
            <li>Check your backend logs for received events</li>
          </ol>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
            <strong>Note:</strong> This page uses your real authentication session. Make sure you're logged in before accessing this test page.
          </div>
        </div>
      </div>
    </div>
  );
}