import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useUser } from '../contexts/UserContext';
import { ChoreCard } from '../components/ChoreCard';
import { ChoreForm } from '../components/ChoreForm';
import { ReassignModal } from '../components/ReassignModal';
import { ChoreDetailModal } from '../components/ChoreDetailModal';
import { PageTransition, StaggeredList, FadeInUp } from '../components/PageTransition';
import { Button } from '../components/ui/Button';

export function AllChores() {
  const { currentUser } = useUser();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailChoreId, setDetailChoreId] = useState<number | null>(null);
  const [reassignChore, setReassignChore] = useState<{
    id: number;
    title: string;
    assignee?: { id: number; first_name: string; avatar: string; } | null;
  } | null>(null);
  
  // Filter, sort, and grouping states
  const [choreFilter, setChoreFilter] = useState<{
    assignedTo?: number;
    status?: 'pending' | 'in_progress' | 'completed' | 'missed' | 'skipped';
  }>({});
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'category' | 'title'>('due_date');
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'status' | 'assignee' | 'due_date'>('category');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  
  // Data queries
  const { data: users, isLoading: usersLoading } = trpc.users.getAll.useQuery();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.getAll.useQuery();
  const { data: allChores, isLoading: allChoresLoading } = trpc.chores.getAll.useQuery(choreFilter);
  
  // Mutations
  const utils = trpc.useUtils();
  const createChoreMutation = trpc.chores.create.useMutation({
    onSuccess: () => {
      utils.chores.getAll.invalidate();
      setIsCreateModalOpen(false);
    },
  });

  if (usersLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleCreateChore = (data: any) => {
    createChoreMutation.mutate(data);
  };

  const handleReassignClick = (chore: any) => {
    setReassignChore({
      id: chore.id,
      title: chore.title,
      assignee: chore.first_name ? {
        id: chore.assigned_to || 0,
        first_name: chore.first_name,
        avatar: chore.avatar || '👤'
      } : null
    });
  };

  const handleChoreClick = (chore: any) => {
    setDetailChoreId(chore.id);
  };

  const handleDetailReassign = () => {
    if (detailChoreId) {
      const chore = allChores?.find(c => c.id === detailChoreId);
      if (chore) {
        handleReassignClick(chore);
        setDetailChoreId(null);
      }
    }
  };

  // Group, filter and sort all chores
  const getGroupedChores = () => {
    if (!allChores) return { ungrouped: [], grouped: {} };
    
    let filtered = [...allChores];
    
    // Apply sorting within groups
    const sortChores = (chores: any[]) => {
      return chores.sort((a, b) => {
        switch (sortBy) {
          case 'due_date':
            if (!a.next_due && !b.next_due) return 0;
            if (!a.next_due) return 1;
            if (!b.next_due) return -1;
            return new Date(a.next_due).getTime() - new Date(b.next_due).getTime();
          case 'priority':
            return (b.priority_boost || 0) - (a.priority_boost || 0);
          case 'category':
            return (a.category_name || '').localeCompare(b.category_name || '');
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    };

    if (groupBy === 'none') {
      return { ungrouped: sortChores(filtered), grouped: {} };
    }

    // Group chores
    const groups: Record<string, any[]> = {};
    
    filtered.forEach(chore => {
      let groupKey = '';
      let groupLabel = '';
      
      switch (groupBy) {
        case 'category':
          groupKey = chore.category_name || 'uncategorized';
          groupLabel = chore.category_name || 'Uncategorized';
          break;
        case 'status':
          groupKey = chore.status || 'pending';
          groupLabel = (chore.status || 'pending').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          break;
        case 'assignee':
          groupKey = chore.first_name || 'unassigned';
          groupLabel = chore.first_name || 'Unassigned';
          break;
        case 'due_date':
          if (!chore.next_due) {
            groupKey = 'no_due_date';
            groupLabel = 'No Due Date';
          } else {
            const dueDate = new Date(chore.next_due);
            const today = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              groupKey = 'overdue';
              groupLabel = 'Overdue';
            } else if (diffDays === 0) {
              groupKey = 'today';
              groupLabel = 'Due Today';
            } else if (diffDays === 1) {
              groupKey = 'tomorrow';
              groupLabel = 'Due Tomorrow';
            } else if (diffDays <= 7) {
              groupKey = 'this_week';
              groupLabel = 'This Week';
            } else {
              groupKey = 'later';
              groupLabel = 'Later';
            }
          }
          break;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({ ...chore, groupLabel });
    });

    // Sort each group and the groups themselves
    const sortedGroups: Record<string, any[]> = {};
    Object.keys(groups)
      .sort((a, b) => {
        // Custom group ordering
        if (groupBy === 'due_date') {
          const order = ['overdue', 'today', 'tomorrow', 'this_week', 'later', 'no_due_date'];
          return order.indexOf(a) - order.indexOf(b);
        }
        return a.localeCompare(b);
      })
      .forEach(key => {
        sortedGroups[key] = sortChores(groups[key]);
      });

    return { ungrouped: [], grouped: sortedGroups };
  };

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  const { ungrouped, grouped } = getGroupedChores();
  const totalChores = ungrouped.length + Object.values(grouped).flat().length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <FadeInUp delay={0}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 
                className="text-2xl lg:text-3xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--neutral-900)' }}
              >
                All Chores
              </h1>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--neutral-600)' }}
              >
                Manage and organize all household tasks
              </p>
            </div>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              className="shadow-floating pulse-glow flex-shrink-0"
            >
              <span className="mr-2">+</span>
              New Chore
            </Button>
          </div>
        </FadeInUp>

        {/* Filter and Sort Controls */}
        <FadeInUp delay={100}>
          <div 
            className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-wrap gap-3">
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
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                  <option value="skipped">Skipped</option>
                </select>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:ml-auto">
                <div className="flex items-center gap-3">
                  <span 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: 'var(--neutral-600)' }}
                  >
                    Group by:
                  </span>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="px-3 py-2 rounded-lg text-sm border transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--neutral-200)',
                      color: 'var(--neutral-900)'
                    }}
                  >
                    <option value="category">Category</option>
                    <option value="status">Status</option>
                    <option value="assignee">Assignee</option>
                    <option value="due_date">Due Date</option>
                    <option value="none">None</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <span 
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: 'var(--neutral-600)' }}
                  >
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-lg text-sm border transition-all duration-200"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--neutral-200)',
                      color: 'var(--neutral-900)'
                    }}
                  >
                    <option value="due_date">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="category">Category</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t" style={{ borderTopColor: 'var(--neutral-200)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p 
                  className="text-sm"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  Showing {totalChores} chore{totalChores !== 1 ? 's' : ''}
                  {choreFilter.assignedTo && ` assigned to ${users?.find(u => u.id === choreFilter.assignedTo)?.first_name}`}
                  {choreFilter.status && ` with status "${choreFilter.status}"`}
                  {groupBy !== 'none' && ` grouped by ${groupBy.replace('_', ' ')}`}
                </p>
                
                {Object.keys(grouped).length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCollapsedGroups(new Set())}
                      className="text-xs px-2 py-1 rounded-md button-hover"
                      style={{ 
                        backgroundColor: 'var(--gradient-elevated)',
                        color: 'var(--neutral-600)'
                      }}
                    >
                      Expand All
                    </button>
                    <button
                      onClick={() => setCollapsedGroups(new Set(Object.keys(grouped)))}
                      className="text-xs px-2 py-1 rounded-md button-hover"
                      style={{ 
                        backgroundColor: 'var(--gradient-elevated)',
                        color: 'var(--neutral-600)'
                      }}
                    >
                      Collapse All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Chore List */}
        <FadeInUp delay={200}>
          <div 
            className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated"
          >
            {allChoresLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2" style={{ color: 'var(--neutral-600)' }}>Loading chores...</p>
                </div>
              </div>
            ) : totalChores === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  No chores found
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  {Object.keys(choreFilter).length > 0 || allChores?.length === 0
                    ? "Try adjusting your filters or create a new chore to get started."
                    : "Create your first chore to get started!"}
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="primary"
                >
                  Create New Chore
                </Button>
              </div>
            ) : groupBy === 'none' ? (
              <StaggeredList staggerDelay={50}>
                {ungrouped.map((chore) => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    onReassign={() => handleReassignClick(chore)}
                    onClick={() => handleChoreClick(chore)}
                  />
                ))}
              </StaggeredList>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([groupKey, groupChores], groupIndex) => {
                  const isCollapsed = collapsedGroups.has(groupKey);
                  const groupLabel = groupChores[0]?.groupLabel || groupKey;
                  
                  return (
                    <div key={groupKey} className="space-y-3">
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="w-full flex items-center justify-between p-3 rounded-lg button-hover text-left"
                        style={{ 
                          background: 'var(--gradient-elevated)',
                          borderLeft: '4px solid var(--primary-500)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span 
                            className="text-lg"
                            style={{ 
                              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                              transition: 'transform 200ms ease'
                            }}
                          >
                            ▼
                          </span>
                          <h3 
                            className="font-semibold"
                            style={{ color: 'var(--neutral-900)' }}
                          >
                            {groupLabel}
                          </h3>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: 'var(--primary-100)',
                              color: 'var(--primary-700)'
                            }}
                          >
                            {groupChores.length}
                          </span>
                        </div>
                      </button>
                      
                      {/* Group Content */}
                      {!isCollapsed && (
                        <div className="ml-4 space-y-2">
                          <StaggeredList staggerDelay={30}>
                            {groupChores.map((chore) => (
                              <ChoreCard 
                                key={chore.id} 
                                chore={chore} 
                                onReassign={() => handleReassignClick(chore)}
                                onClick={() => handleChoreClick(chore)}
                              />
                            ))}
                          </StaggeredList>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Create Chore Modal */}
        {isCreateModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
            style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setIsCreateModalOpen(false)}
          >
            <div 
              className="glass-morphism rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto slide-up shadow-floating"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="flex items-center justify-between p-6 border-b"
                style={{ borderBottomColor: 'var(--glass-border)' }}
              >
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  Create New Chore
                </h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 rounded-lg button-hover"
                  style={{ 
                    color: 'var(--neutral-400)',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <ChoreForm
                  onSubmit={handleCreateChore}
                  onCancel={() => setIsCreateModalOpen(false)}
                  isLoading={createChoreMutation.isPending}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chore Detail Modal */}
        {detailChoreId && (
          <ChoreDetailModal
            isOpen={true}
            onClose={() => setDetailChoreId(null)}
            choreId={detailChoreId}
            onReassign={handleDetailReassign}
          />
        )}

        {/* Reassign Modal */}
        {reassignChore && (
          <ReassignModal
            isOpen={true}
            onClose={() => setReassignChore(null)}
            choreId={reassignChore.id}
            choreTitle={reassignChore.title}
            currentAssignee={reassignChore.assignee}
          />
        )}
      </div>
    </PageTransition>
  );
}