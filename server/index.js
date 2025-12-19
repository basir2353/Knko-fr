const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const practitionerRoutes = require('./routes/practitioner');
const { initDatabase } = require('./config/database');
const { securityHeaders, apiLimiter, secureErrorHandler, validateEnvironment } = require('./middleware/security');
const AuditLogger = require('./middleware/auditLogger');

dotenv.config();

// Validate environment variables
validateEnvironment();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Helper function to get allowed origins
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin)
      : [];
    
    if (allowedOrigins.length === 0) {
      console.warn('⚠️  WARNING: ALLOWED_ORIGINS not set in production. CORS will block all requests!');
    } else {
      console.log('✅ CORS allowed origins:', allowedOrigins);
    }
    
    return allowedOrigins;
  }
  return "*"; // Allow all origins in development
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Trust proxy for accurate IP addresses (important for audit logging)
app.set('trust proxy', 1);

// CORS configuration - MUST be before other middleware to handle preflight requests
const allowedOriginsList = getAllowedOrigins();
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, check against allowed origins list
      if (Array.isArray(allowedOriginsList) && allowedOriginsList.length > 0) {
        if (allowedOriginsList.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`❌ CORS blocked origin: ${origin}. Allowed origins: ${allowedOriginsList.join(', ')}`);
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        // If ALLOWED_ORIGINS is not set, block all requests in production
        console.error(`❌ CORS ERROR: ALLOWED_ORIGINS not configured in production. Blocking request from: ${origin}`);
        callback(new Error('CORS not configured. Please set ALLOWED_ORIGINS environment variable.'));
      }
    } else {
      // In development, allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};
app.use(cors(corsOptions));

// Security middleware - after CORS
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - skip OPTIONS requests (preflight)
app.use('/api/', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next(); // Skip rate limiting for OPTIONS requests
  }
  apiLimiter(req, res, next);
});

// Audit logging middleware
app.use(AuditLogger.middleware());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/practitioner', practitionerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    cors: {
      allowedOrigins: getAllowedOrigins(),
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

// Catch-all handler for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Secure error handler (must be last)
app.use(secureErrorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle practitioner heartbeat via socket
  socket.on('practitioner:heartbeat', async (data) => {
    try {
      const { userId } = data;
      if (userId) {
        // Update active session in database
        const { getDatabase } = require('./config/database');
        const db = getDatabase();
        const ipAddress = socket.handshake.address;
        const userAgent = socket.handshake.headers['user-agent'] || 'Unknown';

        db.run(
          `INSERT OR REPLACE INTO active_sessions (userId, lastActivity, ipAddress, userAgent)
           VALUES (?, CURRENT_TIMESTAMP, ?, ?)`,
          [userId, ipAddress, userAgent],
          (err) => {
            if (err) {
              console.error('Error updating heartbeat:', err);
            } else {
              // Emit to all admins that this practitioner is active
              io.emit('practitioner:status', {
                userId,
                isActive: true,
                lastActivity: new Date().toISOString()
              });
            }
          }
        );
      }
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`Please either:`);
    console.error(`  1. Stop the process using port ${PORT}`);
    console.error(`  2. Or change the PORT in .env file\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

