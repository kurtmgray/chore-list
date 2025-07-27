interface User {
  id: number;
  first_name: string;
  avatar: string;
}

interface ChoreStatusGridProps {
  choreWithCategory: any;
  users?: User[];
}

export function ChoreStatusGrid({ choreWithCategory, users }: ChoreStatusGridProps) {
  const isOverdue = choreWithCategory.next_due && new Date(choreWithCategory.next_due) < new Date();
  const isDueToday = choreWithCategory.next_due && new Date(choreWithCategory.next_due).toDateString() === new Date().toDateString();

  const getDueDateText = () => {
    if (!choreWithCategory.next_due) return 'No due date';

    const dueDate = new Date(choreWithCategory.next_due);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div>
        <label 
          className="block text-xs font-semibold mb-2"
          style={{ color: '#374151' }}
        >
          Status
        </label>
        <div 
          className="px-3 py-2 rounded-lg inline-flex items-center gap-2 font-medium text-xs"
          style={{ 
            backgroundColor: choreWithCategory.status === 'completed' 
              ? '#10b981' 
              : choreWithCategory.status === 'in_progress'
              ? '#f59e0b'
              : '#e5e7eb',
            color: choreWithCategory.status === 'completed' || choreWithCategory.status === 'in_progress' 
              ? 'white' 
              : '#374151',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          <span className="font-semibold">
            {(choreWithCategory.status || 'pending').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
          {choreWithCategory.priority_boost && choreWithCategory.priority_boost > 0 && (
            <span>⚡</span>
          )}
        </div>
      </div>

      <div>
        <label 
          className="block text-xs font-semibold mb-2"
          style={{ color: '#374151' }}
        >
          Due Date
        </label>
        <div 
          className="px-3 py-2 rounded-lg"
          style={{ 
            backgroundColor: isOverdue ? '#fef2f2' : isDueToday ? '#fefbf2' : '#f9fafb',
            border: `1px solid ${isOverdue ? '#fecaca' : isDueToday ? '#fed7aa' : '#e5e7eb'}`,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          <p 
            className="text-xs font-semibold"
            style={{ 
              color: isOverdue 
                ? '#dc2626'
                : isDueToday 
                ? '#d97706'
                : '#374151' 
            }}
          >
            {getDueDateText()}
          </p>
          {choreWithCategory.next_due && (
            <p 
              className="text-xs mt-1 font-medium opacity-75"
              style={{ color: '#6b7280' }}
            >
              {new Date(choreWithCategory.next_due).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div>
        <label 
          className="block text-xs font-semibold mb-2"
          style={{ color: '#374151' }}
        >
          Assigned To
        </label>
        {choreWithCategory.assigned_to ? (
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="text-sm">{users?.find(u => u.id === choreWithCategory.assigned_to)?.avatar || '👤'}</span>
            <span 
              className="font-semibold text-xs"
              style={{ color: '#0c4a6e' }}
            >
              {users?.find(u => u.id === choreWithCategory.assigned_to)?.first_name || 'Unknown'}
            </span>
          </div>
        ) : (
          <div 
            className="px-3 py-2 rounded-lg text-center"
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            <p 
              className="text-xs font-medium italic"
              style={{ color: '#6b7280' }}
            >
              Unassigned
            </p>
          </div>
        )}
      </div>
    </div>
  );
}