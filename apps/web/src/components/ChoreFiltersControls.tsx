interface User {
  id: number;
  first_name: string;
  avatar: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface ChoreFilter {
  assignedTo?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'missed' | 'skipped';
}

type SortBy = 'due_date' | 'priority' | 'category' | 'title';
type GroupBy = 'none' | 'category' | 'status' | 'assignee' | 'due_date';

interface ChoreFiltersControlsProps {
  choreFilter: ChoreFilter;
  setChoreFilter: (filter: ChoreFilter | ((prev: ChoreFilter) => ChoreFilter)) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
  groupBy: GroupBy;
  setGroupBy: (group: GroupBy) => void;
  users?: User[];
  categories?: Category[];
  totalChores: number;
  filteredChores: number;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ChoreFiltersControls({
  choreFilter,
  setChoreFilter,
  sortBy,
  setSortBy,
  groupBy,
  setGroupBy,
  users,
  categories,
  totalChores,
  filteredChores,
  onClearFilters,
  hasActiveFilters
}: ChoreFiltersControlsProps) {
  return (
    <div className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* User Filter */}
          <select
            value={choreFilter.assignedTo || ''}
            onChange={(e) => setChoreFilter(prev => ({
              ...prev,
              assignedTo: e.target.value ? Number(e.target.value) : undefined
            }))}
            className="px-3 py-2 rounded-lg text-sm border transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            <option value="">All Users</option>
            {users?.map(user => (
              <option key={user.id} value={user.id}>
                {user.avatar} {user.first_name}
              </option>
            ))}
            <option value="unassigned">Unassigned</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={choreFilter.status || ''}
            onChange={(e) => setChoreFilter(prev => ({
              ...prev,
              status: e.target.value as any || undefined
            }))}
            className="px-3 py-2 rounded-lg text-sm border transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            <option value="">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="in_progress">🔄 In Progress</option>
            <option value="completed">✅ Completed</option>
            <option value="missed">❌ Missed</option>
            <option value="skipped">⏭️ Skipped</option>
          </select>
          
        </div>

        {/* Sort and Group Controls */}
        <div className="flex flex-wrap gap-3 lg:ml-auto">
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 rounded-lg text-sm border transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            <option value="due_date">📅 Sort by Due Date</option>
            <option value="priority">⚡ Sort by Priority</option>
            <option value="title">🔤 Sort by Title</option>
            <option value="category">🏷️ Sort by Category</option>
          </select>
          
          {/* Group By */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-2 rounded-lg text-sm border transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            <option value="none">📋 No Grouping</option>
            <option value="category">🏷️ Group by Category</option>
            <option value="status">📊 Group by Status</option>
            <option value="assignee">👤 Group by Assignee</option>
            <option value="due_date">📅 Group by Due Date</option>
          </select>
        </div>
      </div>

      {/* Filter Summary and Clear */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderTopColor: 'var(--neutral-200)' }}>
        <div className="text-sm" style={{ color: 'var(--neutral-600)' }}>
          Showing {filteredChores} of {totalChores} chores
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium" style={{ 
              backgroundColor: 'var(--primary-100)', 
              color: 'var(--primary-700)' 
            }}>
              Filtered
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs px-3 py-1 rounded-md button-hover"
            style={{ 
              backgroundColor: 'var(--gradient-elevated)',
              color: 'var(--neutral-600)'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}