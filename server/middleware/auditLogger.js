const { getDatabase } = require('../config/database');

/**
 * HIPAA-compliant audit logging middleware
 * Logs all access to Protected Health Information (PHI)
 */
class AuditLogger {
  /**
   * Log an audit event
   * @param {Object} event - Event details
   * @param {string} event.userId - User ID performing the action
   * @param {string} event.userType - Type of user
   * @param {string} event.action - Action performed (e.g., 'LOGIN', 'VIEW_PHI', 'UPDATE_PHI', 'DELETE_PHI')
   * @param {string} event.resource - Resource accessed
   * @param {string} event.ipAddress - IP address of the request
   * @param {string} event.userAgent - User agent string
   * @param {string} event.status - Status of the action ('SUCCESS', 'FAILURE')
   * @param {string} event.details - Additional details (without PHI)
   */
  static log(event) {
    const db = getDatabase();
    const {
      userId,
      userType,
      action,
      resource,
      ipAddress,
      userAgent,
      status = 'SUCCESS',
      details = null
    } = event;

    // Sanitize details to ensure no PHI is logged
    const sanitizedDetails = details ? this.sanitizeDetails(details) : null;

    db.run(
      `INSERT INTO audit_logs (
        userId, userType, action, resource, ipAddress, userAgent, status, details, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, userType, action, resource, ipAddress, userAgent, status, sanitizedDetails],
      (err) => {
        if (err) {
          console.error('Error writing audit log:', err);
          // Don't throw - audit logging failures shouldn't break the application
        }
      }
    );
  }

  /**
   * Sanitize details to remove any potential PHI
   * Only log generic information, not actual PHI
   */
  static sanitizeDetails(details) {
    if (typeof details === 'string') {
      // Remove email addresses, names, and other identifiers
      return details
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME_REDACTED]')
        .substring(0, 500); // Limit length
    }
    return JSON.stringify(details).substring(0, 500);
  }

  /**
   * Middleware to automatically log requests
   */
  static middleware() {
    return (req, res, next) => {
      const originalSend = res.send;
      const startTime = Date.now();

      // Capture response
      res.send = function(data) {
        const duration = Date.now() - startTime;
        const userId = req.user?.userId || null;
        const userType = req.user?.userType || 'anonymous';

        // Determine action based on method and route
        let action = req.method;
        if (req.route) {
          if (req.route.path.includes('login')) action = 'LOGIN';
          else if (req.route.path.includes('signup')) action = 'SIGNUP';
          else if (req.route.path.includes('availability')) action = 'ACCESS_AVAILABILITY';
          else if (req.route.path.includes('practitioner')) action = 'ACCESS_PRACTITIONER_DATA';
        }

        // Determine status
        const status = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE';

        // Log the event
        AuditLogger.log({
          userId,
          userType,
          action,
          resource: req.path,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent') || 'Unknown',
          status,
          details: `Response code: ${res.statusCode}, Duration: ${duration}ms`
        });

        originalSend.call(this, data);
      };

      next();
    };
  }
}

module.exports = AuditLogger;

