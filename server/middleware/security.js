const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * HIPAA-compliant security middleware
 */

/**
 * Rate limiting for authentication endpoints
 * Prevents brute force attacks
 * More lenient in development mode
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // More lenient in development
  message: {
    error: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security headers middleware
 * Uses Helmet.js for security headers
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'no-referrer' }
});

/**
 * Error handler that doesn't expose PHI
 */
const secureErrorHandler = (err, req, res, next) => {
  // Log the full error server-side (for debugging)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId || 'anonymous'
  });

  // Don't expose sensitive information in error responses
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? 'An internal server error occurred' 
    : (err.message || 'An error occurred');

  res.status(statusCode).json({
    error: message,
    // Never include PHI, stack traces, or detailed error info in response
  });
};

/**
 * Validate environment variables for security
 */
const validateEnvironment = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please set these in your .env file');
    process.exit(1);
  }

  // Warn if using default JWT secret
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Please change this in production!');
  }

  // Warn if not using HTTPS in production
  if (process.env.NODE_ENV === 'production' && !process.env.FORCE_HTTPS) {
    console.warn('⚠️  WARNING: Ensure HTTPS is enabled in production for HIPAA compliance');
  }
};

module.exports = {
  authLimiter,
  apiLimiter,
  securityHeaders,
  secureErrorHandler,
  validateEnvironment
};

