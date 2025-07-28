import { useCalendarFiltering } from '../../hooks/useCalendarFiltering';
import type { CalendarFrequencyFilter } from '../../hooks/useCalendarFiltering';

interface CalendarFiltersProps {
  selectedFrequency: CalendarFrequencyFilter;
  onFrequencyChange: (frequency: CalendarFrequencyFilter) => void;
  totalChores: number;
  filteredChores: number;
}

export function CalendarFilters({ 
  selectedFrequency, 
  onFrequencyChange, 
  totalChores,
  filteredChores 
}: CalendarFiltersProps) {
  const { filterOptions, quickFilters, currentFilterName, hasActiveFilters, clearFilters } = useCalendarFiltering();

  return (
    <div 
      className="gradient-surface rounded-xl p-4 lg:p-5 shadow-elevated"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <label 
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: 'var(--neutral-600)' }}
          >
            Show:
          </label>
          <select
            value={selectedFrequency}
            onChange={(e) => {
              const value = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
              onFrequencyChange(value);
            }}
            className="px-3 py-2 rounded-lg text-sm border transition-all duration-200 min-w-[120px]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            {filterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Buttons */}
        {quickFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <span 
              className="text-sm font-medium whitespace-nowrap hidden lg:block"
              style={{ color: 'var(--neutral-600)' }}
            >
              Quick:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFrequencyChange(filter.id)}
                  className={`
                    flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
                    ${selectedFrequency === filter.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary & Clear */}
        <div className="lg:ml-auto flex items-center gap-4">
          <div className="text-sm" style={{ color: 'var(--neutral-600)' }}>
            Showing {filteredChores} of {totalChores} chores
            {hasActiveFilters && (
              <span className="ml-1 font-medium" style={{ color: 'var(--primary-600)' }}>
                ({currentFilterName})
              </span>
            )}
          </div>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs px-2 py-1 rounded-md button-hover"
              style={{ 
                backgroundColor: 'var(--gradient-elevated)',
                color: 'var(--neutral-600)'
              }}
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}