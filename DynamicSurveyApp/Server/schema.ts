import { pgTable, serial, text, timestamp, json, integer, boolean, primaryKey, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Forms table
export const forms = pgTable('forms', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  version: integer('version').default(1).notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sections table
export const sections = pgTable('sections', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Controls table
export const controls = pgTable('controls', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  required: boolean('required').default(false).notNull(),
  order: integer('order').notNull(),
  properties: json('properties'),
  validations: json('validations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Submissions table
export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id),
  submittedBy: varchar('submitted_by', { length: 255 }),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  data: json('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workflows table
export const workflows = pgTable('workflows', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  active: boolean('active').default(true).notNull(),
  config: json('config').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Webhook configurations
export const webhooks = pgTable('webhooks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  formId: integer('form_id').references(() => forms.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 1024 }).notNull(),
  secret: varchar('secret', { length: 255 }),
  events: json('events').notNull(), // Array of event types
  active: boolean('active').default(true).notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Form conditional logic
export const conditionalLogic = pgTable('conditional_logic', {
  id: serial('id').primaryKey(),
  formId: integer('form_id').notNull().references(() => forms.id, { onDelete: 'cascade' }),
  sourceControlId: integer('source_control_id').notNull().references(() => controls.id, { onDelete: 'cascade' }),
  targetControlId: integer('target_control_id').notNull().references(() => controls.id, { onDelete: 'cascade' }),
  condition: json('condition').notNull(), // JSON containing operators, values, etc.
  action: varchar('action', { length: 50 }).notNull(), // show, hide, require, etc.
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  forms: many(forms),
  submissions: many(submissions),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  sections: many(sections),
  submissions: many(submissions),
  workflows: many(workflows),
  conditionalLogic: many(conditionalLogic),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  form: one(forms, {
    fields: [sections.formId],
    references: [forms.id],
  }),
  controls: many(controls),
}));

export const controlsRelations = relations(controls, ({ one, many }) => ({
  section: one(sections, {
    fields: [controls.sectionId],
    references: [sections.id],
  }),
  sourceConditionalLogic: many(conditionalLogic, { relationName: 'sourceControl' }),
  targetConditionalLogic: many(conditionalLogic, { relationName: 'targetControl' }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  form: one(forms, {
    fields: [submissions.formId],
    references: [forms.id],
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one }) => ({
  form: one(forms, {
    fields: [workflows.formId],
    references: [forms.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  form: one(forms, {
    fields: [webhooks.formId],
    references: [forms.id],
  }),
  createdByUser: one(users, {
    fields: [webhooks.createdBy],
    references: [users.id],
  }),
}));

export const conditionalLogicRelations = relations(conditionalLogic, ({ one }) => ({
  form: one(forms, {
    fields: [conditionalLogic.formId],
    references: [forms.id],
  }),
  sourceControl: one(controls, {
    fields: [conditionalLogic.sourceControlId],
    references: [controls.id],
    relationName: 'sourceControl',
  }),
  targetControl: one(controls, {
    fields: [conditionalLogic.targetControlId],
    references: [controls.id],
    relationName: 'targetControl',
  }),
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Form = typeof forms.$inferSelect;
export type InsertForm = typeof forms.$inferInsert;

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

export type Control = typeof controls.$inferSelect;
export type InsertControl = typeof controls.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

export type ConditionalLogic = typeof conditionalLogic.$inferSelect;
export type InsertConditionalLogic = typeof conditionalLogic.$inferInsert;