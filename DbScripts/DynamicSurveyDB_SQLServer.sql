-- SQL Server Database Script for Dynamic Survey Application
-- ================================================================
-- This script creates the database schema for Dynamic Survey Application
-- Compatible with SQL Server 2016 and later versions
-- ================================================================

-- Create Database (uncomment if you want to create a new database)
-- CREATE DATABASE DynamicSurvey;
-- GO
-- USE DynamicSurvey;
-- GO

-- Users Table
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Forms Table
CREATE TABLE forms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    created_by INT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, published, archived
    version INT NOT NULL DEFAULT 1,
    is_template BIT NOT NULL DEFAULT 0,
    settings NVARCHAR(MAX), -- JSON object for form settings
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Forms_Users FOREIGN KEY (created_by) REFERENCES users(id)
);
GO

-- Sections Table
CREATE TABLE sections (
    id INT IDENTITY(1,1) PRIMARY KEY,
    form_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    sort_order INT NOT NULL DEFAULT 0,
    is_repeatable BIT NOT NULL DEFAULT 0,
    settings NVARCHAR(MAX), -- JSON object for section settings
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Sections_Forms FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
GO

-- Controls Table
CREATE TABLE controls (
    id INT IDENTITY(1,1) PRIMARY KEY,
    section_id INT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- text, number, select, checkbox, etc.
    label NVARCHAR(255) NOT NULL,
    name NVARCHAR(100) NOT NULL, -- Field name/identifier
    description NVARCHAR(MAX),
    placeholder NVARCHAR(255),
    default_value NVARCHAR(MAX),
    options NVARCHAR(MAX), -- JSON array for select options
    validation NVARCHAR(MAX), -- JSON object for validation rules
    is_required BIT NOT NULL DEFAULT 0,
    is_readonly BIT NOT NULL DEFAULT 0,
    is_hidden BIT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    settings NVARCHAR(MAX), -- JSON object for additional control settings
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Controls_Sections FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);
GO

-- Submissions Table
CREATE TABLE submissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    form_id INT NOT NULL,
    submitted_by INT,
    status NVARCHAR(50) NOT NULL DEFAULT 'submitted', -- draft, submitted, in_progress, etc.
    data NVARCHAR(MAX) NOT NULL, -- JSON object containing all the form data
    submission_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    completed_date DATETIME2,
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(255),
    CONSTRAINT FK_Submissions_Forms FOREIGN KEY (form_id) REFERENCES forms(id),
    CONSTRAINT FK_Submissions_Users FOREIGN KEY (submitted_by) REFERENCES users(id)
);
GO

-- Workflows Table
CREATE TABLE workflows (
    id INT IDENTITY(1,1) PRIMARY KEY,
    form_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive
    trigger_event NVARCHAR(50) NOT NULL, -- on_submission, on_approval, etc.
    actions NVARCHAR(MAX) NOT NULL, -- JSON array of workflow actions
    conditions NVARCHAR(MAX), -- JSON conditions that trigger the workflow
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Workflows_Forms FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
GO

-- Webhooks Table
CREATE TABLE webhooks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    form_id INT NOT NULL,
    name NVARCHAR(100) NOT NULL,
    url NVARCHAR(255) NOT NULL,
    method NVARCHAR(10) NOT NULL DEFAULT 'POST',
    headers NVARCHAR(MAX), -- JSON object for custom headers
    payload_template NVARCHAR(MAX), -- Template for the webhook payload
    events NVARCHAR(MAX) NOT NULL, -- JSON array of events that trigger the webhook
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Webhooks_Forms FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);
GO

-- Conditional Logic Table
CREATE TABLE conditional_logic (
    id INT IDENTITY(1,1) PRIMARY KEY,
    form_id INT NOT NULL,
    control_id INT NOT NULL, -- The control that is affected by the condition
    condition_type NVARCHAR(50) NOT NULL, -- show, hide, require, disable
    condition_json NVARCHAR(MAX) NOT NULL, -- JSON representation of the condition
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ConditionalLogic_Forms FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT FK_ConditionalLogic_Controls FOREIGN KEY (control_id) REFERENCES controls(id) ON DELETE CASCADE
);
GO

-- Create indexes for performance
CREATE INDEX IX_Forms_CreatedBy ON forms(created_by);
CREATE INDEX IX_Sections_FormId ON sections(form_id);
CREATE INDEX IX_Controls_SectionId ON controls(section_id);
CREATE INDEX IX_Submissions_FormId ON submissions(form_id);
CREATE INDEX IX_Submissions_SubmittedBy ON submissions(submitted_by);
CREATE INDEX IX_Workflows_FormId ON workflows(form_id);
CREATE INDEX IX_Webhooks_FormId ON webhooks(form_id);
CREATE INDEX IX_ConditionalLogic_FormId ON conditional_logic(form_id);
CREATE INDEX IX_ConditionalLogic_ControlId ON conditional_logic(control_id);
GO

-- Insert initial admin user (password: Admin123!)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES ('admin', 'admin@example.com', '$2a$12$rZf3ZoNRMhIYCMY7h3Rin.aiPG0pCmHJdptX3XUcX7gKEr1ixUU8C', 'System', 'Administrator', 'admin');
GO

-- Insert sample form
INSERT INTO forms (title, description, created_by, status)
VALUES ('Sample Customer Feedback', 'A sample feedback form to collect customer satisfaction data', 1, 'published');
GO

-- Insert sample sections
INSERT INTO sections (form_id, title, description, sort_order)
VALUES (1, 'Customer Information', 'Basic information about the customer', 0);

INSERT INTO sections (form_id, title, description, sort_order)
VALUES (1, 'Product Feedback', 'Feedback about our products', 1);

INSERT INTO sections (form_id, title, description, sort_order)
VALUES (1, 'Service Feedback', 'Feedback about our services', 2);
GO

-- Insert sample controls
INSERT INTO controls (section_id, type, label, name, placeholder, is_required, sort_order)
VALUES (1, 'text', 'Full Name', 'fullName', 'Enter your full name', 1, 0);

INSERT INTO controls (section_id, type, label, name, placeholder, is_required, sort_order)
VALUES (1, 'email', 'Email Address', 'email', 'Enter your email address', 1, 1);

INSERT INTO controls (section_id, type, label, name, description, is_required, sort_order, options)
VALUES (2, 'select', 'Product', 'product', 'Select the product you want to provide feedback for', 1, 0, 
'[{"value":"product1","label":"Product One"},{"value":"product2","label":"Product Two"},{"value":"product3","label":"Product Three"}]');

INSERT INTO controls (section_id, type, label, name, is_required, sort_order)
VALUES (2, 'rating', 'Product Satisfaction', 'productSatisfaction', 1, 1);

INSERT INTO controls (section_id, type, label, name, is_required, sort_order)
VALUES (3, 'rating', 'Service Satisfaction', 'serviceSatisfaction', 1, 0);

INSERT INTO controls (section_id, type, label, name, placeholder, is_required, sort_order)
VALUES (3, 'textarea', 'Additional Comments', 'comments', 'Please provide any additional feedback', 0, 1);
GO

-- Print completion message
PRINT 'Dynamic Survey Application database schema created successfully.';
GO
