import { io } from 'socket.io-client';

const socket = io(window.location.origin, {
  reconnectionAttempts: 5,
  timeout: 10000,
});

socket.on('connect', () => {
  console.log('[Socket] Connected to server signaling channel');
});

socket.on('connect_error', (error) => {
  console.warn('[Socket] Connection attempt failed:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});

export default socket;
