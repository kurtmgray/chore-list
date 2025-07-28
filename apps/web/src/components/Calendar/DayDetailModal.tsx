import { useState, useMemo } from 'react';
import type { CalendarDayData, CalendarChore } from '../../hooks/useCalendarData';
import { ChoreCard } from '../ChoreCard';
import { ChoreDetailModal } from '../ChoreDetailModal';
import { ReassignModal } from '../ReassignModal';
import { useChoreActions } from '../../hooks/useChoreActions';

interface DayDetailModalProps {
  day: CalendarDayData | null;
  onClose: () => void;
}

type SortOption = 'priority' | 'title' | 'assignee' | 'category';
type FilterOption = 'all' | 'assigned_to_me' | 'unassigned' | number; // number for specific assignee

export function DayDetailModal({ day, onClose }: DayDetailModalProps) {
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  const {
    detailChoreId,
    reassignChore,
    handleChoreClick,
    handleReassignClick,
    closeDetailModal,
    closeReassignModal,
  } = useChoreActions();

  // Filter and sort chores - always call useMemo, handle null day inside
  const processedChores = useMemo(() => {
    if (!day) return [];
    
    let filtered = [...day.chores];

    // Apply filters
    if (filterBy === 'assigned_to_me') {
      // TODO: Get current user ID from context
      filtered = filtered.filter(chore => chore.assigned_to === 1); // Hardcoded for now
    } else if (filterBy === 'unassigned') {
      filtered = filtered.filter(chore => !chore.assigned_to);
    } else if (typeof filterBy === 'number') {
      filtered = filtered.filter(chore => chore.assigned_to === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const aPriority = a.priority_boost || 0;
          const bPriority = b.priority_boost || 0;
          return bPriority - aPriority;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'assignee':
          const aAssignee = a.first_name || 'Unassigned';
          const bAssignee = b.first_name || 'Unassigned';
          return aAssignee.localeCompare(bAssignee);
        case 'category':
          const aCategory = a.category_name || 'No Category';
          const bCategory = b.category_name || 'No Category';
          return aCategory.localeCompare(bCategory);
        default:
          return 0;
      }
    });

    return filtered;
  }, [day?.chores, sortBy, filterBy]);

  // Early return after all hooks
  if (!day) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const choreStats = {
    total: day.chores.length,
    completed: day.chores.filter(c => c.status === 'completed').length,
    overdue: day.chores.filter(c => {
      if (!c.next_due) return false;
      const dueDate = new Date(c.next_due);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && c.status !== 'completed';
    }).length,
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div 
            className="relative w-full max-w-lg mx-3 sm:max-w-2xl lg:max-w-4xl transform transition-all max-h-[90vh] overflow-hidden gradient-surface rounded-xl shadow-floating"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div 
            className="sticky top-0 z-10 px-4 sm:px-6 py-3 sm:py-4 border-b"
            style={{ 
              backgroundColor: 'var(--bg-surface)',
              borderBottomColor: 'var(--neutral-200)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  {formatDate(day.date)}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm">
                  <span style={{ color: 'var(--neutral-600)' }}>
                    {choreStats.total} chore{choreStats.total !== 1 ? 's' : ''}
                  </span>
                  {choreStats.completed > 0 && (
                    <span className="text-green-600">
                      {choreStats.completed} completed
                    </span>
                  )}
                  {choreStats.overdue > 0 && (
                    <span className="text-red-600">
                      {choreStats.overdue} overdue
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-3 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ 
                  backgroundColor: 'var(--neutral-100)',
                  color: 'var(--neutral-600)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Filters and Sorting */}
            {day.chores.length > 0 && (
              <div className="flex flex-col gap-3 mt-3 sm:mt-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <label 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: 'var(--neutral-600)' }}
                  >
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 text-sm border rounded-lg min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--neutral-200)',
                      color: 'var(--neutral-900)'
                    }}
                  >
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                    <option value="assignee">Assignee</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: 'var(--neutral-600)' }}
                  >
                    Filter:
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value === 'all' ? 'all' : 
                      e.target.value === 'assigned_to_me' ? 'assigned_to_me' :
                      e.target.value === 'unassigned' ? 'unassigned' :
                      parseInt(e.target.value))}
                    className="px-3 py-2 text-sm border rounded-lg min-h-[44px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--neutral-200)',
                      color: 'var(--neutral-900)'
                    }}
                  >
                    <option value="all">All Chores</option>
                    <option value="assigned_to_me">Assigned to Me</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {processedChores.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div 
                  className="text-4xl mb-3"
                  style={{ color: 'var(--neutral-400)' }}
                >
                  📅
                </div>
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  {day.chores.length === 0 ? 'No chores scheduled' : 'No chores match your filters'}
                </h3>
                <p 
                  className="text-sm text-center max-w-md"
                  style={{ color: 'var(--neutral-500)' }}
                >
                  {day.chores.length === 0 
                    ? 'This day is free of scheduled chores. Enjoy your break!'
                    : 'Try adjusting your filters to see more chores for this day.'
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {processedChores.map((chore) => (
                  <ChoreCard
                    key={`${chore.id}-${chore.next_due}`} // Unique key for projected instances
                    chore={chore}
                    onReassign={() => handleReassignClick(chore)}
                    onClick={() => handleChoreClick(chore)}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Chore Detail Modal */}
      {detailChoreId && !reassignChore && (
        <ChoreDetailModal
          isOpen={true}
          choreId={detailChoreId}
          onClose={closeDetailModal}
        />
      )}

      {/* Reassign Modal */}
      {reassignChore && (
        <ReassignModal
          isOpen={true}
          choreId={reassignChore.id}
          choreTitle={reassignChore.title}
          onClose={closeReassignModal}
        />
      )}
    </>
  );
}