import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { trpc } from '../lib/trpc';
import { useUser } from '../contexts/UserContext';
import { useChoreActions } from '../hooks/useChoreActions';
import { ChoreCard } from '../components/ChoreCard';
import { ReassignModal } from '../components/ReassignModal';
import { ChoreDetailModal } from '../components/ChoreDetailModal';
import { CreateChoreModal } from '../components/shared/CreateChoreModal';
import { PageTransition, StaggeredList, FadeInUp } from '../components/PageTransition';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/PageHeader';

export function Dashboard() {
  const { currentUser } = useUser();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  console.log('Dashboard render - isCreateModalOpen:', isCreateModalOpen);
  
  const {
    detailChoreId,
    reassignChore,
    handleChoreClick,
    handleReassignClick,
    handleDetailReassign,
    closeDetailModal,
    closeReassignModal,
  } = useChoreActions();
  
  // Dashboard data - minimal queries for critical info only
  const { data: users, isLoading: usersLoading } = trpc.users.getAll.useQuery();
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.getAll.useQuery();
  const { data: dashboard, isLoading: dashboardLoading } = trpc.chores.getDashboard.useQuery();
  
  // Mutations
  const utils = trpc.useUtils();
  const createChoreMutation = trpc.chores.create.useMutation({
    onSuccess: () => {
      utils.chores.getDashboard.invalidate();
      setIsCreateModalOpen(false);
    },
  });

  if (usersLoading || categoriesLoading || dashboardLoading) {
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

  const handleDetailReassignWrapper = () => {
    const allDashboardChores = [
      ...(dashboard?.overdue || []),
      ...(dashboard?.upcoming || [])
    ];
    handleDetailReassign(allDashboardChores);
  };


  return (
    <PageTransition>
      <div className="space-y-4 lg:space-y-6">
        {/* Enhanced header with gradient and floating action */}
        <PageHeader
          title={`Hello, ${currentUser?.first_name} ${currentUser?.avatar}`}
          subtitle={new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
          variant="enhanced"
          actionButton={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              className="shadow-floating pulse-glow"
            >
              <span className="mr-2">+</span>
              New Chore
            </Button>
          }
          stats={[
            {
              label: 'Overdue',
              value: dashboard?.overdue.length || 0,
              color: 'error'
            },
            {
              label: 'Due Soon',
              value: dashboard?.upcoming.length || 0,
              color: 'warning'
            },
            {
              label: 'Completed Today',
              value: dashboard?.recentCompletions.length || 0,
              color: 'success'
            }
          ]}
        />

        {/* Overdue Chores */}
        {dashboard?.overdue && dashboard.overdue.length > 0 && (
          <FadeInUp delay={100}>
            <div 
              className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated card-hover"
            >
              <h2 
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--error-red)' }}
              >
                <span className="text-base">🚨</span>
                Overdue ({dashboard.overdue.length})
              </h2>
              <StaggeredList staggerDelay={100}>
                {dashboard.overdue.map((chore) => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    onReassign={() => handleReassignClick(chore)}
                    onClick={() => handleChoreClick(chore)}
                  />
                ))}
              </StaggeredList>
            </div>
          </FadeInUp>
        )}

        {/* Upcoming Chores */}
        {dashboard?.upcoming && dashboard.upcoming.length > 0 && (
          <FadeInUp delay={200}>
            <div 
              className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated card-hover"
            >
              <h2 
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--warning-amber)' }}
              >
                <span className="text-base">📅</span>
                Due Soon ({dashboard.upcoming.length})
              </h2>
              <StaggeredList staggerDelay={75}>
                {dashboard.upcoming.map((chore) => (
                  <ChoreCard 
                    key={chore.id} 
                    chore={chore} 
                    onReassign={() => handleReassignClick(chore)}
                    onClick={() => handleChoreClick(chore)}
                  />
                ))}
              </StaggeredList>
            </div>
          </FadeInUp>
        )}

        {/* Recent Completions */}
        {dashboard?.recentCompletions && dashboard.recentCompletions.length > 0 && (
          <FadeInUp delay={300}>
            <div 
              className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated card-hover"
            >
              <h2 
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--success-green)' }}
              >
                <span className="text-base">✅</span>
                Recently Completed
              </h2>
              <StaggeredList staggerDelay={50}>
                {dashboard.recentCompletions.map((completion, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg interactive-scale"
                    style={{ background: 'var(--gradient-elevated)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{completion.category_icon}</span>
                      <div>
                        <p 
                          className="font-medium text-sm"
                          style={{ color: 'var(--neutral-900)' }}
                        >
                          {completion.title}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--neutral-600)' }}
                        >
                          {completion.category_name} • {new Date(completion.completed_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{completion.avatar}</span>
                      <span 
                        className="text-xs font-medium"
                        style={{ color: 'var(--neutral-600)' }}
                      >
                        {completion.first_name}
                      </span>
                    </div>
                  </div>
                ))}
              </StaggeredList>
            </div>
          </FadeInUp>
        )}


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