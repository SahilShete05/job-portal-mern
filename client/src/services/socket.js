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

  const envBaseUrl = import.meta.env?.VITE_API_BASE_URL;
  const normalizedEnv = typeof envBaseUrl === 'string' ? envBaseUrl.trim() : '';
  let socketOrigin = window.location.origin;

  if (normalizedEnv) {
    if (normalizedEnv.startsWith('/')) {
      socketOrigin = `${window.location.origin}${normalizedEnv}`.replace(/\/api\/?$/, '');
    } else {
      try {
        socketOrigin = new URL(normalizedEnv).toString().replace(/\/api\/?$/, '').replace(/\/$/, '');
      } catch (error) {
        console.warn('[socket] Invalid VITE_API_BASE_URL, using fallback.');
      }
    }
  }

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
