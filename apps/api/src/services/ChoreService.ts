import { Kysely } from 'kysely';
import type { DB } from '../types/database';
import { PropertyValidationService } from './PropertyValidationService';
import type { CreateChore } from '../schemas';

export class ChoreService {
  constructor(
    private db: Kysely<DB>, 
    private workspaceId: number,
    private propertyValidator: PropertyValidationService
  ) {}
  
  async createChore(data: CreateChore, userId: number) {
    // Future: check permissions
    // await this.permissionService.requirePermission(userId, 'create_chore');
    
    // Validate properties against category schema
    if (data.category_id && data.properties) {
      await this.propertyValidator.validateChoreProperties(data.properties, data.category_id);
      await this.propertyValidator.validatePropertyValues(data.properties, data.category_id);
    }
    
    // Always calculate next_due for data integrity
    const nextDue = await this.calculateNextDue(
      data.frequency_type_id, 
      data.suggested_day_of_week
    );
    
    // Ensure we never create chores without next_due
    if (!nextDue) {
      throw new Error('Failed to calculate next_due date for chore');
    }
    
    return await this.db
      .insertInto('chores')
      .values({
        ...data,
        workspace_id: this.workspaceId,
        created_by: userId,
        next_due: nextDue,
        status: 'pending',
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }
  
  async completeChore(choreId: number, userId: number, notes?: string): Promise<void> {
    const chore = await this.getChoreById(choreId);
    
    // Record completion
    await this.db
      .insertInto('completions')
      .values({
        chore_id: choreId,
        completed_by: userId,
        workspace_id: this.workspaceId,
        notes,
        properties_snapshot: chore.properties,
      })
      .execute();
    
    // Calculate next due date
    const nextDue = await this.calculateNextDue(
      chore.frequency_type_id,
      chore.suggested_day_of_week,
      new Date()
    );
    
    // Update chore status and schedule
    await this.db
      .updateTable('chores')
      .set({
        status: 'completed',
        last_completed: new Date(),
        next_due: nextDue,
        priority_boost: 0, // reset priority boost
        updated_at: new Date(),
      })
      .where('id', '=', choreId)
      .execute();
      
    // Create new pending instance for recurring chores
    const frequencyType = await this.db
      .selectFrom('frequency_types')
      .select(['name'])
      .where('id', '=', chore.frequency_type_id)
      .executeTakeFirstOrThrow();
      
    if (frequencyType.name !== 'onetime') {
      await this.db
        .updateTable('chores')
        .set({ status: 'pending' })
        .where('id', '=', choreId)
        .execute();
    }
  }

  async reassignChore(choreId: number, fromUserId: number, toUserId: number, reassignedBy: number, reason?: string): Promise<void> {
    // Record the reassignment
    await this.db
      .insertInto('reassignments')
      .values({
        chore_id: choreId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        reason,
        reassigned_by: reassignedBy,
        workspace_id: this.workspaceId,
      })
      .execute();

    // Update the chore assignment
    await this.db
      .updateTable('chores')
      .set({
        assigned_to: toUserId,
        updated_at: new Date(),
      })
      .where('id', '=', choreId)
      .where('workspace_id', '=', this.workspaceId)
      .execute();
  }

  async getChoreById(choreId: number) {
    const chore = await this.db
      .selectFrom('chores')
      .selectAll()
      .where('id', '=', choreId)
      .where('workspace_id', '=', this.workspaceId)
      .executeTakeFirst();
      
    if (!chore) {
      throw new Error(`Chore with id ${choreId} not found`);
    }
    
    return chore;
  }

  async getChoresForWorkspace(options: {
    assignedTo?: number;
    status?: string;
    categoryId?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = this.db
      .selectFrom('chores')
      .leftJoin('categories', 'chores.category_id', 'categories.id')
      .leftJoin('users', 'chores.assigned_to', 'users.id')
      .leftJoin('frequency_types', 'chores.frequency_type_id', 'frequency_types.id')
      .select([
        'chores.id',
        'chores.title',
        'chores.short_description',
        'chores.notes',
        'chores.status',
        'chores.next_due',
        'chores.last_completed',
        'chores.priority_boost',
        'chores.properties',
        'chores.suggested_day_of_week',
        'categories.name as category_name',
        'categories.icon as category_icon',
        'categories.color as category_color',
        'users.first_name',
        'users.avatar',
        'frequency_types.name as frequency_name',
        'frequency_types.description as frequency_description',
      ])
      .where('chores.workspace_id', '=', this.workspaceId)
      .where('chores.is_active', '=', true);

    if (options.assignedTo) {
      query = query.where('chores.assigned_to', '=', options.assignedTo);
    }

    if (options.status) {
      query = query.where('chores.status', '=', options.status);
    }

    if (options.categoryId) {
      query = query.where('chores.category_id', '=', options.categoryId);
    }

    query = query.orderBy('chores.next_due', 'asc');

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return await query.execute();
  }
  
  private async calculateNextDue(
    frequencyTypeId: number, 
    suggestedDay?: number | null,
    fromDate = new Date()
  ): Promise<Date> {
    // Get frequency type with scheduling strategy
    const frequencyType = await this.db
      .selectFrom('frequency_types')
      .selectAll()
      .where('id', '=', frequencyTypeId)
      .executeTakeFirstOrThrow();
    
    const nextDue = new Date(fromDate);
    
    switch (frequencyType.scheduling_strategy) {
      case 'fixed_interval':
        if (frequencyType.days_interval) {
          nextDue.setDate(nextDue.getDate() + frequencyType.days_interval);
        }
        break;
        
      case 'calendar_based':
        if (frequencyType.name === 'twice_monthly') {
          const rule = frequencyType.scheduling_rule as any;
          const days = rule.days || [1, 15];
          
          // Find next occurrence of 1st or 15th
          const currentDay = nextDue.getDate();
          const nextTargetDay = days.find((day: number) => day > currentDay) || days[0];
          
          if (nextTargetDay <= currentDay) {
            // Move to next month
            nextDue.setMonth(nextDue.getMonth() + 1);
          }
          nextDue.setDate(nextTargetDay);
        }
        break;
        
      default:
        // Fallback to fixed interval if strategy unknown
        if (frequencyType.days_interval) {
          nextDue.setDate(nextDue.getDate() + frequencyType.days_interval);
        }
    }
    
    // Apply suggested day preference for weekly+ intervals
    if (suggestedDay !== null && frequencyType.days_interval && frequencyType.days_interval >= 7) {
      const currentDay = nextDue.getDay();
      const daysToAdd = (suggestedDay - currentDay + 7) % 7;
      if (daysToAdd > 0) {
        nextDue.setDate(nextDue.getDate() + daysToAdd);
      }
    }
    
    return nextDue;
  }

  async updatePriorityBoosts(): Promise<void> {
    // Boost priority for overdue chores
    const now = new Date();
    
    await this.db
      .updateTable('chores')
      .set({
        priority_boost: 1,
        updated_at: new Date(),
      })
      .where('next_due', '<', now)
      .where('status', 'in', ['pending', 'in_progress'])
      .where('priority_boost', '=', 0)
      .where('workspace_id', '=', this.workspaceId)
      .execute();
  }
}