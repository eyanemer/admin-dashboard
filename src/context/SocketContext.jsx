import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let activeSocket = null;

    if (isAuthenticated) {
      const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🔌 Connexion WebSocket vers :', serverUrl);
      
      activeSocket = io(serverUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
      });

      activeSocket.on('connect', () => {
        console.log('⚡ Connecté au serveur WebSocket. ID :', activeSocket.id);
      });

      activeSocket.on('disconnect', (reason) => {
        console.log('🔌 Déconnecté du serveur WebSocket. Raison :', reason);
      });

      activeSocket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion WebSocket :', error);
      });

      setSocket(activeSocket);
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }

    return () => {
      if (activeSocket) {
        activeSocket.close();
      }
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContext;
