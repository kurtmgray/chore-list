import type { CalendarDayData } from '../../hooks/useCalendarData';

interface CalendarDayProps {
  day: CalendarDayData;
  onClick?: (day: CalendarDayData) => void;
}

export function CalendarDay({ day, onClick }: CalendarDayProps) {
  const { date, isToday, chores } = day;
  
  // Count chores by status
  const choreStats = {
    total: chores.length,
    overdue: chores.filter(c => {
      if (!c.next_due) return false;
      const dueDate = new Date(c.next_due);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return dueDate < today && c.status !== 'completed';
    }).length,
    completed: chores.filter(c => c.status === 'completed').length,
  };

  const hasChores = choreStats.total > 0;
  const hasOverdue = choreStats.overdue > 0;
  
  return (
    <div
      className={`
        relative min-h-[80px] lg:min-h-[100px] p-2 lg:p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${isToday 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }
        ${hasOverdue ? 'ring-2 ring-red-200' : ''}
      `}
      style={{
        boxShadow: isToday 
          ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
          : hasChores 
          ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
          : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => onClick?.(day)}
    >
      {/* Date Number */}
      <div className="flex items-start justify-between mb-2">
        <span 
          className={`
            text-sm lg:text-base font-semibold
            ${isToday 
              ? 'text-blue-700' 
              : day.isInCurrentMonth 
              ? 'text-gray-900' 
              : 'text-gray-400'
            }
          `}
        >
          {date.getDate()}
        </span>
        
        {/* Today indicator */}
        {isToday && (
          <div 
            className="w-2 h-2 rounded-full bg-blue-500"
            title="Today"
          />
        )}
      </div>

      {/* Day name (mobile only) */}
      <div className="block lg:hidden text-xs text-gray-500 mb-1">
        {date.toLocaleDateString('en-US', { weekday: 'short' })}
      </div>

      {/* Chore indicators */}
      {hasChores && (
        <div className="space-y-1">
          {/* Chore count badge */}
          <div className="flex items-center gap-1">
            <div 
              className={`
                inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-medium
                ${hasOverdue 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'
                }
              `}
            >
              {choreStats.total}
            </div>
            
            {/* Overdue indicator */}
            {hasOverdue && (
              <span className="text-xs text-red-600" title={`${choreStats.overdue} overdue`}>
                ⚠️
              </span>
            )}
          </div>

          {/* Chore preview dots (desktop only) */}
          <div className="hidden lg:flex flex-wrap gap-1 mt-1">
            {chores.slice(0, 3).map((chore, index) => (
              <div
                key={chore.id}
                className={`
                  w-2 h-2 rounded-full
                  ${chore.status === 'completed' 
                    ? 'bg-green-400' 
                    : hasOverdue && chore.next_due && new Date(chore.next_due) < new Date()
                    ? 'bg-red-400'
                    : 'bg-blue-400'
                  }
                `}
                title={chore.title}
              />
            ))}
            {chores.length > 3 && (
              <div 
                className="w-2 h-2 rounded-full bg-gray-300"
                title={`+${chores.length - 3} more`}
              />
            )}
          </div>
        </div>
      )}

      {/* Empty state for no chores */}
      {!hasChores && (
        <div className="text-center pt-2">
          <span className="text-gray-300 text-xl">·</span>
        </div>
      )}
    </div>
  );
}