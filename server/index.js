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
// Hardcoded origins ensure CORS works even if environment variables aren't set
const getAllowedOrigins = () => {
  // Default allowed origins - hardcoded for reliability
  const defaultOrigins = [
    'https://knko-fr.vercel.app',  // Production frontend
    'http://localhost:3000'        // Local development
  ];
  
  // Merge with environment variable if set
  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin);
    
    // Combine and remove duplicates
    const allOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
    console.log('✅ CORS allowed origins:', allOrigins);
    return allOrigins;
  }
  
  // Use defaults if environment variable not set
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  ALLOWED_ORIGINS not set, using default origins:', defaultOrigins);
    console.log('   You can set ALLOWED_ORIGINS environment variable to add more origins.');
  } else {
    console.log('✅ CORS: Using default allowed origins:', defaultOrigins);
  }
  
  return defaultOrigins;
};

// Initialize Socket.IO with CORS
const allowedOriginsForSocket = getAllowedOrigins();
const io = new Server(server, {
  cors: {
    origin: allowedOriginsForSocket,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// Trust proxy for accurate IP addresses (important for audit logging)
app.set('trust proxy', 1);

// CORS configuration - MUST be before other middleware to handle preflight requests
// This handles preflight OPTIONS requests and adds CORS headers to all responses
const allowedOriginsList = getAllowedOrigins();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    // This is important for server-to-server communication
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list
    if (allowedOriginsList.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOriginsList.join(', ')}`);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true,  // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,  // Return 200 for OPTIONS requests
  preflightContinue: false     // Let CORS middleware handle preflight
};

// Apply CORS middleware to ALL routes - this must be before any other middleware
app.use(cors(corsOptions));

// Explicit OPTIONS handler as a safety net (handles preflight requests)
// This ensures OPTIONS requests return 200 with proper headers
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // For browser preflight requests, origin will always be present
  // If origin is present and allowed, send CORS headers
  if (origin && allowedOriginsList.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(200).end();
  }
  
  // No origin or origin not allowed - for preflight, we should still return 200
  // but without CORS headers (browser will block the actual request)
  if (!origin) {
    // Request without origin (server-to-server), just return 200
    return res.status(200).end();
  }
  
  // Origin not allowed - return 403
  res.status(403).end();
});

// Security middleware - after CORS
app.use(securityHeaders);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - skip OPTIONS requests (preflight)
// IMPORTANT: Rate limiting must come AFTER CORS middleware
app.use('/api/', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Skip rate limiting for preflight OPTIONS requests
    return next();
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

// CORS error handler - must be before secureErrorHandler to preserve CORS headers
// This ensures CORS headers are sent even when errors occur
app.use((err, req, res, next) => {
  // If it's a CORS error, send proper CORS headers in the error response
  if (err.message && (err.message.includes('CORS') || err.message.includes('not allowed'))) {
    const origin = req.headers.origin;
    if (origin && allowedOriginsList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    // Return CORS error immediately without continuing to secureErrorHandler
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed by CORS policy'
    });
  }
  next(err);
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
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.IO server initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Display CORS configuration on startup
  const origins = getAllowedOrigins();
  console.log(`✅ CORS configured for ${origins.length} origin(s): ${origins.join(', ')}`);
  console.log('');
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

