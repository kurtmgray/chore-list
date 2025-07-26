import { router, publicProcedure } from '../trpc';
import { WorkspaceContextService } from '../services/WorkspaceContextService';
import { workspaceIdSchema, createWorkspaceSchema } from '../schemas';

export const workspaceRouter = router({
  getCurrent: publicProcedure
    .query(async ({ ctx }) => {
      const workspaceService = new WorkspaceContextService(ctx.db);
      return await workspaceService.getWorkspaceSettings(ctx.workspaceId);
    }),

  getMembers: publicProcedure
    .query(async ({ ctx }) => {
      const workspaceService = new WorkspaceContextService(ctx.db);
      return await workspaceService.getWorkspaceMembers(ctx.workspaceId);
    }),

  getUserWorkspaces: publicProcedure
    .query(async ({ ctx }) => {
      const workspaceService = new WorkspaceContextService(ctx.db);
      return await workspaceService.getUserWorkspaces(ctx.userId);
    }),

  updateSettings: publicProcedure
    .input(workspaceIdSchema.extend({
      settings: createWorkspaceSchema.shape.settings,
    }))
    .mutation(async ({ input, ctx }) => {
      const workspaceService = new WorkspaceContextService(ctx.db);
      
      // Ensure user has access to this workspace
      await workspaceService.ensureWorkspaceAccess(ctx.userId, input.workspaceId);
      
      await workspaceService.updateWorkspaceSettings(input.workspaceId, input.settings);
      
      return { success: true };
    }),

  // Future: Create new workspace functionality
  create: publicProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ input, ctx }) => {
      // Future: Create workspace and add user as admin
      // For SLC: not needed yet
      throw new Error('Creating new workspaces not implemented in SLC version');
    }),
});