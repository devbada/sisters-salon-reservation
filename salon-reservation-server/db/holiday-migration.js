const db = require('./database');

// Migrate holidays table for Korean Holiday API integration
function migrateHolidaysTable() {
  try {
    // Check if new columns exist
    const tableInfo = db.prepare("PRAGMA table_info(holidays)").all();
    const existingColumns = tableInfo.map(col => col.name);
    
    // Add new columns if they don't exist
    const newColumns = [
      { name: 'name', type: 'VARCHAR(100)', check: !existingColumns.includes('name') },
      { name: 'type', type: 'VARCHAR(50)', check: !existingColumns.includes('type') },
      { name: 'is_substitute', type: 'BOOLEAN DEFAULT 0', check: !existingColumns.includes('is_substitute') },
      { name: 'is_closed', type: 'BOOLEAN DEFAULT 1', check: !existingColumns.includes('is_closed') },
      { name: 'description', type: 'TEXT', check: !existingColumns.includes('description') },
      { name: 'api_response', type: 'TEXT', check: !existingColumns.includes('api_response') },
      { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP', check: !existingColumns.includes('updated_at') }
    ];
    
    let hasChanges = false;
    
    newColumns.forEach(column => {
      if (column.check) {
        const alterQuery = `ALTER TABLE holidays ADD COLUMN ${column.name} ${column.type}`;
        console.log(`Adding column: ${column.name}`);
        db.exec(alterQuery);
        hasChanges = true;
      }
    });
    
    // Create additional indexes for Korean holidays
    const additionalIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_holidays_name ON holidays(name)',
      'CREATE INDEX IF NOT EXISTS idx_holidays_type ON holidays(type)',
      'CREATE INDEX IF NOT EXISTS idx_holidays_year ON holidays(substr(date, 1, 4))',
      'CREATE INDEX IF NOT EXISTS idx_holidays_is_closed ON holidays(is_closed)'
    ];
    
    additionalIndexes.forEach(index => {
      db.exec(index);
      hasChanges = true;
    });
    
    if (hasChanges) {
      console.log('✅ Holidays table migration completed successfully');
    } else {
      console.log('ℹ️ Holidays table is already up to date');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Holiday table migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateHolidaysTable();
  process.exit(0);
}

module.exports = { migrateHolidaysTable };