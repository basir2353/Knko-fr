import { io } from 'socket.io-client';
import config from './config';

let socket = null;

// Get Socket.IO server URL from API base URL
const getSocketUrl = () => {
  // Convert HTTP/HTTPS API URL to WebSocket URL
  const apiUrl = config.API_BASE_URL;
  if (apiUrl.startsWith('https://')) {
    // For production HTTPS, Socket.IO will use secure WebSocket
    return apiUrl;
  } else if (apiUrl.startsWith('http://')) {
    // For development HTTP
    return apiUrl;
  }
  // Fallback
  return apiUrl;
};

export const initSocket = () => {
  if (!socket) {
    const socketUrl = getSocketUrl();
    console.log('Initializing Socket.IO connection to:', socketUrl);
    
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: true // Important for CORS with credentials
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { initSocket, getSocket, disconnectSocket };

