// A simple test server to verify database connectivity
const express = require('express');

// We can't directly require TypeScript files, so we'll need a workaround 
// to access the database through direct SQL queries
const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

const app = express();
const port = 8000;

app.use(express.json());

// GET all forms
app.get('/api/forms', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM forms');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// GET a specific form with its sections and controls
app.get('/api/forms/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Get form details
    const formResult = await pool.query('SELECT * FROM forms WHERE id = $1', [formId]);
    
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const form = formResult.rows[0];
    
    // Get sections for this form
    const sectionsResult = await pool.query('SELECT * FROM sections WHERE form_id = $1 ORDER BY display_order', [formId]);
    const sections = sectionsResult.rows;
    
    // Get controls for each section and add them to their respective sections
    const sectionsWithControls = await Promise.all(
      sections.map(async (section) => {
        const controlsResult = await pool.query('SELECT * FROM controls WHERE section_id = $1 ORDER BY display_order', [section.id]);
        return {
          ...section,
          controls: controlsResult.rows,
        };
      })
    );
    
    // Get conditional logic for this form
    const conditionalLogicResult = await pool.query('SELECT * FROM conditional_logic WHERE form_id = $1', [formId]);
    
    res.json({
      ...form,
      sections: sectionsWithControls,
      conditionalLogic: conditionalLogicResult.rows,
    });
    
  } catch (error) {
    console.error('Error fetching form details:', error);
    res.status(500).json({ error: 'Failed to fetch form details' });
  }
});

// GET conditional logic for a form
app.get('/api/forms/:id/conditional-logic', async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const formResult = await pool.query('SELECT id FROM forms WHERE id = $1', [formId]);
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Get all conditional logic rules for this form
    const conditionalLogicResult = await pool.query(`
      SELECT cl.*, 
             sc.name as source_control_name, 
             tc.name as target_control_name,
             sc.control_type as source_control_type,
             tc.control_type as target_control_type
      FROM conditional_logic cl
      JOIN controls sc ON cl.source_control_id = sc.id
      JOIN controls tc ON cl.target_control_id = tc.id
      WHERE cl.form_id = $1
    `, [formId]);
    
    res.json(conditionalLogicResult.rows);
    
  } catch (error) {
    console.error('Error fetching conditional logic:', error);
    res.status(500).json({ error: 'Failed to fetch conditional logic' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${port}`);
});