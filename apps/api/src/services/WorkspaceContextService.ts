import { Kysely } from 'kysely';
import type { DB } from '../types/database';

export class WorkspaceContextService {
  constructor(private db: Kysely<DB>) {}

  async validateUserWorkspaceAccess(userId: number, workspaceId: number): Promise<boolean> {
    const membership = await this.db
      .selectFrom('workspace_members')
      .select(['id'])
      .where('user_id', '=', userId)
      .where('workspace_id', '=', workspaceId)
      .executeTakeFirst();

    return !!membership;
  }

  async getWorkspaceSettings(workspaceId: number) {
    const workspace = await this.db
      .selectFrom('workspaces')
      .select(['settings', 'name', 'type'])
      .where('id', '=', workspaceId)
      .executeTakeFirst();

    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    return workspace;
  }

  async getWorkspaceMembers(workspaceId: number) {
    return await this.db
      .selectFrom('workspace_members')
      .innerJoin('users', 'workspace_members.user_id', 'users.id')
      .select([
        'users.id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.avatar',
        'workspace_members.joined_at',
        'workspace_members.role_id',
      ])
      .where('workspace_members.workspace_id', '=', workspaceId)
      .execute();
  }

  async getWorkspaceTimezone(workspaceId: number): Promise<string> {
    const workspace = await this.getWorkspaceSettings(workspaceId);
    const settings = workspace.settings as any || {};
    return settings.timezone || 'America/Los_Angeles'; // Default timezone
  }

  async updateWorkspaceSettings(workspaceId: number, settings: Record<string, any>) {
    await this.db
      .updateTable('workspaces')
      .set({
        settings: JSON.stringify(settings),
        updated_at: new Date(),
      })
      .where('id', '=', workspaceId)
      .execute();
  }

  async getUserWorkspaces(userId: number) {
    return await this.db
      .selectFrom('workspace_members')
      .innerJoin('workspaces', 'workspace_members.workspace_id', 'workspaces.id')
      .select([
        'workspaces.id',
        'workspaces.name',
        'workspaces.type',
        'workspaces.settings',
        'workspace_members.joined_at',
        'workspace_members.role_id',
      ])
      .where('workspace_members.user_id', '=', userId)
      .execute();
  }

  // Future: Role-based permission checking
  async checkWorkspacePermission(
    userId: number, 
    workspaceId: number, 
    permission: string
  ): Promise<boolean> {
    // For SLC: always return true for valid workspace members
    return await this.validateUserWorkspaceAccess(userId, workspaceId);
    
    // Future implementation:
    // 1. Get user's role in workspace
    // 2. Check if role has required permission
    // 3. Return boolean result
  }

  async ensureWorkspaceAccess(userId: number, workspaceId: number): Promise<void> {
    const hasAccess = await this.validateUserWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      throw new Error(`User ${userId} does not have access to workspace ${workspaceId}`);
    }
  }
}