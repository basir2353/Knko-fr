const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDatabase, initDatabase } = require('../config/database');
const AuditLogger = require('../middleware/auditLogger');

// Ensure database is initialized
initDatabase();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is a practitioner
const isPractitioner = (req, res, next) => {
  if (req.user.userType !== 'practitioner') {
    return res.status(403).json({ error: 'Access denied. Practitioner only.' });
  }
  next();
};

// Validation middleware for availability
const validateAvailability = [
  body('dayOfWeek').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('startTime').notEmpty().withMessage('Start time is required')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format. Use HH:MM (24-hour format)'),
  body('endTime').notEmpty().withMessage('End time is required')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format. Use HH:MM (24-hour format)')
];

// Set/Update availability for practitioner
router.post('/availability', authenticateToken, isPractitioner, validateAvailability, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      AuditLogger.log({
        userId: req.user.userId,
        userType: req.user.userType,
        action: 'UPDATE_AVAILABILITY',
        resource: '/api/practitioner/availability',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || 'Unknown',
        status: 'FAILURE',
        details: 'Validation failed'
      });
      return res.status(400).json({ 
        error: 'Validation failed'
      });
    }

    const { dayOfWeek, startTime, endTime } = req.body;
    const practitionerId = req.user.userId;
    const db = getDatabase();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    if (!practitionerId) {
      return res.status(400).json({ error: 'Invalid practitioner ID' });
    }

    // Validate that endTime is after startTime
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check if availability already exists for this day
    db.get(
      'SELECT id FROM practitioner_availability WHERE practitionerId = ? AND dayOfWeek = ?',
      [practitionerId, dayOfWeek],
      (err, existing) => {
        if (err) {
          console.error('Database error checking availability:', err);
          return res.status(500).json({ 
            error: 'Error checking availability',
            details: err.message 
          });
        }

        if (existing) {
          // Update existing availability
          db.run(
            `UPDATE practitioner_availability 
             SET startTime = ?, endTime = ?, updatedAt = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [startTime, endTime, existing.id],
            function(updateErr) {
              if (updateErr) {
                AuditLogger.log({
                  userId: practitionerId,
                  userType: req.user.userType,
                  action: 'UPDATE_AVAILABILITY',
                  resource: '/api/practitioner/availability',
                  ipAddress,
                  userAgent,
                  status: 'FAILURE',
                  details: 'Database error'
                });
                return res.status(500).json({ 
                  error: 'An error occurred'
                });
              }

              AuditLogger.log({
                userId: practitionerId,
                userType: req.user.userType,
                action: 'UPDATE_AVAILABILITY',
                resource: '/api/practitioner/availability',
                ipAddress,
                userAgent,
                status: 'SUCCESS',
                details: `Updated availability for ${dayOfWeek}`
              });

              res.json({
                message: 'Availability updated successfully',
                availability: {
                  id: existing.id,
                  dayOfWeek,
                  startTime,
                  endTime
                }
              });
            }
          );
        } else {
          // Insert new availability
          db.run(
            `INSERT INTO practitioner_availability (practitionerId, dayOfWeek, startTime, endTime, updatedAt)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [practitionerId, dayOfWeek, startTime, endTime],
            function(insertErr) {
              if (insertErr) {
                AuditLogger.log({
                  userId: practitionerId,
                  userType: req.user.userType,
                  action: 'UPDATE_AVAILABILITY',
                  resource: '/api/practitioner/availability',
                  ipAddress,
                  userAgent,
                  status: 'FAILURE',
                  details: 'Database error'
                });
                // Check if it's a constraint violation
                if (insertErr.message && insertErr.message.includes('UNIQUE constraint')) {
                  return res.status(400).json({ 
                    error: 'Availability already exists for this day. Please update instead.'
                  });
                }
                return res.status(500).json({ 
                  error: 'An error occurred'
                });
              }

              AuditLogger.log({
                userId: practitionerId,
                userType: req.user.userType,
                action: 'UPDATE_AVAILABILITY',
                resource: '/api/practitioner/availability',
                ipAddress,
                userAgent,
                status: 'SUCCESS',
                details: `Created availability for ${dayOfWeek}`
              });

              res.json({
                message: 'Availability saved successfully',
                availability: {
                  id: this.lastID,
                  dayOfWeek,
                  startTime,
                  endTime
                }
              });
            }
          );
        }
      }
    );
  } catch (error) {
    AuditLogger.log({
      userId: req.user?.userId,
      userType: req.user?.userType,
      action: 'UPDATE_AVAILABILITY',
      resource: '/api/practitioner/availability',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'FAILURE',
      details: 'Server error'
    });
    res.status(500).json({ 
      error: 'An error occurred'
    });
  }
});

// Get own availability (for practitioner)
router.get('/availability', authenticateToken, isPractitioner, (req, res) => {
  try {
    const practitionerId = req.user.userId;
    const db = getDatabase();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    db.all(
      'SELECT * FROM practitioner_availability WHERE practitionerId = ? ORDER BY CASE dayOfWeek WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 WHEN "Sunday" THEN 7 END',
      [practitionerId],
      (err, rows) => {
        if (err) {
          AuditLogger.log({
            userId: practitionerId,
            userType: req.user.userType,
            action: 'VIEW_AVAILABILITY',
            resource: '/api/practitioner/availability',
            ipAddress,
            userAgent,
            status: 'FAILURE',
            details: 'Database error'
          });
          return res.status(500).json({ error: 'An error occurred' });
        }

        AuditLogger.log({
          userId: practitionerId,
          userType: req.user.userType,
          action: 'VIEW_AVAILABILITY',
          resource: '/api/practitioner/availability',
          ipAddress,
          userAgent,
          status: 'SUCCESS',
          details: 'Viewed own availability'
        });

        res.json({ availability: rows || [] });
      }
    );
  } catch (error) {
    AuditLogger.log({
      userId: req.user?.userId,
      userType: req.user?.userType,
      action: 'VIEW_AVAILABILITY',
      resource: '/api/practitioner/availability',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'FAILURE',
      details: 'Server error'
    });
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Delete availability slot
router.delete('/availability/:id', authenticateToken, isPractitioner, (req, res) => {
  try {
    const availabilityId = req.params.id;
    const practitionerId = req.user.userId;
    const db = getDatabase();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    db.run(
      'DELETE FROM practitioner_availability WHERE id = ? AND practitionerId = ?',
      [availabilityId, practitionerId],
      function(err) {
        if (err) {
          AuditLogger.log({
            userId: practitionerId,
            userType: req.user.userType,
            action: 'DELETE_AVAILABILITY',
            resource: `/api/practitioner/availability/${availabilityId}`,
            ipAddress,
            userAgent,
            status: 'FAILURE',
            details: 'Database error'
          });
          return res.status(500).json({ error: 'An error occurred' });
        }

        if (this.changes === 0) {
          AuditLogger.log({
            userId: practitionerId,
            userType: req.user.userType,
            action: 'DELETE_AVAILABILITY',
            resource: `/api/practitioner/availability/${availabilityId}`,
            ipAddress,
            userAgent,
            status: 'FAILURE',
            details: 'Availability not found'
          });
          return res.status(404).json({ error: 'Availability not found' });
        }

        AuditLogger.log({
          userId: practitionerId,
          userType: req.user.userType,
          action: 'DELETE_AVAILABILITY',
          resource: `/api/practitioner/availability/${availabilityId}`,
          ipAddress,
          userAgent,
          status: 'SUCCESS',
          details: 'Availability deleted'
        });

        res.json({ message: 'Availability deleted successfully' });
      }
    );
  } catch (error) {
    AuditLogger.log({
      userId: req.user?.userId,
      userType: req.user?.userType,
      action: 'DELETE_AVAILABILITY',
      resource: `/api/practitioner/availability/${req.params.id}`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'FAILURE',
      details: 'Server error'
    });
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Heartbeat endpoint for practitioners to update their active status (kept for HTTP fallback)
router.post('/heartbeat', authenticateToken, isPractitioner, (req, res) => {
  try {
    const practitionerId = req.user.userId;
    const db = getDatabase();
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Update last activity timestamp, or insert if doesn't exist
    db.run(
      `INSERT OR REPLACE INTO active_sessions (userId, lastActivity, ipAddress, userAgent)
       VALUES (?, CURRENT_TIMESTAMP, ?, ?)`,
      [practitionerId, ipAddress, userAgent],
      function(err) {
        if (err) {
          console.error('Error updating heartbeat:', err);
          return res.status(500).json({ error: 'An error occurred' });
        }
        
        // Emit socket event for real-time update
        const io = req.app.get('io');
        if (io) {
          io.emit('practitioner:status', {
            userId: practitionerId,
            isActive: true,
            lastActivity: new Date().toISOString()
          });
        }
        
        res.json({ message: 'Heartbeat updated' });
      }
    );
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Get all practitioners with their availability and active status (for admin and users)
router.get('/all', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.userId;
    const userType = req.user.userType;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // Get all practitioners
    db.all(
      `SELECT id, firstName, lastName, email, userType 
       FROM users 
       WHERE userType = 'practitioner'`,
      [],
      (err, practitioners) => {
        if (err) {
          AuditLogger.log({
            userId,
            userType,
            action: 'VIEW_PRACTITIONERS',
            resource: '/api/practitioner/all',
            ipAddress,
            userAgent,
            status: 'FAILURE',
            details: 'Database error'
          });
          return res.status(500).json({ error: 'An error occurred' });
        }

        // Get availability for each practitioner
        const practitionerIds = practitioners.map(p => p.id);
        if (practitionerIds.length === 0) {
          AuditLogger.log({
            userId,
            userType,
            action: 'VIEW_PRACTITIONERS',
            resource: '/api/practitioner/all',
            ipAddress,
            userAgent,
            status: 'SUCCESS',
            details: 'No practitioners found'
          });
          return res.json({ practitioners: [] });
        }

        const placeholders = practitionerIds.map(() => '?').join(',');
        
        // Get availability
        db.all(
          `SELECT * FROM practitioner_availability 
           WHERE practitionerId IN (${placeholders})
           ORDER BY practitionerId, CASE dayOfWeek WHEN "Monday" THEN 1 WHEN "Tuesday" THEN 2 WHEN "Wednesday" THEN 3 WHEN "Thursday" THEN 4 WHEN "Friday" THEN 5 WHEN "Saturday" THEN 6 WHEN "Sunday" THEN 7 END`,
          practitionerIds,
          (err, availabilityRows) => {
            if (err) {
              AuditLogger.log({
                userId,
                userType,
                action: 'VIEW_PRACTITIONERS',
                resource: '/api/practitioner/all',
                ipAddress,
                userAgent,
                status: 'FAILURE',
                details: 'Database error fetching availability'
              });
              return res.status(500).json({ error: 'An error occurred' });
            }

            // Get active sessions - check for sessions active in last 5 minutes
            db.all(
              `SELECT userId, lastActivity, createdAt 
               FROM active_sessions 
               WHERE userId IN (${placeholders})
               AND datetime(lastActivity) > datetime('now', '-5 minutes')`,
              practitionerIds,
              (err, activeSessions) => {
                if (err) {
                  console.error('Error fetching active sessions:', err);
                  // Continue without active status if there's an error
                  activeSessions = [];
                } else {
                  console.log(`Found ${activeSessions ? activeSessions.length : 0} active practitioners`);
                }

                // Create map of active practitioners
                const activeMap = {};
                if (activeSessions && activeSessions.length > 0) {
                  activeSessions.forEach(session => {
                    activeMap[session.userId] = {
                      isActive: true,
                      lastActivity: session.lastActivity
                    };
                  });
                }

                // Group availability by practitioner
                const availabilityMap = {};
                availabilityRows.forEach(avail => {
                  if (!availabilityMap[avail.practitionerId]) {
                    availabilityMap[avail.practitionerId] = [];
                  }
                  availabilityMap[avail.practitionerId].push({
                    id: avail.id,
                    dayOfWeek: avail.dayOfWeek,
                    startTime: avail.startTime,
                    endTime: avail.endTime
                  });
                });

                // Combine practitioners with their availability and active status
                const practitionersWithAvailability = practitioners.map(practitioner => ({
                  id: practitioner.id,
                  firstName: practitioner.firstName,
                  lastName: practitioner.lastName,
                  email: practitioner.email,
                  availability: availabilityMap[practitioner.id] || [],
                  isActive: activeMap[practitioner.id]?.isActive || false,
                  lastActivity: activeMap[practitioner.id]?.lastActivity || null
                }));

                AuditLogger.log({
                  userId,
                  userType,
                  action: 'VIEW_PRACTITIONERS',
                  resource: '/api/practitioner/all',
                  ipAddress,
                  userAgent,
                  status: 'SUCCESS',
                  details: `Viewed ${practitionersWithAvailability.length} practitioners`
                });

                res.json({ practitioners: practitionersWithAvailability });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    AuditLogger.log({
      userId: req.user?.userId,
      userType: req.user?.userType,
      action: 'VIEW_PRACTITIONERS',
      resource: '/api/practitioner/all',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'FAILURE',
      details: 'Server error'
    });
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;

