import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useChoreActions } from '../hooks/useChoreActions';
import { useChoreFiltering } from '../hooks/useChoreFiltering';
import { ChoreCard } from '../components/ChoreCard';
import { ChoreFiltersControls } from '../components/ChoreFiltersControls';
import { ReassignModal } from '../components/ReassignModal';
import { ChoreDetailModal } from '../components/ChoreDetailModal';
import { CreateChoreModal } from '../components/shared/CreateChoreModal';
import { PageTransition, StaggeredList, FadeInUp } from '../components/PageTransition';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/Button';

export function AllChores() {
  // const { currentUser } = useUser(); // Not needed for AllChores page
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    detailChoreId,
    reassignChore,
    handleChoreClick,
    handleReassignClick,
    handleDetailReassign,
    closeDetailModal,
    closeReassignModal,
  } = useChoreActions();
  
  const {
    choreFilter,
    setChoreFilter,
    sortBy,
    setSortBy,
    groupBy,
    setGroupBy,
    collapsedGroups,
    setCollapsedGroups,
    getGroupedChores,
    toggleGroup,
  } = useChoreFiltering();
  
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

  const handleCreateChore = (data: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createChoreMutation.mutate(data as any); // Type assertion needed for trpc mutation
  };

  const handleDetailReassignWrapper = () => {
    handleDetailReassign(allChores || []);
  };

  const { ungrouped, grouped } = getGroupedChores(allChores);
  const totalChores = ungrouped.length + Object.values(grouped).flat().length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="All Chores"
          subtitle="Manage and organize all household tasks"
          variant="standard"
          delay={0}
          actionButton={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              className="shadow-floating pulse-glow flex-shrink-0"
            >
              <span className="mr-2">+</span>
              New Chore
            </Button>
          }
        />

        {/* Filter and Sort Controls */}
        <FadeInUp delay={100}>
          <ChoreFiltersControls
            choreFilter={choreFilter}
            setChoreFilter={setChoreFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            users={users}
            categories={categories}
            totalChores={totalChores}
            filteredChores={totalChores}
            hasActiveFilters={!!(choreFilter.assignedTo || choreFilter.status)}
            onClearFilters={() => setChoreFilter({})}
          />
        </FadeInUp>

        {/* Group Controls */}
        {Object.keys(grouped).length > 0 && (
          <FadeInUp delay={150}>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCollapsedGroups(new Set())}
                className="text-xs px-3 py-2 rounded-lg button-hover"
                style={{ 
                  backgroundColor: 'var(--gradient-elevated)',
                  color: 'var(--neutral-600)'
                }}
              >
                Expand All
              </button>
              <button
                onClick={() => setCollapsedGroups(new Set(Object.keys(grouped)))}
                className="text-xs px-3 py-2 rounded-lg button-hover"
                style={{ 
                  backgroundColor: 'var(--gradient-elevated)',
                  color: 'var(--neutral-600)'
                }}
              >
                Collapse All
              </button>
            </div>
          </FadeInUp>
        )}

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
                {Object.entries(grouped).map(([groupKey, groupChores]) => {
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

        <CreateChoreModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateChore}
          isLoading={createChoreMutation.isPending}
        />

        {/* Chore Detail Modal */}
        {detailChoreId && (
          <ChoreDetailModal
            isOpen={true}
            onClose={closeDetailModal}
            choreId={detailChoreId}
            onReassign={handleDetailReassignWrapper}
          />
        )}

        {/* Reassign Modal */}
        {reassignChore && (
          <ReassignModal
            isOpen={true}
            onClose={closeReassignModal}
            choreId={reassignChore.id}
            choreTitle={reassignChore.title}
            currentAssignee={reassignChore.assignee}
          />
        )}
      </div>
    </PageTransition>
  );
}