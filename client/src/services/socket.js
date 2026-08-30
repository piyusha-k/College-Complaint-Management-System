import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to college complaint live updates:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from event bus');
    });
  }

  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join:execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave:execution', executionId);
  }
};

export const joinUserRoom = (userId) => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join:user', userId);
  }
};
