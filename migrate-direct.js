const { Pool } = require('pg');

// Database connection from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  console.log('Starting direct schema migration...');
  
  // Set up PostgreSQL connection
  const pool = new Pool({ connectionString });
  
  try {
    console.log('Connected to database successfully');
    
    // Create tables directly using SQL queries
    console.log('Creating database tables...');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created users table');
    
    // Forms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        version INTEGER NOT NULL DEFAULT 1,
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created forms table');
    
    // Sections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created sections table');
    
    // Controls table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS controls (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        label VARCHAR(255) NOT NULL,
        required BOOLEAN NOT NULL DEFAULT FALSE,
        "order" INTEGER NOT NULL,
        properties JSONB,
        validations JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created controls table');
    
    // Submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        submitted_by VARCHAR(255),
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created submissions table');
    
    // Workflows table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created workflows table');
    
    // Webhooks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
        url VARCHAR(1024) NOT NULL,
        secret VARCHAR(255),
        events JSONB NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created webhooks table');
    
    // Conditional Logic table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conditional_logic (
        id SERIAL PRIMARY KEY,
        form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        source_control_id INTEGER NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
        target_control_id INTEGER NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
        condition JSONB NOT NULL,
        action VARCHAR(50) NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log('- Created conditional_logic table');
    
    // Check if admin user exists
    const { rowCount } = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    
    if (rowCount === 0) {
      console.log('Creating admin user...');
      await pool.query(`
        INSERT INTO users (username, email, password, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['admin', 'admin@example.com', '$2a$12$rZf3ZoNRMhIYCMY7h3Rin.aiPG0pCmHJdptX3XUcX7gKEr1ixUU8C', 'System', 'Administrator', 'admin']);
      console.log('- Admin user created successfully');
    } else {
      console.log('- Admin user already exists');
    }
    
    // Check if we have any sample forms
    const { rowCount: formCount } = await pool.query('SELECT id FROM forms LIMIT 1');
    
    if (formCount === 0) {
      console.log('Creating sample form data...');
      
      // Get the admin user ID
      const { rows: [adminUser] } = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
      const adminId = adminUser.id;
      
      // Create a sample form
      const { rows: [form] } = await pool.query(`
        INSERT INTO forms (title, description, user_id, version, is_published)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, ['Customer Feedback Survey', 'A form to collect customer feedback about our products and services', adminId, 1, true]);
      console.log('- Created sample form');
      
      // Create sections
      const { rows: [personalInfoSection] } = await pool.query(`
        INSERT INTO sections (form_id, title, description, "order")
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [form.id, 'Personal Information', 'Please provide your contact details', 1]);
      
      const { rows: [productSection] } = await pool.query(`
        INSERT INTO sections (form_id, title, description, "order")
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [form.id, 'Product Feedback', 'Tell us about your experience with our products', 2]);
      
      const { rows: [serviceSection] } = await pool.query(`
        INSERT INTO sections (form_id, title, description, "order")
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [form.id, 'Service Evaluation', 'Rate our customer service', 3]);
      console.log('- Created form sections');
      
      // Create controls for Personal Information
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [personalInfoSection.id, 'text', 'Full Name', true, 1, JSON.stringify({ placeholder: 'Enter your full name' })]);
      
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties, validations)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [personalInfoSection.id, 'email', 'Email Address', true, 2, 
          JSON.stringify({ placeholder: 'Enter your email address' }),
          JSON.stringify({ pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' })
      ]);
      
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [personalInfoSection.id, 'tel', 'Phone Number', false, 3, JSON.stringify({ placeholder: 'Enter your phone number' })]);
      
      // Create controls for Product Feedback
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [productSection.id, 'select', 'Which product did you purchase?', true, 1, 
          JSON.stringify({ 
            options: [
              { value: 'product1', label: 'Premium Widget' },
              { value: 'product2', label: 'Standard Widget' },
              { value: 'product3', label: 'Budget Widget' }
            ]
          })
      ]);
      
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [productSection.id, 'radio', 'How would you rate the product quality?', true, 2, 
          JSON.stringify({ 
            options: [
              { value: '5', label: 'Excellent' },
              { value: '4', label: 'Good' },
              { value: '3', label: 'Average' },
              { value: '2', label: 'Below Average' },
              { value: '1', label: 'Poor' }
            ]
          })
      ]);
      
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [productSection.id, 'textarea', 'What improvements would you suggest?', false, 3, 
          JSON.stringify({ 
            placeholder: 'Please share your suggestions',
            rows: 4
          })
      ]);
      
      // Create controls for Service Evaluation
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [serviceSection.id, 'checkbox', 'Which services did you use?', true, 1, 
          JSON.stringify({ 
            options: [
              { value: 'support', label: 'Customer Support' },
              { value: 'installation', label: 'Installation Service' },
              { value: 'training', label: 'Product Training' },
              { value: 'maintenance', label: 'Maintenance Service' }
            ]
          })
      ]);
      
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [serviceSection.id, 'range', 'How satisfied were you with our response time?', true, 2, 
          JSON.stringify({ 
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 5
          })
      ]);
      
      await pool.query(`
        INSERT INTO controls (section_id, type, label, required, "order", properties)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [serviceSection.id, 'textarea', 'Additional comments about our service', false, 3, 
          JSON.stringify({ 
            placeholder: 'Please share any additional feedback',
            rows: 4
          })
      ]);
      
      console.log('- Created form controls');
      
      // Add some conditional logic
      const { rows: [productDropdown] } = await pool.query('SELECT id FROM controls WHERE section_id = $1 AND label = $2', 
        [productSection.id, 'Which product did you purchase?']);
      
      const { rows: [improvementTextarea] } = await pool.query('SELECT id FROM controls WHERE section_id = $1 AND label = $2', 
        [productSection.id, 'What improvements would you suggest?']);
      
      await pool.query(`
        INSERT INTO conditional_logic (form_id, source_control_id, target_control_id, condition, action, active)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        form.id, 
        productDropdown.id, 
        improvementTextarea.id, 
        JSON.stringify({ operator: 'equals', value: 'product3' }),
        'show',
        true
      ]);
      
      console.log('- Created conditional logic');
      
      // Create a simple workflow
      await pool.query(`
        INSERT INTO workflows (form_id, name, description, active, config)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        form.id,
        'Email Notification Workflow',
        'Sends email notifications when a form is submitted',
        true,
        JSON.stringify({
          actions: [
            {
              type: 'email',
              to: 'admin@example.com',
              subject: 'New Form Submission',
              body: 'A new form submission has been received.'
            }
          ],
          triggers: [
            {
              type: 'formSubmission'
            }
          ]
        })
      ]);
      
      console.log('- Created sample workflow');
    } else {
      console.log('- Sample form data already exists');
    }
    
    console.log('Schema migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the migration
runMigration();