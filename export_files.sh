#!/bin/bash

# Create directories for the export
mkdir -p DynamicSurveyApp/ClientApp
mkdir -p DynamicSurveyApp/Server
mkdir -p DynamicSurveyApp/DbScripts

# Copy Angular frontend files
echo "Copying Angular frontend files..."
cp -r ClientApp/* DynamicSurveyApp/ClientApp/

# Copy Server/API files
echo "Copying Server/API files..."
cp -r server/* DynamicSurveyApp/Server/
cp -r Server/* DynamicSurveyApp/Server/ 2>/dev/null || true
cp -r shared/* DynamicSurveyApp/Server/

# Create database scripts
echo "Creating database scripts..."
cat > DynamicSurveyApp/DbScripts/schema.sql << 'EOL'
-- Database Schema for Dynamic Survey Application

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forms Table
CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id),
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'draft'
);

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Controls Table
CREATE TABLE IF NOT EXISTS controls (
    id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    configuration JSONB,
    validation_rules JSONB,
    help_text TEXT
);

-- Control Options (for dropdown, radio, checkbox)
CREATE TABLE IF NOT EXISTS control_options (
    id SERIAL PRIMARY KEY,
    control_id INTEGER REFERENCES controls(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    text VARCHAR(255) NOT NULL,
    score INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id),
    submitted_by INTEGER REFERENCES users(id),
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'completed'
);

-- Submission Responses Table
CREATE TABLE IF NOT EXISTS submission_responses (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
    control_id INTEGER REFERENCES controls(id),
    value TEXT,
    option_ids INTEGER[],
    file_urls TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    signature_url TEXT
);

-- Workflows Table
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_configuration JSONB,
    actions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    secret_key VARCHAR(255),
    event_types VARCHAR(50)[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_triggered_at TIMESTAMP WITH TIME ZONE
);

-- Conditional Logic Table
CREATE TABLE IF NOT EXISTS conditional_logic (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    control_id INTEGER REFERENCES controls(id) ON DELETE CASCADE,
    source_control_id INTEGER REFERENCES controls(id),
    operator VARCHAR(50) NOT NULL,
    value JSONB,
    action VARCHAR(50) NOT NULL,
    action_target VARCHAR(50) DEFAULT 'visibility'
);

-- Form Assignments
CREATE TABLE IF NOT EXISTS form_assignments (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'assigned',
    assigned_by INTEGER REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_sections_form_id ON sections(form_id);
CREATE INDEX idx_controls_section_id ON controls(section_id);
CREATE INDEX idx_control_options_control_id ON control_options(control_id);
CREATE INDEX idx_submissions_form_id ON submissions(form_id);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by);
CREATE INDEX idx_submission_responses_submission_id ON submission_responses(submission_id);
CREATE INDEX idx_submission_responses_control_id ON submission_responses(control_id);
CREATE INDEX idx_workflows_form_id ON workflows(form_id);
CREATE INDEX idx_webhooks_form_id ON webhooks(form_id);
CREATE INDEX idx_conditional_logic_form_id ON conditional_logic(form_id);
CREATE INDEX idx_conditional_logic_control_id ON conditional_logic(control_id);
CREATE INDEX idx_conditional_logic_source_control_id ON conditional_logic(source_control_id);
CREATE INDEX idx_form_assignments_form_id ON form_assignments(form_id);
CREATE INDEX idx_form_assignments_user_id ON form_assignments(user_id);
EOL

cat > DynamicSurveyApp/DbScripts/seed_data.sql << 'EOL'
-- Seed data for Dynamic Survey Application

-- Insert admin user
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES ('admin', 'admin@example.com', '$2a$12$TmfS7gXK1mD3lZ.pbCUJf.k9PLJVuI6L8MJywj9UWupx1Ux2uLVcG', 'System Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert test users
INSERT INTO users (username, email, password_hash, full_name, role)
VALUES 
('user1', 'user1@example.com', '$2a$12$TmfS7gXK1mD3lZ.pbCUJf.k9PLJVuI6L8MJywj9UWupx1Ux2uLVcG', 'Test User 1', 'user'),
('user2', 'user2@example.com', '$2a$12$TmfS7gXK1mD3lZ.pbCUJf.k9PLJVuI6L8MJywj9UWupx1Ux2uLVcG', 'Test User 2', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert sample form
INSERT INTO forms (title, description, is_published, created_by)
VALUES ('Customer Feedback Form', 'Please provide your feedback about our service', true, 
       (SELECT id FROM users WHERE username = 'admin'))
ON CONFLICT DO NOTHING;

-- Get the form ID for the sample form
DO $$
DECLARE
    v_form_id INTEGER;
    v_section_id INTEGER;
    v_control_id INTEGER;
BEGIN
    SELECT id INTO v_form_id FROM forms WHERE title = 'Customer Feedback Form';
    
    IF v_form_id IS NOT NULL THEN
        -- Insert sections
        INSERT INTO sections (form_id, title, description, display_order)
        VALUES (v_form_id, 'Personal Information', 'Please provide your contact details', 0)
        RETURNING id INTO v_section_id;
        
        -- Insert controls for Personal Information section
        INSERT INTO controls (section_id, label, type, is_required, display_order, help_text)
        VALUES (v_section_id, 'Full Name', 'Text', true, 0, 'Enter your full name');
        
        INSERT INTO controls (section_id, label, type, is_required, display_order, help_text)
        VALUES (v_section_id, 'Email Address', 'Text', true, 1, 'Enter your email address');
        
        INSERT INTO controls (section_id, label, type, is_required, display_order, help_text)
        VALUES (v_section_id, 'Phone Number', 'Text', false, 2, 'Enter your phone number (optional)');
        
        -- Insert another section
        INSERT INTO sections (form_id, title, description, display_order)
        VALUES (v_form_id, 'Feedback', 'Please rate our service', 1)
        RETURNING id INTO v_section_id;
        
        -- Insert controls for Feedback section
        INSERT INTO controls (section_id, label, type, is_required, display_order, help_text)
        VALUES (v_section_id, 'Overall Experience', 'RadioGroup', true, 0, 'How would you rate your overall experience?')
        RETURNING id INTO v_control_id;
        
        -- Insert options for the radio group
        INSERT INTO control_options (control_id, value, text, score, display_order)
        VALUES 
        (v_control_id, 'excellent', 'Excellent', 5, 0),
        (v_control_id, 'good', 'Good', 4, 1),
        (v_control_id, 'average', 'Average', 3, 2),
        (v_control_id, 'poor', 'Poor', 2, 3),
        (v_control_id, 'very_poor', 'Very Poor', 1, 4);
        
        INSERT INTO controls (section_id, label, type, is_required, display_order, help_text)
        VALUES (v_section_id, 'Areas for Improvement', 'CheckboxGroup', false, 1, 'Which areas do you think we could improve?')
        RETURNING id INTO v_control_id;
        
        -- Insert options for the checkbox group
        INSERT INTO control_options (control_id, value, text, display_order)
        VALUES 
        (v_control_id, 'service_speed', 'Service Speed', 0),
        (v_control_id, 'product_quality', 'Product Quality', 1),
        (v_control_id, 'staff_friendliness', 'Staff Friendliness', 2),
        (v_control_id, 'value_for_money', 'Value for Money', 3),
        (v_control_id, 'website_usability', 'Website Usability', 4);
        
        INSERT INTO controls (section_id, label, type, is_required, display_order, help_text)
        VALUES (v_section_id, 'Additional Comments', 'Textarea', false, 2, 'Please provide any additional comments or suggestions');
    END IF;
END
$$;
EOL

cat > DynamicSurveyApp/DbScripts/migrations.js << 'EOL'
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
EOL

cat > DynamicSurveyApp/ReadMe.md << 'EOL'
# Dynamic Survey Application

A comprehensive survey application with drag-and-drop form building, multiple control types, conditional logic, and workflow management.

## Features

- Drag-and-drop form builder
- Multiple control types (text, textarea, radio, checkbox, dropdown, etc.)
- Conditional logic for dynamic form behavior
- Form submission and data collection
- Workflow management
- Responsive design

## Technology Stack

- **Frontend**: Angular with Angular Material
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful API architecture

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Angular CLI

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install backend dependencies
cd DynamicSurveyApp
npm install

# Install frontend dependencies
cd ClientApp
npm install
```

3. Set up the database:

```bash
# Create the database
createdb dynamic_survey_db

# Run the schema script
psql -d dynamic_survey_db -f DbScripts/schema.sql

# Run the seed data script
psql -d dynamic_survey_db -f DbScripts/seed_data.sql
```

4. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/dynamic_survey_db
PORT=8000
```

5. Start the application:

```bash
# Start the backend
npm run server

# Start the frontend
cd ClientApp
npm start
```

## Database Schema

The application uses the following main tables:

- `users` - Stores user information
- `forms` - Stores form metadata
- `sections` - Stores form sections
- `controls` - Stores form controls/fields
- `control_options` - Stores options for dropdown/radio/checkbox controls
- `submissions` - Stores form submissions
- `submission_responses` - Stores individual responses for each submission
- `workflows` - Stores workflow configurations
- `webhooks` - Stores webhook configurations
- `conditional_logic` - Stores conditional logic rules

## Application Structure

- `ClientApp/` - Angular frontend application
- `Server/` - Node.js backend API
- `DbScripts/` - Database scripts for setup and migrations

## License

MIT
EOL

# Create a package.json file
cat > DynamicSurveyApp/package.json << 'EOL'
{
  "name": "dynamic-survey-app",
  "version": "1.0.0",
  "description": "Dynamic Survey Application with form building, conditional logic, and workflow management",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "server": "nodemon server.js",
    "client": "cd ClientApp && npm start",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "db:migrate": "node DbScripts/migrations.js",
    "db:seed": "psql -d ${DATABASE_NAME} -f DbScripts/seed_data.sql"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.28.6",
    "express": "^4.18.2",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "concurrently": "^8.2.1",
    "drizzle-kit": "^0.19.13",
    "nodemon": "^3.0.1"
  }
}
EOL

# Create a zip file
echo "Creating zip file..."
cd DynamicSurveyApp
zip -r ../DynamicSurveyApp.zip ./*
cd ..

echo "Export completed successfully. The files are available in DynamicSurveyApp.zip"