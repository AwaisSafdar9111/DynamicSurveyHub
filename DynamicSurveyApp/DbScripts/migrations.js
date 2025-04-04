// Example migration script using Drizzle ORM
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// Run migrations
async function runMigrations() {
  console.log('Starting database migration...');
  
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
