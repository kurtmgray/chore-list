import { router, publicProcedure } from '../trpc';
import { ChoreService } from '../services/ChoreService';
import { PropertyValidationService } from '../services/PropertyValidationService';
import { createChoreSchema, updateChoreSchema, choreStatusEnum } from '../schemas';
import { z } from 'zod';

export const choreRouter = router({
  getAll: publicProcedure
    .input(z.object({
      assignedTo: z.number().optional(),
      status: choreStatusEnum.optional(),
      categoryId: z.number().optional(),
      limit: z.number().min(1).max(100).default(50).optional(),
      offset: z.number().min(0).default(0).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      return await choreService.getChoresForWorkspace(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      return await choreService.getChoreById(input.id);
    }),

  getDashboard: publicProcedure
    .query(async ({ ctx }) => {
      // Get upcoming, overdue, and recent chores for dashboard
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get overdue chores
      const overdue = await ctx.db
        .selectFrom('chores')
        .leftJoin('categories', 'chores.category_id', 'categories.id')
        .leftJoin('users', 'chores.assigned_to', 'users.id')
        .select([
          'chores.id',
          'chores.title',
          'chores.next_due',
          'chores.status',
          'chores.priority_boost',
          'categories.name as category_name',
          'categories.icon as category_icon',
          'users.first_name',
          'users.avatar',
        ])
        .where('chores.workspace_id', '=', ctx.workspaceId)
        .where('chores.next_due', '<', now)
        .where('chores.status', 'in', ['pending', 'in_progress'])
        .where('chores.is_active', '=', true)
        .orderBy('chores.next_due', 'asc')
        .execute();

      // Get due today/tomorrow
      const upcoming = await ctx.db
        .selectFrom('chores')
        .leftJoin('categories', 'chores.category_id', 'categories.id')
        .leftJoin('users', 'chores.assigned_to', 'users.id')
        .select([
          'chores.id',
          'chores.title',
          'chores.next_due',
          'chores.status',
          'categories.name as category_name',
          'categories.icon as category_icon',
          'users.first_name',
          'users.avatar',
        ])
        .where('chores.workspace_id', '=', ctx.workspaceId)
        .where('chores.next_due', '>=', now)
        .where('chores.next_due', '<=', tomorrow)
        .where('chores.status', 'in', ['pending', 'in_progress'])
        .where('chores.is_active', '=', true)
        .orderBy('chores.next_due', 'asc')
        .limit(10)
        .execute();

      // Get recent completions
      const recentCompletions = await ctx.db
        .selectFrom('completions')
        .innerJoin('chores', 'completions.chore_id', 'chores.id')
        .innerJoin('users', 'completions.completed_by', 'users.id')
        .leftJoin('categories', 'chores.category_id', 'categories.id')
        .select([
          'chores.title',
          'completions.completed_at',
          'users.first_name',
          'users.avatar',
          'categories.name as category_name',
          'categories.icon as category_icon',
        ])
        .where('completions.workspace_id', '=', ctx.workspaceId)
        .orderBy('completions.completed_at', 'desc')
        .limit(5)
        .execute();

      // Get workload balance data - completions by user in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const workloadBalance = await ctx.db
        .selectFrom('users')
        .leftJoin('completions', (join) =>
          join
            .onRef('users.id', '=', 'completions.completed_by')
            .on('completions.workspace_id', '=', ctx.workspaceId)
            .on('completions.completed_at', '>=', thirtyDaysAgo)
        )
        .leftJoin('workspace_members', (join) =>
          join
            .onRef('users.id', '=', 'workspace_members.user_id')
            .on('workspace_members.workspace_id', '=', ctx.workspaceId)
        )
        .select([
          'users.id',
          'users.first_name',
          'users.avatar',
          ctx.db.fn.count('completions.id').as('completion_count'),
        ])
        .where('workspace_members.workspace_id', '=', ctx.workspaceId)
        .groupBy(['users.id', 'users.first_name', 'users.avatar'])
        .execute();

      return {
        overdue,
        upcoming,
        recentCompletions,
        workloadBalance,
      };
    }),

  create: publicProcedure
    .input(createChoreSchema)
    .mutation(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      return await choreService.createChore(input, ctx.userId);
    }),

  update: publicProcedure
    .input(updateChoreSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      
      // Validate properties if being updated
      if (updateData.category_id && updateData.properties) {
        const propertyValidator = new PropertyValidationService(ctx.db);
        await propertyValidator.validateChoreProperties(updateData.properties, updateData.category_id);
        await propertyValidator.validatePropertyValues(updateData.properties, updateData.category_id);
      }

      // Recalculate next_due if frequency changed
      let nextDue = undefined;
      if (updateData.frequency_type_id) {
        const propertyValidator = new PropertyValidationService(ctx.db);
        const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
        
        // Get current chore to access private method (this is a bit hacky, we might want to expose this)
        const currentChore = await choreService.getChoreById(id);
        
        // For now, just set next_due to current time + interval
        nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + 1); // Default to tomorrow
      }

      await ctx.db
        .updateTable('chores')
        .set({
          ...updateData,
          ...(nextDue && { next_due: nextDue }),
          updated_at: new Date(),
        })
        .where('id', '=', id)
        .where('workspace_id', '=', ctx.workspaceId)
        .execute();

      return { success: true };
    }),

  complete: publicProcedure
    .input(z.object({
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      await choreService.completeChore(input.id, ctx.userId, input.notes);
      
      return { success: true };
    }),

  reassign: publicProcedure
    .input(z.object({
      id: z.number(),
      toUserId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      // Get current assignment
      const chore = await choreService.getChoreById(input.id);
      const fromUserId = chore.assigned_to;
      
      if (!fromUserId) {
        throw new Error('Cannot reassign unassigned chore');
      }
      
      if (fromUserId === input.toUserId) {
        throw new Error('Chore is already assigned to this user');
      }
      
      await choreService.reassignChore(
        input.id, 
        fromUserId, 
        input.toUserId, 
        ctx.userId, 
        input.reason
      );
      
      return { success: true };
    }),

  updateStatus: publicProcedure
    .input(z.object({
      id: z.number(),
      status: choreStatusEnum,
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .updateTable('chores')
        .set({
          status: input.status,
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
      // Soft delete by marking as inactive
      await ctx.db
        .updateTable('chores')
        .set({
          is_active: false,
          updated_at: new Date(),
        })
        .where('id', '=', input.id)
        .where('workspace_id', '=', ctx.workspaceId)
        .execute();

      return { success: true };
    }),

  updatePriorityBoosts: publicProcedure
    .mutation(async ({ ctx }) => {
      const propertyValidator = new PropertyValidationService(ctx.db);
      const choreService = new ChoreService(ctx.db, ctx.workspaceId, propertyValidator);
      
      await choreService.updatePriorityBoosts();
      
      return { success: true };
    }),
});