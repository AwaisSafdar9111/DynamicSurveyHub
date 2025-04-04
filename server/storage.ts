import { users, forms, sections, controls, submissions, workflows, webhooks, conditionalLogic } from "../shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";
import type { 
  User, InsertUser, 
  Form, InsertForm, 
  Section, InsertSection, 
  Control, InsertControl, 
  Submission, InsertSubmission,
  Workflow, InsertWorkflow,
  Webhook, InsertWebhook,
  ConditionalLogic, InsertConditionalLogic
} from "../shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Form operations
  getForms(userId?: number): Promise<Form[]>;
  getForm(id: number): Promise<Form | undefined>;
  createForm(form: InsertForm): Promise<Form>;
  updateForm(id: number, form: Partial<InsertForm>): Promise<Form | undefined>;
  deleteForm(id: number): Promise<boolean>;
  
  // Section operations
  getSections(formId: number): Promise<Section[]>;
  getSection(id: number): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSection(id: number, section: Partial<InsertSection>): Promise<Section | undefined>;
  deleteSection(id: number): Promise<boolean>;
  
  // Control operations
  getControls(sectionId: number): Promise<Control[]>;
  getControl(id: number): Promise<Control | undefined>;
  createControl(control: InsertControl): Promise<Control>;
  updateControl(id: number, control: Partial<InsertControl>): Promise<Control | undefined>;
  deleteControl(id: number): Promise<boolean>;
  
  // Submission operations
  getSubmissions(formId: number): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Workflow operations
  getWorkflows(formId: number): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Webhook operations
  getWebhooks(formId: number): Promise<Webhook[]>;
  getWebhook(id: number): Promise<Webhook | undefined>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, webhook: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  
  // Conditional Logic operations
  getConditionalLogic(formId: number): Promise<ConditionalLogic[]>;
  getConditionalLogicForControl(controlId: number): Promise<ConditionalLogic[]>;
  createConditionalLogic(logic: InsertConditionalLogic): Promise<ConditionalLogic>;
  updateConditionalLogic(id: number, logic: Partial<InsertConditionalLogic>): Promise<ConditionalLogic | undefined>;
  deleteConditionalLogic(id: number): Promise<boolean>;
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Form operations
  async getForms(userId?: number): Promise<Form[]> {
    if (userId) {
      return await db.select().from(forms).where(eq(forms.userId, userId));
    }
    return await db.select().from(forms);
  }

  async getForm(id: number): Promise<Form | undefined> {
    const [form] = await db.select().from(forms).where(eq(forms.id, id));
    return form;
  }

  async createForm(form: InsertForm): Promise<Form> {
    const [newForm] = await db.insert(forms).values(form).returning();
    return newForm;
  }

  async updateForm(id: number, formUpdate: Partial<InsertForm>): Promise<Form | undefined> {
    const [updatedForm] = await db
      .update(forms)
      .set({ ...formUpdate, updatedAt: new Date() })
      .where(eq(forms.id, id))
      .returning();
    return updatedForm;
  }

  async deleteForm(id: number): Promise<boolean> {
    const result = await db.delete(forms).where(eq(forms.id, id));
    return result !== undefined;
  }
  
  // Section operations
  async getSections(formId: number): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.formId, formId));
  }

  async getSection(id: number): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.id, id));
    return section;
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [newSection] = await db.insert(sections).values(section).returning();
    return newSection;
  }

  async updateSection(id: number, sectionUpdate: Partial<InsertSection>): Promise<Section | undefined> {
    const [updatedSection] = await db
      .update(sections)
      .set({ ...sectionUpdate, updatedAt: new Date() })
      .where(eq(sections.id, id))
      .returning();
    return updatedSection;
  }

  async deleteSection(id: number): Promise<boolean> {
    const result = await db.delete(sections).where(eq(sections.id, id));
    return result !== undefined;
  }
  
  // Control operations
  async getControls(sectionId: number): Promise<Control[]> {
    return await db.select().from(controls).where(eq(controls.sectionId, sectionId));
  }

  async getControl(id: number): Promise<Control | undefined> {
    const [control] = await db.select().from(controls).where(eq(controls.id, id));
    return control;
  }

  async createControl(control: InsertControl): Promise<Control> {
    const [newControl] = await db.insert(controls).values(control).returning();
    return newControl;
  }

  async updateControl(id: number, controlUpdate: Partial<InsertControl>): Promise<Control | undefined> {
    const [updatedControl] = await db
      .update(controls)
      .set({ ...controlUpdate, updatedAt: new Date() })
      .where(eq(controls.id, id))
      .returning();
    return updatedControl;
  }

  async deleteControl(id: number): Promise<boolean> {
    const result = await db.delete(controls).where(eq(controls.id, id));
    return result !== undefined;
  }
  
  // Submission operations
  async getSubmissions(formId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.formId, formId));
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [newSubmission] = await db.insert(submissions).values(submission).returning();
    return newSubmission;
  }
  
  // Workflow operations
  async getWorkflows(formId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.formId, formId));
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db.insert(workflows).values(workflow).returning();
    return newWorkflow;
  }

  async updateWorkflow(id: number, workflowUpdate: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set({ ...workflowUpdate, updatedAt: new Date() })
      .where(eq(workflows.id, id))
      .returning();
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return result !== undefined;
  }
  
  // Webhook operations
  async getWebhooks(formId: number): Promise<Webhook[]> {
    return await db.select().from(webhooks).where(eq(webhooks.formId, formId));
  }

  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db.insert(webhooks).values(webhook).returning();
    return newWebhook;
  }

  async updateWebhook(id: number, webhookUpdate: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set({ ...webhookUpdate, updatedAt: new Date() })
      .where(eq(webhooks.id, id))
      .returning();
    return updatedWebhook;
  }

  async deleteWebhook(id: number): Promise<boolean> {
    const result = await db.delete(webhooks).where(eq(webhooks.id, id));
    return result !== undefined;
  }
  
  // Conditional Logic operations
  async getConditionalLogic(formId: number): Promise<ConditionalLogic[]> {
    return await db.select().from(conditionalLogic).where(eq(conditionalLogic.formId, formId));
  }

  async getConditionalLogicForControl(controlId: number): Promise<ConditionalLogic[]> {
    return await db
      .select()
      .from(conditionalLogic)
      .where(
        eq(conditionalLogic.sourceControlId, controlId)
      );
  }

  async createConditionalLogic(logic: InsertConditionalLogic): Promise<ConditionalLogic> {
    const [newLogic] = await db.insert(conditionalLogic).values(logic).returning();
    return newLogic;
  }

  async updateConditionalLogic(id: number, logicUpdate: Partial<InsertConditionalLogic>): Promise<ConditionalLogic | undefined> {
    const [updatedLogic] = await db
      .update(conditionalLogic)
      .set({ ...logicUpdate, updatedAt: new Date() })
      .where(eq(conditionalLogic.id, id))
      .returning();
    return updatedLogic;
  }

  async deleteConditionalLogic(id: number): Promise<boolean> {
    const result = await db.delete(conditionalLogic).where(eq(conditionalLogic.id, id));
    return result !== undefined;
  }
}

// Create a single instance of the storage
export const storage = new DatabaseStorage();