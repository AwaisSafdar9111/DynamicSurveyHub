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
