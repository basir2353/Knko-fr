const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../database.sqlite');

let db;

const getDatabase = () => {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        // Enable foreign key constraints
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('Error enabling foreign keys:', err.message);
          }
        });
      }
    });
  }
  return db;
};

const initDatabase = () => {
  const database = getDatabase();
  
  database.serialize(() => {
    // Create users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        userType TEXT NOT NULL CHECK(userType IN ('patient', 'admin', 'practitioner')),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created or already exists');
      }
    });

    // Create practitioner availability table
    database.run(`
      CREATE TABLE IF NOT EXISTS practitioner_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        practitionerId INTEGER NOT NULL,
        dayOfWeek TEXT NOT NULL CHECK(dayOfWeek IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (practitionerId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(practitionerId, dayOfWeek)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating practitioner_availability table:', err.message);
      } else {
        console.log('Practitioner availability table created or already exists');
      }
    });

    // Create audit logs table for HIPAA compliance
    database.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        userType TEXT,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'FAILURE')),
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) {
        console.error('Error creating audit_logs table:', err.message);
      } else {
        console.log('Audit logs table created or already exists');
      }
    });

    // Create index on audit logs for better query performance
    database.run(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_userId ON audit_logs(userId)
    `, (err) => {
      if (err) {
        console.error('Error creating audit_logs index:', err.message);
      }
    });

    database.run(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)
    `, (err) => {
      if (err) {
        console.error('Error creating audit_logs timestamp index:', err.message);
      }
    });

    // Create active_sessions table to track practitioner login status
    database.run(`
      CREATE TABLE IF NOT EXISTS active_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        lastActivity DATETIME DEFAULT CURRENT_TIMESTAMP,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating active_sessions table:', err.message);
      } else {
        console.log('Active sessions table created or already exists');
      }
    });

    // Create index on active_sessions for better query performance
    database.run(`
      CREATE INDEX IF NOT EXISTS idx_active_sessions_userId ON active_sessions(userId)
    `, (err) => {
      if (err) {
        console.error('Error creating active_sessions index:', err.message);
      }
    });

    database.run(`
      CREATE INDEX IF NOT EXISTS idx_active_sessions_lastActivity ON active_sessions(lastActivity)
    `, (err) => {
      if (err) {
        console.error('Error creating active_sessions lastActivity index:', err.message);
      }
    });
  });
};

const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase
};

