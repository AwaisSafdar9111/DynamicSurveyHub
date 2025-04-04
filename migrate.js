const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { resolve } = require('path');

// Database connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function main() {
  console.log('Starting database migration...');
  
  // Set up Postgres connection
  const sql = postgres(connectionString, { max: 1 });
  
  // Create Drizzle instance
  const db = drizzle(sql);
  
  // Run migrations
  try {
    console.log('Running migrations from:', resolve('./drizzle'));
    await migrate(db, { migrationsFolder: resolve('./drizzle') });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  // Close the connection
  await sql.end();
  console.log('Database connection closed');
}

main();