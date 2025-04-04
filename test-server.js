const express = require('express');
const { storage } = require('./server/storage');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create Express app
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API endpoints for users
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await storage.createUser(req.body);
    
    // Remove sensitive information
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoints for forms
app.get('/api/forms', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId) : undefined;
    const forms = await storage.getForms(userId);
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    const form = await storage.getForm(parseInt(req.params.id));
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/forms', async (req, res) => {
  try {
    const newForm = await storage.createForm(req.body);
    res.status(201).json(newForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/forms/:id', async (req, res) => {
  try {
    const updatedForm = await storage.updateForm(parseInt(req.params.id), req.body);
    if (!updatedForm) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/forms/:id', async (req, res) => {
  try {
    const success = await storage.deleteForm(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoints for sections
app.get('/api/forms/:formId/sections', async (req, res) => {
  try {
    const sections = await storage.getSections(parseInt(req.params.formId));
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoints for controls
app.get('/api/sections/:sectionId/controls', async (req, res) => {
  try {
    const controls = await storage.getControls(parseInt(req.params.sectionId));
    res.json(controls);
  } catch (error) {
    console.error('Error fetching controls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test API server listening at http://0.0.0.0:${port}`);
});