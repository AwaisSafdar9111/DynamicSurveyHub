const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { eq } = require('drizzle-orm');

// Database connection from environment variable
const connectionString = process.env.DATABASE_URL;

// Create a connection pool
const pool = new Pool({ connectionString });

// Schema definition
const users = {
  id: { name: 'id' },
  username: { name: 'username' },
  email: { name: 'email' },
  password: { name: 'password' },
  firstName: { name: 'first_name' },
  lastName: { name: 'last_name' },
  role: { name: 'role' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const forms = {
  id: { name: 'id' },
  title: { name: 'title' },
  description: { name: 'description' },
  userId: { name: 'user_id' },
  version: { name: 'version' },
  isPublished: { name: 'is_published' },
  publishedAt: { name: 'published_at' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const sections = {
  id: { name: 'id' },
  formId: { name: 'form_id' },
  title: { name: 'title' },
  description: { name: 'description' },
  order: { name: 'order' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const controls = {
  id: { name: 'id' },
  sectionId: { name: 'section_id' },
  type: { name: 'type' },
  label: { name: 'label' },
  required: { name: 'required' },
  order: { name: 'order' },
  properties: { name: 'properties' },
  validations: { name: 'validations' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const submissions = {
  id: { name: 'id' },
  formId: { name: 'form_id' },
  userId: { name: 'user_id' },
  submittedBy: { name: 'submitted_by' },
  submittedAt: { name: 'submitted_at' },
  ipAddress: { name: 'ip_address' },
  data: { name: 'data' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const workflows = {
  id: { name: 'id' },
  formId: { name: 'form_id' },
  name: { name: 'name' },
  description: { name: 'description' },
  active: { name: 'active' },
  config: { name: 'config' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const webhooks = {
  id: { name: 'id' },
  name: { name: 'name' },
  formId: { name: 'form_id' },
  url: { name: 'url' },
  secret: { name: 'secret' },
  events: { name: 'events' },
  active: { name: 'active' },
  createdBy: { name: 'created_by' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

const conditionalLogic = {
  id: { name: 'id' },
  formId: { name: 'form_id' },
  sourceControlId: { name: 'source_control_id' },
  targetControlId: { name: 'target_control_id' },
  condition: { name: 'condition' },
  action: { name: 'action' },
  active: { name: 'active' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

// Build schema object
const schema = {
  users,
  forms,
  sections,
  controls,
  submissions,
  workflows,
  webhooks,
  conditionalLogic
};

// Create Drizzle instance
const db = drizzle(pool, { schema });

// Database Storage implementation
class DatabaseStorage {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from({ users }).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username) {
    const [user] = await db.select().from({ users }).where(eq(users.username, username));
    return user;
  }

  async createUser(user) {
    const [newUser] = await db.insert({ users }).values(user).returning();
    return newUser;
  }
  
  // Form operations
  async getForms(userId) {
    if (userId) {
      return await pool.query('SELECT * FROM forms WHERE user_id = $1', [userId])
        .then(result => result.rows);
    }
    return await pool.query('SELECT * FROM forms')
      .then(result => result.rows);
  }

  async getForm(id) {
    const result = await pool.query('SELECT * FROM forms WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createForm(form) {
    const [newForm] = await db.insert({ forms }).values(form).returning();
    return newForm;
  }

  async updateForm(id, formUpdate) {
    const [updatedForm] = await db
      .update({ forms })
      .set({ ...formUpdate, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return updatedForm;
  }

  async deleteForm(id) {
    const result = await db.delete({ forms }).where(eq(forms.id, id));
    return result !== undefined;
  }
  
  // Section operations
  async getSections(formId) {
    const result = await pool.query('SELECT * FROM sections WHERE form_id = $1 ORDER BY "order"', [formId]);
    return result.rows;
  }

  async getSection(id) {
    const [section] = await db.select().from({ sections }).where(eq(sections.id, id));
    return section;
  }

  async createSection(section) {
    const [newSection] = await db.insert({ sections }).values(section).returning();
    return newSection;
  }

  async updateSection(id, sectionUpdate) {
    const [updatedSection] = await db
      .update({ sections })
      .set({ ...sectionUpdate, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteSection(id) {
    const result = await db.delete({ sections }).where(eq(sections.id, id));
    return result !== undefined;
  }
  
  // Control operations
  async getControls(sectionId) {
    const result = await pool.query('SELECT * FROM controls WHERE section_id = $1 ORDER BY "order"', [sectionId]);
    return result.rows;
  }

  async getControl(id) {
    const [control] = await db.select().from({ controls }).where(eq(controls.id, id));
    return control;
  }

  async createControl(control) {
    const [newControl] = await db.insert({ controls }).values(control).returning();
    return newControl;
  }

  async updateControl(id, controlUpdate) {
    const [updatedControl] = await db
      .update({ controls })
      .set({ ...controlUpdate, updatedAt: new Date() })
      .where(eq(controls.id, id))
      .returning();
    return updatedControl;
  }

  async deleteControl(id) {
    const result = await db.delete({ controls }).where(eq(controls.id, id));
    return result !== undefined;
  }
  
  // Submission operations
  async getSubmissions(formId) {
    return await db.select().from({ submissions }).where(eq(submissions.formId, formId));
  }

  async getSubmission(id) {
    const [submission] = await db.select().from({ submissions }).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(submission) {
    const [newSubmission] = await db.insert({ submissions }).values(submission).returning();
    return newSubmission;
  }
  
  // Workflow operations
  async getWorkflows(formId) {
    return await db.select().from({ workflows }).where(eq(workflows.formId, formId));
  }

  async getWorkflow(id) {
    const [workflow] = await db.select().from({ workflows }).where(eq(workflows.id, id));
    return workflow;
  }

  async createWorkflow(workflow) {
    const [newWorkflow] = await db.insert({ workflows }).values(workflow).returning();
    return newWorkflow;
  }

  async updateWorkflow(id, workflowUpdate) {
    const [updatedWorkflow] = await db
      .update({ workflows })
      .set({ ...workflowUpdate, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return updatedWorkflow;
  }

  async deleteWorkflow(id) {
    const result = await db.delete({ workflows }).where(eq(workflows.id, id));
    return result !== undefined;
  }
  
  // Webhook operations
  async getWebhooks(formId) {
    return await db.select().from({ webhooks }).where(eq(webhooks.formId, formId));
  }

  async getWebhook(id) {
    const [webhook] = await db.select().from({ webhooks }).where(eq(webhooks.id, id));
    return webhook;
  }

  async createWebhook(webhook) {
    const [newWebhook] = await db.insert({ webhooks }).values(webhook).returning();
    return newWebhook;
  }

  async updateWebhook(id, webhookUpdate) {
    const [updatedWebhook] = await db
      .update({ webhooks })
      .set({ ...webhookUpdate, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return updatedWebhook;
  }

  async deleteWebhook(id) {
    const result = await db.delete({ webhooks }).where(eq(webhooks.id, id));
    return result !== undefined;
  }
  
  // Conditional Logic operations
  async getConditionalLogic(formId) {
    return await db.select().from({ conditionalLogic }).where(eq(conditionalLogic.formId, formId));
  }

  async getConditionalLogicForControl(controlId) {
    return await db
      .select()
      .from({ conditionalLogic })
      .where(
        eq(conditionalLogic.sourceControlId, controlId)
      );
  }

  async createConditionalLogic(logic) {
    const [newLogic] = await db.insert({ conditionalLogic }).values(logic).returning();
    return newLogic;
  }

  async updateConditionalLogic(id, logicUpdate) {
    const [updatedLogic] = await db
      .update({ conditionalLogic })
      .set({ ...logicUpdate, updatedAt: new Date() })
      .where(eq(conditionalLogic.id, id))
      .returning();
    return updatedLogic;
  }

  async deleteConditionalLogic(id) {
    const result = await db.delete({ conditionalLogic }).where(eq(conditionalLogic.id, id));
    return result !== undefined;
  }
}

// Create a single instance of the storage
const storage = new DatabaseStorage();

module.exports = { storage };