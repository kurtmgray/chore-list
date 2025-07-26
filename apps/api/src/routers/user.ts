import { router, publicProcedure } from '../trpc';
import { userIdSchema, createUserSchema } from '../schemas';

export const userRouter = router({
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      // Get all users in current workspace
      return await ctx.db
        .selectFrom('workspace_members')
        .innerJoin('users', 'workspace_members.user_id', 'users.id')
        .select([
          'users.id',
          'users.first_name',
          'users.last_name',
          'users.email',
          'users.avatar',
          'users.created_at',
        ])
        .where('workspace_members.workspace_id', '=', ctx.workspaceId)
        .execute();
    }),

  getById: publicProcedure
    .input(userIdSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', input.userId)
        .executeTakeFirst();

      if (!user) {
        throw new Error(`User with id ${input.userId} not found`);
      }

      return user;
    }),

  getCurrent: publicProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db
        .selectFrom('users')
        .selectAll()
        .where('id', '=', ctx.userId)
        .executeTakeFirst();

      if (!user) {
        throw new Error(`Current user not found`);
      }

      return user;
    }),

  // Future: User management operations
  create: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      // Future: Create new user and add to workspace
      // For SLC: not needed yet
      throw new Error('Creating new users not implemented in SLC version');
    }),

  updateAvatar: publicProcedure
    .input(userIdSchema.extend({
      avatar: createUserSchema.shape.avatar,
    }))
    .mutation(async ({ input, ctx }) => {
      // Only allow users to update their own avatar for now
      if (input.userId !== ctx.userId) {
        throw new Error('Can only update your own avatar');
      }

      await ctx.db
        .updateTable('users')
        .set({
          avatar: input.avatar,
          updated_at: new Date(),
        })
        .where('id', '=', input.userId)
        .execute();

      return { success: true };
    }),
});