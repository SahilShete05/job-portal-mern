import { io } from 'socket.io-client';
import { getToken } from './authService';

let socket = null;
let currentToken = null;

if (typeof window !== 'undefined') {
  window.addEventListener('auth:token-update', () => {
    connectSocket();
  });
}

export const connectSocket = () => {
  const token = getToken();
  if (!token) {
    return null;
  }

  if (socket && currentToken === token) {
    return socket;
  }

  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  const envBaseUrl = `${import.meta.env.VITE_API_BASE_URL}`;
  const socketOrigin = envBaseUrl ? envBaseUrl.replace(/\/api\/?$/, '') : window.location.origin;

  socket = io(`${socketOrigin}`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};

export const getSocket = () => socket;
