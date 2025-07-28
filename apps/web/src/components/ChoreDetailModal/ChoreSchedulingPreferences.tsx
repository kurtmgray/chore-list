interface FrequencyType {
  id: number;
  name: string;
  days_interval: number | null;
}

interface ChoreSchedulingPreferencesProps {
  choreWithCategory: any;
  isEditing: boolean;
  editedFrequencyTypeId: number;
  editedPreferredDay: number | null;
  editedPreferredWeek: number | null;
  scheduleChangeScope: 'once' | 'always';
  onPreferredDayChange: (day: number | null) => void;
  onPreferredWeekChange: (week: number | null) => void;
  onScopeChange: (scope: 'once' | 'always') => void;
  frequencyTypes?: FrequencyType[];
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const WEEKS_OF_MONTH = [
  { value: 1, label: '1st week' },
  { value: 2, label: '2nd week' },
  { value: 3, label: '3rd week' },
  { value: 4, label: '4th week' },
  { value: -1, label: 'Last week' },
];

export function ChoreSchedulingPreferences({
  choreWithCategory,
  isEditing,
  editedFrequencyTypeId,
  editedPreferredDay,
  editedPreferredWeek,
  scheduleChangeScope,
  onPreferredDayChange,
  onPreferredWeekChange,
  onScopeChange,
  frequencyTypes
}: ChoreSchedulingPreferencesProps) {
  // Get current frequency type
  const currentFrequencyType = frequencyTypes?.find(f => 
    f.id === (isEditing ? editedFrequencyTypeId : choreWithCategory.frequency_type_id)
  );

  const isWeeklyOrLonger = currentFrequencyType && 
    (currentFrequencyType.days_interval === null || currentFrequencyType.days_interval >= 7);
  
  const isMonthlyOrLonger = currentFrequencyType && 
    (currentFrequencyType.days_interval === null || currentFrequencyType.days_interval >= 30);

  // Don't show scheduling preferences for daily or unknown frequency types
  if (!isWeeklyOrLonger) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Scheduling Preferences Header */}
      <div className="border-t pt-6" style={{ borderTopColor: '#e5e7eb' }}>
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: '#374151' }}
        >
          Scheduling Preferences
        </h3>

        {/* Preferred Day (for weekly+ chores) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: '#374151' }}
            >
              Preferred Day of Week
            </label>
            {isEditing ? (
              <select
                value={editedPreferredDay ?? ''}
                onChange={(e) => onPreferredDayChange(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <option value="">No preference</option>
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            ) : (
              <div 
                className="px-4 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: choreWithCategory.suggested_day_of_week !== null ? '#f0f9ff' : '#f9fafb',
                  border: `1px solid ${choreWithCategory.suggested_day_of_week !== null ? '#bae6fd' : '#e5e7eb'}`,
                  color: choreWithCategory.suggested_day_of_week !== null ? '#0c4a6e' : '#6b7280',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="text-sm">
                  {choreWithCategory.suggested_day_of_week !== null 
                    ? DAYS_OF_WEEK.find(d => d.value === choreWithCategory.suggested_day_of_week)?.label
                    : 'No preference'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Preferred Week (for monthly+ chores) */}
          {isMonthlyOrLonger && (
            <div>
              <label 
                className="block text-sm font-semibold mb-3"
                style={{ color: '#374151' }}
              >
                Preferred Week of Month
              </label>
              {isEditing ? (
                <select
                  value={editedPreferredWeek ?? ''}
                  onChange={(e) => onPreferredWeekChange(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <option value="">No preference</option>
                  {WEEKS_OF_MONTH.map(week => (
                    <option key={week.value} value={week.value}>
                      {week.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div 
                  className="px-4 py-3 rounded-xl font-medium"
                  style={{ 
                    backgroundColor: choreWithCategory.properties?.preferred_week !== null ? '#f0f9ff' : '#f9fafb',
                    border: `1px solid ${choreWithCategory.properties?.preferred_week !== null ? '#bae6fd' : '#e5e7eb'}`,
                    color: choreWithCategory.properties?.preferred_week !== null ? '#0c4a6e' : '#6b7280',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span className="text-sm">
                    {choreWithCategory.properties?.preferred_week !== null 
                      ? WEEKS_OF_MONTH.find(w => w.value === choreWithCategory.properties?.preferred_week)?.label
                      : 'No preference'
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Schedule Change Scope (only show when editing) */}
        {isEditing && (
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: '#374151' }}
            >
              Apply Changes
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="once"
                  checked={scheduleChangeScope === 'once'}
                  onChange={(e) => onScopeChange(e.target.value as 'once' | 'always')}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium" style={{ color: '#374151' }}>
                  Once (this instance only)
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="always"
                  checked={scheduleChangeScope === 'always'}
                  onChange={(e) => onScopeChange(e.target.value as 'once' | 'always')}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium" style={{ color: '#374151' }}>
                  Always (update chore template)
                </span>
              </label>
            </div>
            <p 
              className="text-xs mt-2"
              style={{ color: '#6b7280' }}
            >
              "Once" changes only this occurrence. "Always" updates the chore for all future instances.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}