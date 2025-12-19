const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../config/database');
const AuditLogger = require('../middleware/auditLogger');
const { authLimiter } = require('../middleware/security');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// HIPAA-compliant token expiration: 1 hour (shorter than before for better security)
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '1h';

// Validation middleware
const validateSignup = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('userType').isIn(['patient', 'admin', 'practitioner']).withMessage('Invalid user type')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Signup endpoint with rate limiting
router.post('/signup', authLimiter, validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log failed signup attempt
      AuditLogger.log({
        userId: null,
        userType: 'anonymous',
        action: 'SIGNUP',
        resource: '/api/auth/signup',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || 'Unknown',
        status: 'FAILURE',
        details: 'Validation failed'
      });
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { email, password, firstName, lastName, userType } = req.body;
    const db = getDatabase();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        AuditLogger.log({
          userId: null,
          userType: 'anonymous',
          action: 'SIGNUP',
          resource: '/api/auth/signup',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Database error'
        });
        return res.status(500).json({ error: 'An error occurred' });
      }

      if (user) {
        AuditLogger.log({
          userId: null,
          userType: 'anonymous',
          action: 'SIGNUP',
          resource: '/api/auth/signup',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Email already exists'
        });
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Enhanced password requirements for HIPAA compliance
      if (password.length < 8) {
        AuditLogger.log({
          userId: null,
          userType: 'anonymous',
          action: 'SIGNUP',
          resource: '/api/auth/signup',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Password too short'
        });
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // Hash password with higher salt rounds for better security
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert new user
      db.run(
        'INSERT INTO users (email, password, firstName, lastName, userType) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, firstName, lastName, userType],
        function(err) {
          if (err) {
            AuditLogger.log({
              userId: null,
              userType: 'anonymous',
              action: 'SIGNUP',
              resource: '/api/auth/signup',
              ipAddress,
              userAgent,
              status: 'FAILURE',
              details: 'Error creating user'
            });
            return res.status(500).json({ error: 'An error occurred' });
          }

          // Generate JWT token with shorter expiration
          const token = jwt.sign(
            { userId: this.lastID, email, userType },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRATION }
          );

          // Log successful signup
          AuditLogger.log({
            userId: this.lastID,
            userType,
            action: 'SIGNUP',
            resource: '/api/auth/signup',
            ipAddress,
            userAgent,
            status: 'SUCCESS',
            details: 'User created'
          });

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
              id: this.lastID,
              email,
              firstName,
              lastName,
              userType
            }
          });
        }
      );
    });
  } catch (error) {
    AuditLogger.log({
      userId: null,
      userType: 'anonymous',
      action: 'SIGNUP',
      resource: '/api/auth/signup',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'FAILURE',
      details: 'Server error'
    });
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Login endpoint with rate limiting
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      AuditLogger.log({
        userId: null,
        userType: 'anonymous',
        action: 'LOGIN',
        resource: '/api/auth/login',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || 'Unknown',
        status: 'FAILURE',
        details: 'Validation failed'
      });
      return res.status(400).json({ error: 'Validation failed' });
    }

    const { email, password } = req.body;
    const db = getDatabase();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        AuditLogger.log({
          userId: null,
          userType: 'anonymous',
          action: 'LOGIN',
          resource: '/api/auth/login',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Database error'
        });
        return res.status(500).json({ error: 'An error occurred' });
      }

      if (!user) {
        // Log failed login attempt (generic message, don't reveal if user exists)
        AuditLogger.log({
          userId: null,
          userType: 'anonymous',
          action: 'LOGIN',
          resource: '/api/auth/login',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Invalid credentials'
        });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        // Log failed login attempt
        AuditLogger.log({
          userId: user.id,
          userType: user.userType,
          action: 'LOGIN',
          resource: '/api/auth/login',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Invalid password'
        });
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token with shorter expiration
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRATION }
      );

      // If user is a practitioner, mark them as active
      if (user.userType === 'practitioner') {
        db.run(
          `INSERT OR REPLACE INTO active_sessions (userId, lastActivity, ipAddress, userAgent)
           VALUES (?, CURRENT_TIMESTAMP, ?, ?)`,
          [user.id, ipAddress, userAgent],
          function(err) {
            if (err) {
              console.error('Error updating active session:', err);
              // Don't fail login if session tracking fails
            } else {
              console.log(`Practitioner ${user.id} marked as active`);
              // Emit socket event for real-time update
              const io = req.app.get('io');
              if (io) {
                io.emit('practitioner:status', {
                  userId: user.id,
                  isActive: true,
                  lastActivity: new Date().toISOString(),
                  practitioner: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                  }
                });
              }
            }
          }
        );
      }

      // Log successful login
      AuditLogger.log({
        userId: user.id,
        userType: user.userType,
        action: 'LOGIN',
        resource: '/api/auth/login',
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        details: 'Login successful'
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        }
      });
    });
  } catch (error) {
    AuditLogger.log({
      userId: null,
      userType: 'anonymous',
      action: 'LOGIN',
      resource: '/api/auth/login',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'FAILURE',
      details: 'Server error'
    });
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Logout endpoint - mark practitioner as inactive
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'Unknown';

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDatabase();

    // If user is a practitioner, mark them as inactive
    if (decoded.userType === 'practitioner') {
      db.run(
        'DELETE FROM active_sessions WHERE userId = ?',
        [decoded.userId],
        (err) => {
          if (err) {
            console.error('Error removing active session:', err);
            // Don't fail logout if session removal fails
          } else {
            // Emit socket event for real-time update
            const io = req.app.get('io');
            if (io) {
              io.emit('practitioner:status', {
                userId: decoded.userId,
                isActive: false,
                lastActivity: null
              });
            }
          }
        }
      );
    }

    AuditLogger.log({
      userId: decoded.userId,
      userType: decoded.userType || 'unknown',
      action: 'LOGOUT',
      resource: '/api/auth/logout',
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: 'Logout successful'
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    AuditLogger.log({
      userId: null,
      userType: 'anonymous',
      action: 'LOGOUT',
      resource: '/api/auth/logout',
      ipAddress,
      userAgent,
      status: 'FAILURE',
      details: 'Invalid or expired token'
    });
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'Unknown';

  if (!token) {
    AuditLogger.log({
      userId: null,
      userType: 'anonymous',
      action: 'VERIFY_TOKEN',
      resource: '/api/auth/verify',
      ipAddress,
      userAgent,
      status: 'FAILURE',
      details: 'No token provided'
    });
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDatabase();

    // Fetch full user information from database
    db.get('SELECT id, email, firstName, lastName, userType FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err) {
        AuditLogger.log({
          userId: decoded.userId,
          userType: decoded.userType || 'unknown',
          action: 'VERIFY_TOKEN',
          resource: '/api/auth/verify',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'Database error'
        });
        return res.status(500).json({ error: 'An error occurred' });
      }

      if (!user) {
        AuditLogger.log({
          userId: decoded.userId,
          userType: decoded.userType || 'unknown',
          action: 'VERIFY_TOKEN',
          resource: '/api/auth/verify',
          ipAddress,
          userAgent,
          status: 'FAILURE',
          details: 'User not found'
        });
        return res.status(401).json({ error: 'Invalid token' });
      }

      AuditLogger.log({
        userId: user.id,
        userType: user.userType,
        action: 'VERIFY_TOKEN',
        resource: '/api/auth/verify',
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        details: 'Token verified'
      });

      res.json({
        valid: true,
        user: {
          id: user.id,
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType
        }
      });
    });
  } catch (error) {
    AuditLogger.log({
      userId: null,
      userType: 'anonymous',
      action: 'VERIFY_TOKEN',
      resource: '/api/auth/verify',
      ipAddress,
      userAgent,
      status: 'FAILURE',
      details: 'Invalid or expired token'
    });
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;

