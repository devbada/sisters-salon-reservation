const Database = require('better-sqlite3');
const path = require('path');

// Database path configuration
const dbPath = process.env.DATABASE_PATH || './db/database.db';
const fullPath = path.resolve(__dirname, '..', dbPath);

// Initialize database connection
const db = new Database(fullPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000');

// Create reservations table
const createReservationsTable = `
  CREATE TABLE IF NOT EXISTS reservations (
    _id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    stylist TEXT NOT NULL,
    serviceType TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create administrators table
const createAdministratorsTable = `
  CREATE TABLE IF NOT EXISTS administrators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create hair designers table
const createDesignersTable = `
  CREATE TABLE IF NOT EXISTS hair_designers (
    _id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT,
    phone TEXT,
    email TEXT,
    experience_years INTEGER DEFAULT 0,
    profile_image TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT 1,
    deleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create indexes for performance
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date)',
  'CREATE INDEX IF NOT EXISTS idx_reservations_stylist ON reservations(stylist)',
  'CREATE INDEX IF NOT EXISTS idx_reservations_stylist_date_time ON reservations(stylist, date, time)',
  'CREATE INDEX IF NOT EXISTS idx_designers_active ON hair_designers(is_active)',
  'CREATE INDEX IF NOT EXISTS idx_designers_deleted ON hair_designers(deleted)',
  'CREATE INDEX IF NOT EXISTS idx_designers_name ON hair_designers(name)'
];

// Initialize database schema
try {
  db.exec(createReservationsTable);
  db.exec(createAdministratorsTable);
  db.exec(createDesignersTable);
  createIndexes.forEach(index => db.exec(index));
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Database initialization error:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Closing database connection...');
  db.close();
  process.exit(0);
});

module.exports = db;