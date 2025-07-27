import { useMemo } from 'react';
import { PageTransition, FadeInUp } from '../components/PageTransition';
import { useCalendarData } from '../hooks/useCalendarData';
import { useCalendarFiltering } from '../hooks/useCalendarFiltering';
import { CalendarGrid, CalendarFilters } from '../components/Calendar';

export function Calendar() {
  // Fetch calendar data
  const { weeks, dateRangeText, totalChores, isLoading } = useCalendarData();
  
  // Calendar filtering
  const { selectedFrequency, setSelectedFrequency, filterChores } = useCalendarFiltering();

  // Apply filtering to calendar data
  const filteredWeeks = useMemo(() => {
    return weeks.map(week => ({
      ...week,
      days: week.days.map(day => ({
        ...day,
        chores: filterChores(day.chores),
      })),
    }));
  }, [weeks, filterChores]);

  // Calculate filtered chore count
  const filteredChoresCount = useMemo(() => {
    return filteredWeeks.reduce((total, week) => {
      return total + week.days.reduce((dayTotal, day) => dayTotal + day.chores.length, 0);
    }, 0);
  }, [filteredWeeks]);

  // Handle day click (future: open day detail modal)
  const handleDayClick = (day: any) => {
    console.log('Day clicked:', day);
    // TODO: Open day detail modal in Phase 2
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading calendar...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

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
                Calendar View
              </h1>
              <p 
                className="text-sm lg:text-base"
                style={{ color: 'var(--neutral-600)' }}
              >
                Rolling 4-week view • {dateRangeText}
              </p>
            </div>
          </div>
        </FadeInUp>

        {/* Calendar Filters */}
        <FadeInUp delay={100}>
          <CalendarFilters
            selectedFrequency={selectedFrequency}
            onFrequencyChange={setSelectedFrequency}
            totalChores={totalChores}
            filteredChores={filteredChoresCount}
          />
        </FadeInUp>

        {/* Calendar Grid */}
        <FadeInUp delay={200}>
          <div 
            className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated"
          >
            {filteredChoresCount === 0 && totalChores > 0 ? (
              // No results with active filter
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  No chores match this filter
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  Try selecting a different frequency filter or view all chores.
                </p>
              </div>
            ) : totalChores === 0 ? (
              // No chores at all
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 
                  className="text-lg font-medium mb-2"
                  style={{ color: 'var(--neutral-900)' }}
                >
                  No upcoming chores
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--neutral-600)' }}
                >
                  Your next 4 weeks are looking pretty clear!
                </p>
              </div>
            ) : (
              // Show calendar
              <CalendarGrid 
                weeks={filteredWeeks} 
                onDayClick={handleDayClick}
              />
            )}
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}