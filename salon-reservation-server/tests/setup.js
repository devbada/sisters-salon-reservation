// Test setup file
require('dotenv').config({ path: '.env.test' });
const db = require('../db/database');

// Global test setup
beforeAll(async () => {
  // Test database setup
  console.log('🧪 Setting up test environment...');
});

beforeEach(async () => {
  // Clean up test data before each test
  try {
    // Clear test data but preserve schema
    const tables = ['reservations', 'customers', 'administrators', 'business_hours', 'holidays', 'special_hours'];
    
    for (const table of tables) {
      try {
        db.exec(`DELETE FROM ${table}`);
      } catch (error) {
        // Table might not exist, ignore
        if (!error.message.includes('no such table')) {
          console.warn(`Warning: Could not clear table ${table}:`, error.message);
        }
      }
    }
    
    // Rate limiting 방지를 위한 짧은 대기
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.warn('Warning during test data cleanup:', error.message);
  }
});

afterAll(async () => {
  // Clean up after all tests
  console.log('🧹 Cleaning up test environment...');
  
  try {
    db.close();
  } catch (error) {
    console.warn('Warning during database cleanup:', error.message);
  }
});

// Global test utilities
global.testUtils = {
  createTestAdmin: async (username = 'testadmin', password = 'TestPass123!') => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare('INSERT INTO administrators (username, password, created_at) VALUES (?, ?, ?)');
    const result = stmt.run(username, hashedPassword, new Date().toISOString());
    
    return {
      id: result.lastInsertRowid,
      username,
      password
    };
  },
  
  createTestCustomer: (customerData = {}) => {
    const defaultCustomer = {
      name: '김테스트',
      phone: '010-1234-5678',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...customerData
    };
    
    const stmt = db.prepare(`
      INSERT INTO customers (name, phone, email, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      defaultCustomer.name,
      defaultCustomer.phone,
      defaultCustomer.email,
      defaultCustomer.created_at,
      defaultCustomer.updated_at
    );
    
    return {
      id: result.lastInsertRowid,
      ...defaultCustomer
    };
  }
};