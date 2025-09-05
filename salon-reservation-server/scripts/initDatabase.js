#!/usr/bin/env node

/**
 * Database initialization script for Hair Salon Reservation System
 * This script initializes the database with required tables and sample data
 */

const path = require('path');
const fs = require('fs');

// Ensure we can find the database module
const dbPath = path.join(__dirname, '..', 'db', 'database.js');

console.log('🔧 Initializing database...');

try {
  // Check if database.js exists
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Error: database.js not found at', dbPath);
    process.exit(1);
  }

  // Import database module
  const db = require(dbPath);

  console.log('✅ Database connection established');

  // Check if tables exist and have data
  const checkTables = () => {
    try {
      // Check reservations table
      const reservationCount = db.prepare('SELECT COUNT(*) as count FROM reservations').get();
      console.log(`📊 Reservations table: ${reservationCount.count} records found`);

      // Check administrators table
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM administrators').get();
      console.log(`👤 Administrators table: ${adminCount.count} records found`);

      return {
        reservations: reservationCount.count,
        administrators: adminCount.count
      };
    } catch (error) {
      console.error('❌ Error checking tables:', error.message);
      return null;
    }
  };

  // Insert sample data if tables are empty
  const insertSampleData = () => {
    console.log('📝 Inserting sample data...');

    try {
      // Sample reservations data
      const sampleReservations = [
        {
          _id: 'sample-1',
          customerName: '김민준',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          stylist: 'John',
          serviceType: 'Haircut',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'sample-2',
          customerName: '이서연',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          stylist: 'Sarah',
          serviceType: 'Coloring',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'sample-3',
          customerName: '박지훈',
          date: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
          })(),
          time: '11:30',
          stylist: 'Michael',
          serviceType: 'Styling',
          createdAt: new Date().toISOString()
        }
      ];

      // Insert sample reservations
      const insertReservation = db.prepare(`
        INSERT OR REPLACE INTO reservations (_id, customerName, date, time, stylist, serviceType, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const reservation of sampleReservations) {
        insertReservation.run(
          reservation._id,
          reservation.customerName,
          reservation.date,
          reservation.time,
          reservation.stylist,
          reservation.serviceType,
          reservation.createdAt
        );
      }

      console.log(`✅ Inserted ${sampleReservations.length} sample reservations`);

    } catch (error) {
      console.error('❌ Error inserting sample data:', error.message);
      throw error;
    }
  };

  // Check current state
  const tableStatus = checkTables();
  
  if (tableStatus) {
    if (tableStatus.reservations === 0) {
      insertSampleData();
    } else {
      console.log('ℹ️  Database already contains data, skipping sample data insertion');
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📋 Summary:');
    
    const finalStatus = checkTables();
    console.log(`   • Reservations: ${finalStatus.reservations} records`);
    console.log(`   • Administrators: ${finalStatus.administrators} records`);
  }

} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} finally {
  // Close database connection if it exists
  try {
    if (typeof db !== 'undefined' && db.close) {
      db.close();
    }
  } catch (closeError) {
    // Ignore close errors
  }
}

console.log('✨ Database initialization script completed');