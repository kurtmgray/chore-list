import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const completionRouter = router({
  getAll: publicProcedure
    .input(z.object({
      choreId: z.number().optional(),
      userId: z.number().optional(),
      limit: z.number().min(1).max(100).default(50).optional(),
      offset: z.number().min(0).default(0).optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.db
        .selectFrom('completions')
        .innerJoin('chores', 'completions.chore_id', 'chores.id')
        .innerJoin('users', 'completions.completed_by', 'users.id')
        .leftJoin('categories', 'chores.category_id', 'categories.id')
        .select([
          'completions.id',
          'completions.completed_at',
          'completions.notes',
          'completions.was_reassigned',
          'chores.title',
          'chores.id as chore_id',
          'categories.name as category_name',
          'categories.icon as category_icon',
          'users.first_name',
          'users.avatar',
        ])
        .where('completions.workspace_id', '=', ctx.workspaceId);

      if (input.choreId) {
        query = query.where('completions.chore_id', '=', input.choreId);
      }

      if (input.userId) {
        query = query.where('completions.completed_by', '=', input.userId);
      }

      if (input.dateFrom) {
        query = query.where('completions.completed_at', '>=', input.dateFrom);
      }

      if (input.dateTo) {
        query = query.where('completions.completed_at', '<=', input.dateTo);
      }

      query = query.orderBy('completions.completed_at', 'desc');

      if (input.limit) {
        query = query.limit(input.limit);
      }

      if (input.offset) {
        query = query.offset(input.offset);
      }

      return await query.execute();
    }),

  getStats: publicProcedure
    .input(z.object({
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const dateFrom = input.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const dateTo = input.dateTo || new Date();

      // Get completion counts by user
      const userStats = await ctx.db
        .selectFrom('completions')
        .innerJoin('users', 'completions.completed_by', 'users.id')
        .select([
          'users.id',
          'users.first_name',
          'users.avatar',
          ctx.db.fn.count('completions.id').as('completion_count'),
        ])
        .where('completions.workspace_id', '=', ctx.workspaceId)
        .where('completions.completed_at', '>=', dateFrom)
        .where('completions.completed_at', '<=', dateTo)
        .groupBy(['users.id', 'users.first_name', 'users.avatar'])
        .execute();

      // Get completion counts by category
      const categoryStats = await ctx.db
        .selectFrom('completions')
        .innerJoin('chores', 'completions.chore_id', 'chores.id')
        .leftJoin('categories', 'chores.category_id', 'categories.id')
        .select([
          'categories.id',
          'categories.name',
          'categories.icon',
          'categories.color',
          ctx.db.fn.count('completions.id').as('completion_count'),
        ])
        .where('completions.workspace_id', '=', ctx.workspaceId)
        .where('completions.completed_at', '>=', dateFrom)
        .where('completions.completed_at', '<=', dateTo)
        .groupBy(['categories.id', 'categories.name', 'categories.icon', 'categories.color'])
        .execute();

      // Get total completions
      const totalCompletions = await ctx.db
        .selectFrom('completions')
        .select([
          ctx.db.fn.count('id').as('total_count'),
        ])
        .where('workspace_id', '=', ctx.workspaceId)
        .where('completed_at', '>=', dateFrom)
        .where('completed_at', '<=', dateTo)
        .executeTakeFirst();

      // Get reassignment stats
      const reassignmentCount = await ctx.db
        .selectFrom('completions')
        .select([
          ctx.db.fn.count('id').as('reassigned_count'),
        ])
        .where('workspace_id', '=', ctx.workspaceId)
        .where('was_reassigned', '=', true)
        .where('completed_at', '>=', dateFrom)
        .where('completed_at', '<=', dateTo)
        .executeTakeFirst();

      return {
        dateRange: { from: dateFrom, to: dateTo },
        totalCompletions: Number(totalCompletions?.total_count || 0),
        reassignedCompletions: Number(reassignmentCount?.reassigned_count || 0),
        userStats: userStats.map(stat => ({
          ...stat,
          completion_count: Number(stat.completion_count),
        })),
        categoryStats: categoryStats.map(stat => ({
          ...stat,
          completion_count: Number(stat.completion_count),
        })),
      };
    }),

  getReassignmentHistory: publicProcedure
    .input(z.object({
      choreId: z.number().optional(),
      limit: z.number().min(1).max(100).default(50).optional(),
      offset: z.number().min(0).default(0).optional(),
    }))
    .query(async ({ input, ctx }) => {
      let query = ctx.db
        .selectFrom('reassignments')
        .innerJoin('chores', 'reassignments.chore_id', 'chores.id')
        .innerJoin('users as from_user', 'reassignments.from_user_id', 'from_user.id')
        .innerJoin('users as to_user', 'reassignments.to_user_id', 'to_user.id')
        .innerJoin('users as reassigned_by_user', 'reassignments.reassigned_by', 'reassigned_by_user.id')
        .select([
          'reassignments.id',
          'reassignments.timestamp',
          'reassignments.reason',
          'chores.title',
          'chores.id as chore_id',
          'from_user.first_name as from_user_name',
          'from_user.avatar as from_user_avatar',
          'to_user.first_name as to_user_name',
          'to_user.avatar as to_user_avatar',
          'reassigned_by_user.first_name as reassigned_by_name',
          'reassigned_by_user.avatar as reassigned_by_avatar',
        ])
        .where('reassignments.workspace_id', '=', ctx.workspaceId);

      if (input.choreId) {
        query = query.where('reassignments.chore_id', '=', input.choreId);
      }

      query = query.orderBy('reassignments.timestamp', 'desc');

      if (input.limit) {
        query = query.limit(input.limit);
      }

      if (input.offset) {
        query = query.offset(input.offset);
      }

      return await query.execute();
    }),
});