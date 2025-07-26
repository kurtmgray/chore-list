import { z } from 'zod';

// Status enum for type safety
export const choreStatusEnum = z.enum(['pending', 'in_progress', 'completed', 'missed', 'skipped']);

// User schemas
export const userSchema = z.object({
  id: z.number(),
  first_name: z.string().min(1).max(255),
  last_name: z.string().max(255).default(''),
  email: z.string().email().nullable(),
  avatar: z.string().max(255),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createUserSchema = userSchema
  .omit({ id: true, created_at: true, updated_at: true });

// Workspace schemas
export const workspaceSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  type: z.string().max(50).default('household'),
  settings: z.record(z.any()).default({}),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createWorkspaceSchema = workspaceSchema
  .omit({ id: true, created_at: true, updated_at: true });

// Frequency type schemas
export const frequencyTypeSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  days_interval: z.number().nullable(),
  scheduling_strategy: z.string().max(20).default('fixed_interval'),
  scheduling_rule: z.record(z.any()).default({}),
  is_active: z.boolean().default(true),
});

// Category schemas
export const categorySchema = z.object({
  id: z.number(),
  workspace_id: z.number(),
  name: z.string().min(1).max(255),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), // hex color
  property_schema: z.record(z.any()).default({}),
  is_system: z.boolean().default(false),
  created_by: z.number().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createCategorySchema = categorySchema
  .omit({ id: true, created_at: true, updated_at: true });

// Property definition schemas
export const propertyDefinitionSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'date', 'currency', 'boolean', 'textarea', 'select']),
  label: z.string().min(1).max(255),
  description: z.string().optional(),
  validation_rules: z.record(z.any()).default({}),
  is_global: z.boolean().default(false),
  created_at: z.date(),
});

export const createPropertyDefinitionSchema = propertyDefinitionSchema
  .omit({ id: true, created_at: true });

// Chore schemas
export const choreSchema = z.object({
  id: z.number(),
  workspace_id: z.number(),
  title: z.string().min(1).max(255),
  short_description: z.string().optional(),
  notes: z.string().optional(),
  category_id: z.number().nullable(),
  frequency_type_id: z.number(),
  suggested_day_of_week: z.number().min(0).max(6).nullable(),
  assigned_to: z.number().nullable(), // nullable for unassigned chores
  created_by: z.number(),
  status: choreStatusEnum.default('pending'),
  properties: z.record(z.any()).default({}),
  last_completed: z.date().nullable(),
  next_due: z.date(), // required - always calculated
  priority_boost: z.number().default(0),
  is_active: z.boolean().default(true),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createChoreSchema = choreSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({
    workspace_id: z.number(), // Will come from context in future
  });

export const updateChoreSchema = createChoreSchema.partial()
  .extend({
    id: z.number(),
  });

// Completion schemas
export const completionSchema = z.object({
  id: z.number(),
  chore_id: z.number(),
  completed_by: z.number(),
  completed_at: z.date().default(() => new Date()),
  was_reassigned: z.boolean().default(false),
  notes: z.string().optional(),
  properties_snapshot: z.record(z.any()).default({}),
  workspace_id: z.number(),
});

export const createCompletionSchema = completionSchema
  .omit({ id: true });

// Reassignment schemas
export const reassignmentSchema = z.object({
  id: z.number(),
  chore_id: z.number(),
  from_user_id: z.number(),
  to_user_id: z.number(),
  reason: z.string().optional(),
  reassigned_by: z.number(),
  timestamp: z.date().default(() => new Date()),
  workspace_id: z.number(),
});

export const createReassignmentSchema = reassignmentSchema
  .omit({ id: true });

// Input validation schemas for common operations
export const workspaceIdSchema = z.object({
  workspaceId: z.number(),
});

export const choreIdSchema = z.object({
  id: z.number(),
});

export const userIdSchema = z.object({
  userId: z.number(),
});

// Export all types
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type CreateWorkspace = z.infer<typeof createWorkspaceSchema>;
export type FrequencyType = z.infer<typeof frequencyTypeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type PropertyDefinition = z.infer<typeof propertyDefinitionSchema>;
export type CreatePropertyDefinition = z.infer<typeof createPropertyDefinitionSchema>;
export type Chore = z.infer<typeof choreSchema>;
export type CreateChore = z.infer<typeof createChoreSchema>;
export type UpdateChore = z.infer<typeof updateChoreSchema>;
export type Completion = z.infer<typeof completionSchema>;
export type CreateCompletion = z.infer<typeof createCompletionSchema>;
export type Reassignment = z.infer<typeof reassignmentSchema>;
export type CreateReassignment = z.infer<typeof createReassignmentSchema>;
export type ChoreStatus = z.infer<typeof choreStatusEnum>;