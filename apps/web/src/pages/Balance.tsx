import { trpc } from '../lib/trpc';
import { PageTransition, FadeInUp } from '../components/PageTransition';
import { PageHeader } from '../components/PageHeader';

export function Balance() {
  const { data: dashboard, isLoading: dashboardLoading } = trpc.chores.getDashboard.useQuery();

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading balance data...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Workload Balance"
          subtitle="Track fairness and completion patterns across your household"
          variant="standard"
          delay={0}
        />

        {/* Workload Balance Dashboard */}
        {dashboard?.workloadBalance && dashboard.workloadBalance.length > 0 && (
          <FadeInUp delay={100}>
            <div 
              className="gradient-surface rounded-xl p-6 lg:p-8 shadow-elevated card-hover"
            >
              <h2 
                className="text-xl font-bold mb-6 flex items-center gap-3"
                style={{ color: 'var(--neutral-900)' }}
              >
                <span className="text-2xl">⚖️</span>
                Last 30 Days
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {dashboard.workloadBalance.map((userBalance) => {
                  const maxCompletions = Math.max(...dashboard.workloadBalance.map(u => Number(u.completion_count) || 0));
                  const completionPercentage = maxCompletions > 0 
                    ? ((Number(userBalance.completion_count) || 0) / maxCompletions) * 100 
                    : 0;
                  
                  return (
                    <div 
                      key={userBalance.id}
                      className="p-6 rounded-xl interactive-scale"
                      style={{ background: 'var(--gradient-elevated)' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{userBalance.avatar}</span>
                          <div>
                            <h3 
                              className="font-semibold text-lg"
                              style={{ color: 'var(--neutral-900)' }}
                            >
                              {userBalance.first_name}
                            </h3>
                            <p 
                              className="text-sm"
                              style={{ color: 'var(--neutral-600)' }}
                            >
                              {userBalance.completion_count || 0} completions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div 
                            className="text-3xl font-bold"
                            style={{ color: 'var(--primary-600)' }}
                          >
                            {userBalance.completion_count || 0}
                          </div>
                          <div 
                            className="text-xs font-medium"
                            style={{ color: 'var(--neutral-500)' }}
                          >
                            {completionPercentage.toFixed(0)}% of max
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div 
                        className="h-3 rounded-full overflow-hidden mb-2"
                        style={{ backgroundColor: 'var(--neutral-200)' }}
                      >
                        <div
                          className="h-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${completionPercentage}%`,
                            background: completionPercentage === 100 
                              ? 'var(--gradient-success)' 
                              : 'var(--gradient-primary)',
                          }}
                        />
                      </div>
                      
                      {/* Status indicator */}
                      <div className="flex items-center gap-2">
                        {completionPercentage >= 80 ? (
                          <>
                            <span style={{ color: 'var(--success-green)' }}>●</span>
                            <span 
                              className="text-xs font-medium"
                              style={{ color: 'var(--success-green)' }}
                            >
                              High contributor
                            </span>
                          </>
                        ) : completionPercentage >= 40 ? (
                          <>
                            <span style={{ color: 'var(--warning-amber)' }}>●</span>
                            <span 
                              className="text-xs font-medium"
                              style={{ color: 'var(--warning-amber)' }}
                            >
                              Moderate contributor
                            </span>
                          </>
                        ) : (
                          <>
                            <span style={{ color: 'var(--neutral-400)' }}>●</span>
                            <span 
                              className="text-xs font-medium"
                              style={{ color: 'var(--neutral-500)' }}
                            >
                              Light contributor
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Balance insights */}
              <div 
                className="p-4 rounded-lg border-l-4"
                style={{ 
                  backgroundColor: 'var(--primary-50)',
                  borderLeftColor: 'var(--primary-500)'
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div>
                    <h4 
                      className="font-medium mb-1"
                      style={{ color: 'var(--primary-700)' }}
                    >
                      Balance Insights
                    </h4>
                    <div className="space-y-1 text-sm" style={{ color: 'var(--primary-600)' }}>
                      <p>
                        <strong>Total completions:</strong> {dashboard.workloadBalance.reduce((sum, user) => sum + (Number(user.completion_count) || 0), 0)}
                      </p>
                      <p>
                        <strong>Average per person:</strong> {Math.round(dashboard.workloadBalance.reduce((sum, user) => sum + (Number(user.completion_count) || 0), 0) / dashboard.workloadBalance.length)}
                      </p>
                      {(() => {
                        const counts = dashboard.workloadBalance.map(u => Number(u.completion_count) || 0);
                        const max = Math.max(...counts);
                        const min = Math.min(...counts);
                        const difference = max - min;
                        return (
                          <p>
                            <strong>Balance gap:</strong> {difference} completions
                            {difference <= 2 && <span style={{ color: 'var(--success-green)' }}> (Very fair!)</span>}
                            {difference > 2 && difference <= 5 && <span style={{ color: 'var(--warning-amber)' }}> (Slightly uneven)</span>}
                            {difference > 5 && <span style={{ color: 'var(--error-red)' }}> (Needs attention)</span>}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Recent Activity */}
        {dashboard?.recentCompletions && dashboard.recentCompletions.length > 0 && (
          <FadeInUp delay={200}>
            <div 
              className="gradient-surface rounded-xl p-6 lg:p-8 shadow-elevated card-hover"
            >
              <h2 
                className="text-xl font-bold mb-6 flex items-center gap-3"
                style={{ color: 'var(--neutral-900)' }}
              >
                <span className="text-2xl">📈</span>
                Recent Activity
              </h2>
              
              <div className="space-y-3">
                {dashboard.recentCompletions.map((completion, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 rounded-lg interactive-scale"
                    style={{ background: 'var(--gradient-elevated)' }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{completion.category_icon}</span>
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: 'var(--neutral-900)' }}
                        >
                          {completion.title}
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: 'var(--neutral-600)' }}
                        >
                          {completion.category_name} • {new Date(completion.completed_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{completion.avatar}</span>
                      <div className="text-right">
                        <p 
                          className="font-medium text-sm"
                          style={{ color: 'var(--neutral-900)' }}
                        >
                          {completion.first_name}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--success-green)' }}
                        >
                          Completed
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Empty State */}
        {(!dashboard?.workloadBalance || dashboard.workloadBalance.length === 0) && (
          <FadeInUp delay={100}>
            <div 
              className="gradient-surface rounded-xl p-12 shadow-elevated text-center"
            >
              <div className="text-6xl mb-4">⚖️</div>
              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--neutral-900)' }}
              >
                No balance data yet
              </h3>
              <p 
                className="text-sm mb-6"
                style={{ color: 'var(--neutral-600)' }}
              >
                Complete some chores to start tracking workload balance across your household.
              </p>
            </div>
          </FadeInUp>
        )}
      </div>
    </PageTransition>
  );
}