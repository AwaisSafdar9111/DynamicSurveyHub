/**
 * PostgreSQL to SQL Server Migration Utility
 * 
 * This script exports data from a PostgreSQL database to SQL Server format.
 * It generates SQL insert statements that can be executed on a SQL Server database.
 * 
 * Prerequisites:
 * - npm install pg
 * - Properly configured PostgreSQL connection (using DATABASE_URL env variable)
 * 
 * Usage:
 * node PostgresqlToSqlServer.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL connection - using DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Tables to export (in correct order for dependencies)
const tables = [
  'users',
  'forms',
  'sections',
  'controls',
  'submissions',
  'workflows',
  'webhooks',
  'conditional_logic'
];

// SQL file where migration script will be saved
const outputFile = path.join(__dirname, 'migration_script.sql');

async function exportToSqlServer() {
  console.log('Starting PostgreSQL to SQL Server migration...');
  
  // Open file stream for writing
  const fileStream = fs.createWriteStream(outputFile);
  
  // Write file header
  fileStream.write('-- Dynamic Survey Application Migration Script\n');
  fileStream.write('-- Generated on ' + new Date().toISOString() + '\n');
  fileStream.write('-- This script will import data from PostgreSQL to SQL Server\n\n');
  
  // Export data from each table
  for (const table of tables) {
    try {
      console.log(`Processing table: ${table}`);
      fileStream.write(`-- Table: ${table}\n`);
      fileStream.write(`PRINT 'Importing data into ${table} table...'\n`);
      
      // Set identity insert on
      fileStream.write(`SET IDENTITY_INSERT ${table} ON;\n`);
      
      // Get all rows from the table
      const { rows } = await pool.query(`SELECT * FROM ${table}`);
      
      if (rows.length === 0) {
        console.log(`No data found in table: ${table}`);
        fileStream.write(`-- No data to import for ${table}\n\n`);
        fileStream.write(`SET IDENTITY_INSERT ${table} OFF;\n\n`);
        continue;
      }
      
      // Get column names from the first row
      const columns = Object.keys(rows[0]);
      
      // Generate insert statements for each row
      for (const row of rows) {
        const columnsList = columns.join(', ');
        const valuesList = columns.map(col => {
          const value = row[col];
          
          if (value === null) {
            return 'NULL';
          }
          
          if (typeof value === 'string') {
            // Escape single quotes in strings
            return `'${value.replace(/'/g, "''")}'`;
          }
          
          if (typeof value === 'object') {
            if (value instanceof Date) {
              return `'${value.toISOString()}'`;
            }
            // Convert objects to JSON strings
            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
          }
          
          return value;
        }).join(', ');
        
        fileStream.write(`INSERT INTO ${table} (${columnsList}) VALUES (${valuesList});\n`);
      }
      
      // Set identity insert off
      fileStream.write(`SET IDENTITY_INSERT ${table} OFF;\n\n`);
      
      console.log(`Exported ${rows.length} rows from table: ${table}`);
    } catch (err) {
      console.error(`Error exporting table ${table}:`, err);
      fileStream.write(`-- Error exporting table ${table}: ${err.message}\n\n`);
    }
  }
  
  // Write file footer
  fileStream.write('-- Migration complete\n');
  fileStream.write('PRINT \'Migration completed successfully\';\n');
  
  // Close file stream
  fileStream.end();
  
  console.log(`Migration script saved to: ${outputFile}`);
  console.log('Please execute this script on your SQL Server database');
  
  // Close PostgreSQL connection
  await pool.end();
}

// Run the migration function
exportToSqlServer().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});