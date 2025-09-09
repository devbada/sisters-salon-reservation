const Database = require('better-sqlite3');
const path = require('path');

// Database connection
const dbPath = process.env.DATABASE_PATH || './db/database.db';
const fullPath = path.resolve(__dirname, '../..', dbPath);
const db = new Database(fullPath);

/**
 * Migration 002: Add customer_id column to reservations table
 * This migration adds customer_id to properly link reservations with customers
 */
function migrate() {
  console.log('Starting migration 002: Adding customer_id to reservations table');
  
  try {
    // Begin transaction
    db.exec('BEGIN TRANSACTION');
    
    // Step 1: Add customer_id column to reservations table
    console.log('Step 1: Adding customer_id column to reservations table');
    db.exec('ALTER TABLE reservations ADD COLUMN customer_id INTEGER REFERENCES customers(id)');
    
    // Step 2: Create index for better performance
    console.log('Step 2: Creating index on customer_id');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reservations_customer_id ON reservations(customer_id)');
    
    // Step 3: Map existing reservations to customers by name
    console.log('Step 3: Mapping existing reservations to customers by name');
    
    // Get all unique customer names from reservations
    const uniqueCustomerNames = db.prepare(`
      SELECT DISTINCT customerName 
      FROM reservations 
      WHERE customer_id IS NULL
    `).all();
    
    console.log(`Found ${uniqueCustomerNames.length} unique customer names to process`);
    
    // For each customer name, try to find matching customer and update reservations
    const findCustomerByName = db.prepare('SELECT id FROM customers WHERE name = ? LIMIT 1');
    const insertNewCustomer = db.prepare(`
      INSERT INTO customers (name, phone, total_visits, created_at, updated_at)
      VALUES (?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    const updateReservationCustomerId = db.prepare(`
      UPDATE reservations 
      SET customer_id = ? 
      WHERE customerName = ? AND customer_id IS NULL
    `);
    
    let matchedCount = 0;
    let newCustomerCount = 0;
    
    for (const { customerName } of uniqueCustomerNames) {
      // Try to find existing customer
      const existingCustomer = findCustomerByName.get(customerName);
      
      let customerId;
      if (existingCustomer) {
        customerId = existingCustomer.id;
        matchedCount++;
        console.log(`Matched customer: ${customerName} -> ID ${customerId}`);
      } else {
        // Create new customer with placeholder phone number
        const result = insertNewCustomer.run(
          customerName, 
          `phone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Temporary unique phone
        );
        customerId = result.lastInsertRowid;
        newCustomerCount++;
        console.log(`Created new customer: ${customerName} -> ID ${customerId}`);
      }
      
      // Update all reservations for this customer
      const updateResult = updateReservationCustomerId.run(customerId, customerName);
      console.log(`Updated ${updateResult.changes} reservations for customer: ${customerName}`);
    }
    
    console.log(`Migration summary:`);
    console.log(`- Matched existing customers: ${matchedCount}`);
    console.log(`- Created new customers: ${newCustomerCount}`);
    
    // Step 4: Verify migration
    console.log('Step 4: Verifying migration');
    const unmappedReservations = db.prepare(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE customer_id IS NULL
    `).get();
    
    if (unmappedReservations.count > 0) {
      throw new Error(`Migration failed: ${unmappedReservations.count} reservations still have no customer_id`);
    }
    
    console.log('All reservations successfully mapped to customers');
    
    // Commit transaction
    db.exec('COMMIT');
    
    console.log('Migration 002 completed successfully!');
    
  } catch (error) {
    // Rollback on error
    console.error('Migration failed, rolling back:', error);
    db.exec('ROLLBACK');
    throw error;
  }
}

/**
 * Rollback migration 002
 */
function rollback() {
  console.log('Rolling back migration 002');
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    // Drop the index
    db.exec('DROP INDEX IF EXISTS idx_reservations_customer_id');
    
    // Remove the column (SQLite doesn't support DROP COLUMN directly)
    // We need to recreate the table without the customer_id column
    console.log('Recreating reservations table without customer_id column');
    
    // Create backup table
    db.exec(`
      CREATE TABLE reservations_backup AS 
      SELECT _id, customerName, date, time, stylist, serviceType, status, 
             status_updated_at, status_updated_by, notes, createdAt, updatedAt
      FROM reservations
    `);
    
    // Drop original table
    db.exec('DROP TABLE reservations');
    
    // Recreate original table structure
    db.exec(`
      CREATE TABLE reservations (
        _id TEXT PRIMARY KEY,
        customerName TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        stylist TEXT NOT NULL,
        serviceType TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        status_updated_at DATETIME,
        status_updated_by TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Restore data
    db.exec(`
      INSERT INTO reservations 
      SELECT * FROM reservations_backup
    `);
    
    // Drop backup table
    db.exec('DROP TABLE reservations_backup');
    
    // Recreate original indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reservations_stylist ON reservations(stylist)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_reservations_stylist_date_time ON reservations(stylist, date, time)');
    
    db.exec('COMMIT');
    console.log('Migration 002 rollback completed');
    
  } catch (error) {
    console.error('Rollback failed:', error);
    db.exec('ROLLBACK');
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'rollback') {
    rollback();
  } else {
    migrate();
  }
  
  db.close();
}

module.exports = { migrate, rollback };