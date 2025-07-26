import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useUser } from '../contexts/UserContext';
import { ChoreCard } from '../components/ChoreCard';
import { ChoreForm } from '../components/ChoreForm';
import { ReassignModal } from '../components/ReassignModal';
import { PageTransition, StaggeredList, FadeInUp } from '../components/PageTransition';

export function Dashboard() {
  const { currentUser } = useUser();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Debug the modal state
  console.log('Dashboard render - isCreateModalOpen:', isCreateModalOpen);
  const [reassignChore, setReassignChore] = useState<{
    id: number;
    title: string;
    assignee?: { id: number; first_name: string; avatar: string; } | null;
  } | null>(null);
  
  // Test tRPC connection
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

  return (
    <PageTransition>
      <div className="space-y-4 lg:space-y-6">
        {/* Enhanced header with gradient and floating action */}
        <FadeInUp delay={0}>
          <div 
            className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated card-hover"
          >
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 
              className="text-xl lg:text-2xl font-semibold tracking-tight mb-1"
              style={{ color: 'var(--neutral-900)' }}
            >
              Hello, {currentUser?.first_name} {currentUser?.avatar}
            </h1>
            <p 
              className="text-sm lg:text-base"
              style={{ color: 'var(--neutral-600)' }}
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Enhanced Floating Action Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="gradient-primary rounded-xl p-3 lg:p-4 button-hover shadow-floating pulse-glow"
            style={{ color: 'white' }}
          >
            <span className="text-lg lg:text-xl">+</span>
          </button>
        </div>

        {/* Inline stats - horizontal scroll on mobile */}
        <div className="flex gap-4 lg:gap-6 overflow-x-auto pb-1">
          <div className="flex-shrink-0">
            <div 
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--neutral-600)' }}
            >
              Overdue
            </div>
            <div 
              className="text-xl lg:text-2xl font-semibold"
              style={{ color: 'var(--error-red)' }}
            >
              {dashboard?.overdue.length || 0}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div 
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--neutral-600)' }}
            >
              Due Soon
            </div>
            <div 
              className="text-xl lg:text-2xl font-semibold"
              style={{ color: 'var(--warning-amber)' }}
            >
              {dashboard?.upcoming.length || 0}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div 
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--neutral-600)' }}
            >
              Completed Today
            </div>
            <div 
              className="text-xl lg:text-2xl font-semibold"
              style={{ color: 'var(--success-green)' }}
            >
              {dashboard?.recentCompletions.length || 0}
            </div>
          </div>
        </div>
          </div>
        </FadeInUp>

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

      {/* Enhanced Create Chore Modal */}
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