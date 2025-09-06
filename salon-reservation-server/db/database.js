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

// Create business hours table
const createBusinessHoursTable = `
  CREATE TABLE IF NOT EXISTS business_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    open_time TIME,
    close_time TIME,
    is_closed INTEGER DEFAULT 0,
    break_start TIME,
    break_end TIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create holidays table
const createHolidaysTable = `
  CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL UNIQUE,
    reason TEXT,
    is_recurring INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create special hours table
const createSpecialHoursTable = `
  CREATE TABLE IF NOT EXISTS special_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL UNIQUE,
    open_time TIME,
    close_time TIME,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create customers table
const createCustomersTable = `
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    birthdate DATE,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')),
    preferred_stylist TEXT,
    preferred_service TEXT,
    allergies TEXT,
    vip_status BOOLEAN DEFAULT 0,
    vip_level INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    last_visit_date DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create customer notes table
const createCustomerNotesTable = `
  CREATE TABLE IF NOT EXISTS customer_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    is_important BOOLEAN DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )
`;

// Create indexes for performance
const createIndexes = [
  'CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date)',
  'CREATE INDEX IF NOT EXISTS idx_reservations_stylist ON reservations(stylist)',
  'CREATE INDEX IF NOT EXISTS idx_reservations_stylist_date_time ON reservations(stylist, date, time)',
  'CREATE INDEX IF NOT EXISTS idx_designers_active ON hair_designers(is_active)',
  'CREATE INDEX IF NOT EXISTS idx_designers_deleted ON hair_designers(deleted)',
  'CREATE INDEX IF NOT EXISTS idx_designers_name ON hair_designers(name)',
  'CREATE INDEX IF NOT EXISTS idx_business_hours_day ON business_hours(day_of_week)',
  'CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date)',
  'CREATE INDEX IF NOT EXISTS idx_special_hours_date ON special_hours(date)',
  'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
  'CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)',
  'CREATE INDEX IF NOT EXISTS idx_customers_vip ON customers(vip_status)',
  'CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit_date)',
  'CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON customer_notes(customer_id)'
];

// Initialize database schema
try {
  db.exec(createReservationsTable);
  db.exec(createAdministratorsTable);
  db.exec(createDesignersTable);
  db.exec(createBusinessHoursTable);
  db.exec(createHolidaysTable);
  db.exec(createSpecialHoursTable);
  db.exec(createCustomersTable);
  db.exec(createCustomerNotesTable);
  createIndexes.forEach(index => db.exec(index));
  
  // Insert default business hours if table is empty
  const businessHoursCount = db.prepare('SELECT COUNT(*) as count FROM business_hours').get();
  if (businessHoursCount.count === 0) {
    const insertDefaultHours = db.prepare(`
      INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed, break_start, break_end)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    // Default business hours (Monday = closed, Tue-Fri: 10:00-20:00 with lunch break, Weekend: 10:00-18:00)
    const defaultHours = [
      { day: 0, open: '11:00', close: '17:00', closed: 0, breakStart: null, breakEnd: null }, // Sunday
      { day: 1, open: null, close: null, closed: 1, breakStart: null, breakEnd: null },      // Monday (closed)
      { day: 2, open: '10:00', close: '20:00', closed: 0, breakStart: '13:00', breakEnd: '14:00' }, // Tuesday
      { day: 3, open: '10:00', close: '20:00', closed: 0, breakStart: '13:00', breakEnd: '14:00' }, // Wednesday
      { day: 4, open: '10:00', close: '20:00', closed: 0, breakStart: '13:00', breakEnd: '14:00' }, // Thursday
      { day: 5, open: '10:00', close: '20:00', closed: 0, breakStart: '13:00', breakEnd: '14:00' }, // Friday
      { day: 6, open: '10:00', close: '18:00', closed: 0, breakStart: null, breakEnd: null }        // Saturday
    ];
    
    defaultHours.forEach(hours => {
      insertDefaultHours.run(
        hours.day, 
        hours.open, 
        hours.close, 
        hours.closed ? 1 : 0,
        hours.breakStart,
        hours.breakEnd
      );
    });
    
    console.log('Default business hours inserted successfully');
  }
  
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