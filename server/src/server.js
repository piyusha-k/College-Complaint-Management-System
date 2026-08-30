const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { initQueue } = require('./queues/executionQueue');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// 1. Security & Core Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local client, same-origin, or undefined (e.g. mobile/curl)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many auth requests from this IP, please try again after 15 minutes',
    },
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 2. Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Agentflow_AI (Agentic Operations Console)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    features: {
      multiAgentOrchestrator: 'active',
      langGraphSubstrate: 'available',
      inMemoryFallback: 'ready',
      socketStreaming: 'ready',
    },
  });
});

// 3. API Mounts
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// 4. 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// 5. Global Error Handler
app.use(errorHandler);

// 6. Bootstrap Server
const startServer = async () => {
  try {
    console.log('----------------------------------------------------');
    console.log('🚀 Initializing Agentflow_AI Operations Platform...');
    console.log('----------------------------------------------------');

    // Connect DB (with automatic in-memory fallback)
    await connectDB();

    // Initialize Socket.IO
    initSocket(server, env.CLIENT_URL);

    // Initialize Queue (with in-memory async queue fallback)
    initQueue();

    // Start HTTP listener
    server.listen(env.PORT, () => {
      console.log(`[Server] Agentflow_AI Backend running on http://localhost:${env.PORT}`);
      console.log(`[Server] Environment: ${env.NODE_ENV}`);
      console.log(`[Server] Client Origin: ${env.CLIENT_URL}`);
      console.log(`[Server] Health check available at http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Critical startup failure:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
