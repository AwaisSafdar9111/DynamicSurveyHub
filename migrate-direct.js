const { Pool } = require('pg');
const fs = require('fs');

// Check for the DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define the SQL for creating all tables based on our schema
const createTablesSql = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Controls table
CREATE TABLE IF NOT EXISTS controls (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  "order" INTEGER NOT NULL,
  properties JSONB,
  validations JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  submitted_by VARCHAR(255),
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Webhook configurations
CREATE TABLE IF NOT EXISTS webhooks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  url VARCHAR(1024) NOT NULL,
  secret VARCHAR(255),
  events JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Form conditional logic
CREATE TABLE IF NOT EXISTS conditional_logic (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  source_control_id INTEGER NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  target_control_id INTEGER NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  condition JSONB NOT NULL,
  action VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

// Function to execute the SQL
async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting database migration...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute the SQL to create tables
    await client.query(createTablesSql);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Database migration completed successfully');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error during migration:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    // Close the pool
    await pool.end();
  }
}

// Execute the migration
migrate();