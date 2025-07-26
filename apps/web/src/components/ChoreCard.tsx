import { trpc } from '../lib/trpc';

interface Chore {
  id: number;
  title: string;
  status: string | null;
  next_due: string | null;
  category_name: string | null;
  category_icon: string | null;
  category_color?: string | null;
  first_name: string | null;
  avatar: string | null;
  priority_boost?: number | null;
}

interface ChoreCardProps {
  chore: Chore;
  onComplete?: () => void;
  onReassign?: () => void;
}

export function ChoreCard({ chore, onComplete, onReassign }: ChoreCardProps) {
  const utils = trpc.useUtils();

  const completeMutation = trpc.chores.complete.useMutation({
    onSuccess: () => {
      utils.chores.getDashboard.invalidate();
      onComplete?.();
    },
  });

  const handleComplete = () => {
    completeMutation.mutate({ id: chore.id });
  };

  const isOverdue = chore.next_due && new Date(chore.next_due) < new Date();
  const isDueToday =
    chore.next_due &&
    new Date(chore.next_due).toDateString() === new Date().toDateString();

  // const getStatusColor = () => {
  //   if (isOverdue) return 'border-red-200 bg-red-50';
  //   if (isDueToday) return 'border-yellow-200 bg-yellow-50';
  //   if (chore.status === 'completed') return 'border-green-200 bg-green-50';
  //   return 'border-gray-200 bg-white';
  // };

  const getDueDateText = () => {
    if (!chore.next_due) return '';

    const dueDate = new Date(chore.next_due);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div
      className="relative rounded-lg p-3 interactive-scale border fade-in"
      style={{
        background: 'var(--gradient-surface)',
        borderColor: isOverdue
          ? 'var(--error-red)'
          : isDueToday
          ? 'var(--warning-amber)'
          : 'var(--neutral-200)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Status indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{
          backgroundColor: isOverdue
            ? 'var(--error-red)'
            : isDueToday
            ? 'var(--warning-amber)'
            : chore.status === 'completed'
            ? 'var(--success-green)'
            : 'var(--neutral-300)',
        }}
      />

      <div className="flex items-center justify-between">
        {/* Left side - Icon and content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Category Icon */}
          <div className="text-xl flex-shrink-0">
            {chore.category_icon || '📋'}
          </div>

          {/* Chore info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-medium text-sm truncate"
                style={{ color: 'var(--neutral-900)' }}
              >
                {chore.title}
              </h3>
              {chore.priority_boost && chore.priority_boost > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--error-red)',
                    color: 'white',
                  }}
                >
                  ⚡
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs">
              {chore.category_name && (
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        chore.category_color || 'var(--neutral-400)',
                    }}
                  />
                  {chore.category_name}
                </span>
              )}

              {chore.next_due && (
                <span
                  style={{
                    color: isOverdue
                      ? 'var(--error-red)'
                      : isDueToday
                      ? 'var(--warning-amber)'
                      : 'var(--neutral-600)',
                    fontWeight: isOverdue || isDueToday ? 'medium' : 'normal',
                  }}
                >
                  {getDueDateText()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - User and actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Assigned user */}
          {chore.first_name && (
            <div className="flex items-center gap-1">
              <span className="text-sm">{chore.avatar}</span>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{ color: 'var(--neutral-600)' }}
              >
                {chore.first_name}
              </span>
            </div>
          )}

          {/* Enhanced action buttons */}
          {chore.status !== 'completed' && chore.status !== null && (
            <div className="flex gap-1">
              <button
                onClick={handleComplete}
                disabled={completeMutation.isPending}
                className="p-2 rounded-md button-hover"
                style={{
                  background: 'var(--gradient-success)',
                  color: 'white',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span className="text-sm">✓</span>
              </button>

              <button
                onClick={onReassign}
                className="p-2 rounded-md button-hover"
                style={{
                  background: 'var(--gradient-elevated)',
                  color: 'var(--neutral-600)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span className="text-sm">↗</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
