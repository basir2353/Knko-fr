const express = require('express');
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
const PORT = process.env.PORT || 5001;

// Trust proxy for accurate IP addresses (important for audit logging)
app.set('trust proxy', 1);

// Security middleware - must be first
app.use(securityHeaders);

// CORS configuration - restrict in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, check against allowed origins
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(o => o) || [];
      // Always allow the Vercel frontend
      allowedOrigins.push('https://knko-fr.vercel.app');
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Allow all origins in development (including localhost)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Audit logging middleware
app.use(AuditLogger.middleware());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/practitioner', practitionerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
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

