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
