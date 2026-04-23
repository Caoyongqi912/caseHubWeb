import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<{
  socket: Socket | null;
  logs: string[];
  addLog: (msg: string) => void;
  clearLogs: () => void;
}>({
  socket: null,
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
});

export const SocketProvider = ({
  children,
  currentUserId,
}: {
  children: React.ReactNode;
  currentUserId: string | undefined;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    if (!currentUserId) return;

    const newSocket = io('wss://', {
      // transports: ['websocket'], // ✅ 强制仅使用 WebSocket
      upgrade: true,
      query: { clientId: currentUserId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
    newSocket.on('connect', () => {
      console.log('Socket Context connected');
      console.log(newSocket);
    });
    newSocket.onAny((event, ...args) => {
      console.log('收到事件:', event, args);
    });

    newSocket.on('log', (data: { code: number; msg: string }) => {
      const { msg, code } = data;
      if (code === 0) {
        addLog(msg);
      } else {
        addLog('完成');
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  return (
    <SocketContext.Provider value={{ socket, logs, addLog, clearLogs }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
