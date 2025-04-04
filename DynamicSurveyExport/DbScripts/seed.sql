-- Seed data for Dynamic Survey Application

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('admin', 'admin@example.com', '$2a$10$1qAz2wSx3eDc4rFv5tGb5e0RKyJ0wYXQNQB6ZacBukfGAY/faTbue', 'System', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert demo user (password: demo123)
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('demo', 'demo@example.com', '$2a$10$zDmdQG4Mprm6W5H/NnW9p.XAMmJbGCX2KSQvBS/UjDuVxV0V6Zb42', 'Demo', 'User', 'user')
ON CONFLICT (username) DO NOTHING;

-- Insert a sample feedback form
DO $$
DECLARE
    admin_id INTEGER;
    form_id INTEGER;
    personal_section_id INTEGER;
    feedback_section_id INTEGER;
    control_id INTEGER;
BEGIN
    -- Get the admin user id
    SELECT id INTO admin_id FROM users WHERE username = 'admin';
    
    -- Create a sample feedback form
    INSERT INTO forms (title, description, user_id, is_published, version)
    VALUES ('Customer Feedback Form', 'Help us improve our services by providing your feedback', admin_id, true, 1)
    RETURNING id INTO form_id;
    
    -- Create personal information section
    INSERT INTO sections (form_id, title, description, order)
    VALUES (form_id, 'Personal Information', 'Please provide your contact details', 0)
    RETURNING id INTO personal_section_id;
    
    -- Create controls for personal information section
    INSERT INTO controls (section_id, type, label, required, order, properties)
    VALUES 
        (personal_section_id, 'Text', 'Full Name', true, 0, '{"placeholder": "Enter your full name"}'),
        (personal_section_id, 'Text', 'Email Address', true, 1, '{"placeholder": "Enter your email address", "inputType": "email"}'),
        (personal_section_id, 'Text', 'Phone Number', false, 2, '{"placeholder": "Enter your phone number (optional)", "inputType": "tel"}');
    
    -- Create feedback section
    INSERT INTO sections (form_id, title, description, order)
    VALUES (form_id, 'Your Feedback', 'Please share your experience with our services', 1)
    RETURNING id INTO feedback_section_id;
    
    -- Create controls for feedback section
    INSERT INTO controls (section_id, type, label, required, order, properties)
    VALUES 
        (feedback_section_id, 'RadioGroup', 'How would you rate our service?', true, 0, '{"options": [{"value": "excellent", "text": "Excellent"}, {"value": "good", "text": "Good"}, {"value": "average", "text": "Average"}, {"value": "poor", "text": "Poor"}, {"value": "very_poor", "text": "Very Poor"}]}')
    RETURNING id INTO control_id;
    
    -- Add conditional logic
    INSERT INTO controls (section_id, type, label, required, order, properties)
    VALUES 
        (feedback_section_id, 'Textarea', 'What aspects of our service could be improved?', false, 1, '{"placeholder": "Please share your suggestions for improvement", "rows": 4}')
    RETURNING id INTO control_id;
    
    -- Add conditional logic to show textarea when rating is poor or very poor
    INSERT INTO conditional_logic (form_id, source_control_id, target_control_id, condition, action, active)
    VALUES 
        (form_id, 
         (SELECT id FROM controls WHERE section_id = feedback_section_id AND label = 'How would you rate our service?'), 
         control_id, 
         '{"operator": "in", "value": ["poor", "very_poor"]}', 
         'show', 
         true);
    
    -- Add additional controls to feedback section
    INSERT INTO controls (section_id, type, label, required, order, properties)
    VALUES 
        (feedback_section_id, 'CheckboxGroup', 'Which aspects of our service did you appreciate?', false, 2, '{"options": [{"value": "speed", "text": "Speed of Service"}, {"value": "quality", "text": "Quality of Product/Service"}, {"value": "staff", "text": "Staff Friendliness"}, {"value": "price", "text": "Pricing"}, {"value": "support", "text": "Customer Support"}]}'),
        (feedback_section_id, 'Textarea', 'Additional Comments', false, 3, '{"placeholder": "Please share any additional comments or suggestions", "rows": 4}');
END $$;

-- Insert a sample workflow
DO $$
DECLARE
    form_id INTEGER;
BEGIN
    -- Get the form id
    SELECT id INTO form_id FROM forms WHERE title = 'Customer Feedback Form';
    
    -- Create a sample workflow for the feedback form
    INSERT INTO workflows (form_id, name, description, active, config)
    VALUES (
        form_id, 
        'Feedback Notification', 
        'Send notification to manager when a new feedback is submitted', 
        true, 
        '{"trigger": "onSubmission", "actions": [{"type": "email", "to": "manager@example.com", "subject": "New Feedback Submitted", "template": "feedback-notification"}]}'
    );
END $$;

-- Insert a sample webhook
DO $$
DECLARE
    form_id INTEGER;
    admin_id INTEGER;
BEGIN
    -- Get the form id and admin id
    SELECT id INTO form_id FROM forms WHERE title = 'Customer Feedback Form';
    SELECT id INTO admin_id FROM users WHERE username = 'admin';
    
    -- Create a sample webhook for the feedback form
    INSERT INTO webhooks (name, form_id, url, secret, events, active, created_by)
    VALUES (
        'Feedback Integration', 
        form_id, 
        'https://example.com/webhooks/feedback', 
        'webhook_secret_key', 
        '["submission.created"]', 
        true, 
        admin_id
    );
END $$;
