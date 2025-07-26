import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Workspaces/Households - top-level tenant isolation
  await db.schema
    .createTable('workspaces')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('type', 'varchar(50)', (col) => col.notNull().defaultTo('household'))
    .addColumn('settings', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Users - real entities, not just emoji strings
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('first_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('last_name', 'varchar(255)', (col) => col.defaultTo(''))
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('avatar', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Roles system (future-ready, nullable for SLC)
  await db.schema
    .createTable('roles')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('workspace_id', 'integer', (col) => 
      col.references('workspaces.id').onDelete('cascade'))
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('permissions', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('is_default', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Workspace membership with future role flexibility
  await db.schema
    .createTable('workspace_members')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('workspace_id', 'integer', (col) => 
      col.notNull().references('workspaces.id').onDelete('cascade'))
    .addColumn('user_id', 'integer', (col) => 
      col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('role_id', 'integer', (col) => 
      col.references('roles.id'))
    .addColumn('joined_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Add unique constraint for workspace membership
  await db.schema
    .createIndex('workspace_members_unique')
    .on('workspace_members')
    .columns(['workspace_id', 'user_id'])
    .unique()
    .execute();

  // Frequency types - no hardcoding
  await db.schema
    .createTable('frequency_types')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(50)', (col) => col.unique().notNull())
    .addColumn('description', 'text')
    .addColumn('days_interval', 'integer')
    .addColumn('scheduling_strategy', 'varchar(20)', (col) => col.defaultTo('fixed_interval'))
    .addColumn('scheduling_rule', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .execute();

  // Property definitions for reusability across categories
  await db.schema
    .createTable('property_definitions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('type', 'varchar(50)', (col) => col.notNull())
    .addColumn('label', 'varchar(255)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('validation_rules', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('is_global', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Categories with extensible properties
  await db.schema
    .createTable('categories')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('workspace_id', 'integer', (col) => 
      col.notNull().references('workspaces.id').onDelete('cascade'))
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('icon', 'varchar(50)')
    .addColumn('color', 'varchar(7)')
    .addColumn('property_schema', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('is_system', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_by', 'integer', (col) => col.references('users.id'))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Add unique constraint for category names within workspace
  await db.schema
    .createIndex('categories_workspace_name_unique')
    .on('categories')
    .columns(['workspace_id', 'name'])
    .unique()
    .execute();

  // Enhanced chores with full workspace isolation
  await db.schema
    .createTable('chores')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('workspace_id', 'integer', (col) => 
      col.notNull().references('workspaces.id').onDelete('cascade'))
    .addColumn('title', 'varchar(255)', (col) => col.notNull())
    .addColumn('short_description', 'text')
    .addColumn('notes', 'text')
    .addColumn('category_id', 'integer', (col) => col.references('categories.id'))
    .addColumn('frequency_type_id', 'integer', (col) => 
      col.notNull().references('frequency_types.id'))
    .addColumn('suggested_day_of_week', 'integer')
    .addColumn('assigned_to', 'integer', (col) => col.references('users.id'))
    .addColumn('created_by', 'integer', (col) => 
      col.notNull().references('users.id'))
    .addColumn('status', 'varchar(20)', (col) => col.defaultTo('pending'))
    .addColumn('properties', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('last_completed', 'timestamp')
    .addColumn('next_due', 'timestamp')
    .addColumn('priority_boost', 'integer', (col) => col.defaultTo(0))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .execute();

  // Add CHECK constraint for status
  await sql`
    ALTER TABLE chores 
    ADD CONSTRAINT chores_status_check 
    CHECK (status IN ('pending', 'in_progress', 'completed', 'missed', 'skipped'))
  `.execute(db);

  // Add CHECK constraint for suggested_day_of_week
  await sql`
    ALTER TABLE chores 
    ADD CONSTRAINT chores_suggested_day_check 
    CHECK (suggested_day_of_week IS NULL OR (suggested_day_of_week >= 0 AND suggested_day_of_week <= 6))
  `.execute(db);

  // Completion tracking with full audit trail
  await db.schema
    .createTable('completions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('chore_id', 'integer', (col) => 
      col.notNull().references('chores.id').onDelete('cascade'))
    .addColumn('completed_by', 'integer', (col) => 
      col.notNull().references('users.id'))
    .addColumn('completed_at', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addColumn('was_reassigned', 'boolean', (col) => col.defaultTo(false))
    .addColumn('notes', 'text')
    .addColumn('properties_snapshot', 'jsonb', (col) => col.defaultTo('{}'))
    .addColumn('workspace_id', 'integer', (col) => 
      col.notNull().references('workspaces.id'))
    .execute();

  // Reassignment history with full context
  await db.schema
    .createTable('reassignments')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('chore_id', 'integer', (col) => 
      col.notNull().references('chores.id').onDelete('cascade'))
    .addColumn('from_user_id', 'integer', (col) => 
      col.notNull().references('users.id'))
    .addColumn('to_user_id', 'integer', (col) => 
      col.notNull().references('users.id'))
    .addColumn('reason', 'text')
    .addColumn('reassigned_by', 'integer', (col) => 
      col.notNull().references('users.id'))
    .addColumn('timestamp', 'timestamp', (col) => col.defaultTo(sql`NOW()`))
    .addColumn('workspace_id', 'integer', (col) => 
      col.notNull().references('workspaces.id'))
    .execute();

  // Permissions framework (future-ready)
  await db.schema
    .createTable('permissions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.unique().notNull())
    .addColumn('resource_type', 'varchar(100)')
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('role_permissions')
    .addColumn('role_id', 'integer', (col) => 
      col.references('roles.id').onDelete('cascade'))
    .addColumn('permission_id', 'integer', (col) => 
      col.references('permissions.id').onDelete('cascade'))
    .execute();

  // Add primary key for role_permissions
  await db.schema
    .createIndex('role_permissions_pkey')
    .on('role_permissions')
    .columns(['role_id', 'permission_id'])
    .unique()
    .execute();

  // Performance indexes
  await db.schema
    .createIndex('idx_chores_workspace_id')
    .on('chores')
    .column('workspace_id')
    .execute();

  await db.schema
    .createIndex('idx_chores_assigned_to')
    .on('chores')
    .column('assigned_to')
    .execute();

  await db.schema
    .createIndex('idx_chores_next_due')
    .on('chores')
    .column('next_due')
    .execute();

  await db.schema
    .createIndex('idx_completions_workspace_id')
    .on('completions')
    .column('workspace_id')
    .execute();

  await db.schema
    .createIndex('idx_completions_completed_at')
    .on('completions')
    .column('completed_at')
    .execute();

  await db.schema
    .createIndex('idx_workspace_members_workspace_id')
    .on('workspace_members')
    .column('workspace_id')
    .execute();

  await db.schema
    .createIndex('idx_workspace_members_user_id')
    .on('workspace_members')
    .column('user_id')
    .execute();

  // JSONB GIN indexes for property searches (per IMPLEMENTATION_ISSUES.md #3)
  await sql`CREATE INDEX idx_chores_properties ON chores USING GIN (properties)`.execute(db);
  await sql`CREATE INDEX idx_categories_property_schema ON categories USING GIN (property_schema)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order of dependencies
  await db.schema.dropTable('role_permissions').execute();
  await db.schema.dropTable('permissions').execute();
  await db.schema.dropTable('reassignments').execute();
  await db.schema.dropTable('completions').execute();
  await db.schema.dropTable('chores').execute();
  await db.schema.dropTable('categories').execute();
  await db.schema.dropTable('property_definitions').execute();
  await db.schema.dropTable('frequency_types').execute();
  await db.schema.dropTable('workspace_members').execute();
  await db.schema.dropTable('roles').execute();
  await db.schema.dropTable('users').execute();
  await db.schema.dropTable('workspaces').execute();
}