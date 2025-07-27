import type { CalendarWeek, CalendarDayData } from '../../hooks/useCalendarData';
import { CalendarDay } from './CalendarDay';

interface CalendarGridProps {
  weeks: CalendarWeek[];
  onDayClick?: (day: CalendarDayData) => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({ weeks, onDayClick }: CalendarGridProps) {
  return (
    <div className="space-y-6">
      {/* Desktop Week Headers (hidden on mobile) */}
      <div className="hidden lg:grid grid-cols-7 gap-3 mb-4">
        {WEEKDAY_LABELS.map((day) => (
          <div 
            key={day}
            className="text-center text-sm font-semibold py-2"
            style={{ color: 'var(--neutral-600)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Weeks */}
      <div className="space-y-4 lg:space-y-6">
        {weeks.map((week) => (
          <div key={week.weekNumber} className="space-y-3">
            {/* Week Header (mobile only) */}
            <div className="block lg:hidden">
              <div className="flex items-center justify-between">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--neutral-700)' }}
                >
                  Week {week.weekNumber}
                </h3>
                <span 
                  className="text-xs"
                  style={{ color: 'var(--neutral-500)' }}
                >
                  {week.days[0]?.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} - {week.days[6]?.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 lg:gap-3">
              {week.days.map((day) => (
                <div key={day.date.toISOString()} className="relative">
                  <CalendarDay 
                    day={day} 
                    onClick={onDayClick}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Legend */}
      <div 
        className="flex flex-wrap items-center gap-4 pt-4 border-t text-xs"
        style={{ borderTopColor: 'var(--neutral-200)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></div>
          <span style={{ color: 'var(--neutral-600)' }}>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-400"></div>
          <span style={{ color: 'var(--neutral-600)' }}>Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-400"></div>
          <span style={{ color: 'var(--neutral-600)' }}>Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400"></div>
          <span style={{ color: 'var(--neutral-600)' }}>Completed</span>
        </div>
      </div>
    </div>
  );
}