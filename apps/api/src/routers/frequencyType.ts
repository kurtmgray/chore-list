import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const frequencyTypeRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      return await ctx.db
        .selectFrom('frequency_types')
        .selectAll()
        .where('is_active', '=', true)
        .orderBy('name', 'asc')
        .execute();
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const frequencyType = await ctx.db
        .selectFrom('frequency_types')
        .selectAll()
        .where('id', '=', input.id)
        .where('is_active', '=', true)
        .executeTakeFirst();

      if (!frequencyType) {
        throw new Error(`Frequency type with id ${input.id} not found`);
      }

      return frequencyType;
    }),

  // Future: Admin functionality to manage frequency types
  // For SLC: frequency types are system-managed
});