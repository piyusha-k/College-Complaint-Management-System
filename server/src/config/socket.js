const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join execution room for live streaming
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined execution:${executionId}`);
      }
    });

    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
        console.log(`[Socket.IO] Socket ${socket.id} left execution:${executionId}`);
      }
    });

    // Join user channel for notifications
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] IO instance not initialized yet');
  }
  return io;
};

const broadcastAgentEvent = (executionId, logEvent) => {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit('agent:event', logEvent);
    io.emit('agent:activity', logEvent); // Global activity feed for dashboard
  }
};

const broadcastExecutionStatus = (executionId, statusData) => {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit('execution:status', statusData);
    io.emit('execution:update', { executionId, ...statusData });
  }
};

const broadcastNotification = (userId, notification) => {
  if (io) {
    if (userId) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    } else {
      io.emit('notification:new', notification);
    }
  }
};

module.exports = {
  initSocket,
  getIO,
  broadcastAgentEvent,
  broadcastExecutionStatus,
  broadcastNotification,
};
