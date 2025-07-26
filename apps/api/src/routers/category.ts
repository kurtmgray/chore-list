import { router, publicProcedure } from '../trpc';
import { PropertyValidationService } from '../services/PropertyValidationService';
import { workspaceIdSchema, createCategorySchema, choreIdSchema } from '../schemas';
import { z } from 'zod';

export const categoryRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db
        .selectFrom('categories')
        .selectAll()
        .where('workspace_id', '=', ctx.workspaceId)
        .orderBy('name', 'asc')
        .execute();
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const category = await ctx.db
        .selectFrom('categories')
        .selectAll()
        .where('id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .executeTakeFirst();

      if (!category) {
        throw new Error(`Category with id ${input.id} not found`);
      }

      return category;
    }),

  getPropertyDefinitions: publicProcedure
    .query(async ({ ctx }) => {
      // Get all global property definitions for building category schemas
      return await ctx.db
        .selectFrom('property_definitions')
        .selectAll()
        .where('is_global', '=', true)
        .orderBy('label', 'asc')
        .execute();
    }),

  create: publicProcedure
    .input(createCategorySchema)
    .mutation(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      
      // Validate that property schema references valid property definitions
      if (input.property_schema) {
        await propertyValidator.validateCategoryPropertySchema(0, input.property_schema);
      }

      const category = await ctx.db
        .insertInto('categories')
        .values({
          ...input,
          workspace_id: ctx.workspaceId,
          created_by: ctx.userId,
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return category;
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      icon: z.string().max(50).optional(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      property_schema: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      
      // Validate property schema if being updated
      if (input.property_schema) {
        await propertyValidator.validateCategoryPropertySchema(input.id, input.property_schema);
      }

      // Ensure category exists and belongs to workspace
      const existing = await ctx.db
        .selectFrom('categories')
        .select(['id'])
        .where('id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .executeTakeFirst();

      if (!existing) {
        throw new Error(`Category with id ${input.id} not found`);
      }

      // Don't allow editing system categories for now
      const category = await ctx.db
        .selectFrom('categories')
        .select(['is_system'])
        .where('id', '=', input.id)
        .executeTakeFirstOrThrow();

      if (category.is_system) {
        throw new Error('Cannot edit system categories');
      }

      const { id, ...updateData } = input;
      
      await ctx.db
        .updateTable('categories')
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where('id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .execute();

      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Check if category is in use
      const choresUsingCategory = await ctx.db
        .selectFrom('chores')
        .select(['id'])
        .where('category_id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .where('is_active', '=', true)
        .executeTakeFirst();

      if (choresUsingCategory) {
        throw new Error('Cannot delete category that is in use by active chores');
      }

      // Don't allow deleting system categories
      const category = await ctx.db
        .selectFrom('categories')
        .select(['is_system'])
        .where('id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .executeTakeFirst();

      if (!category) {
        throw new Error(`Category with id ${input.id} not found`);
      }

      if (category.is_system) {
        throw new Error('Cannot delete system categories');
      }

      await ctx.db
        .deleteFrom('categories')
        .where('id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .execute();

      return { success: true };
    }),
});