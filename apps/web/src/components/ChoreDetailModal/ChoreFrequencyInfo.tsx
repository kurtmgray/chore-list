interface FrequencyType {
  id: number;
  name: string;
}

interface ChoreFrequencyInfoProps {
  choreWithCategory: any;
  isEditing: boolean;
  editedFrequencyTypeId: number;
  onFrequencyChange: (value: number) => void;
  frequencyTypes?: FrequencyType[];
}

export function ChoreFrequencyInfo({ 
  choreWithCategory, 
  isEditing, 
  editedFrequencyTypeId, 
  onFrequencyChange,
  frequencyTypes 
}: ChoreFrequencyInfoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <label 
          className="block text-sm font-semibold mb-3"
          style={{ color: '#374151' }}
        >
          Frequency
        </label>
        {isEditing ? (
          <select
            value={editedFrequencyTypeId}
            onChange={(e) => onFrequencyChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 rounded-lg text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            <option value={0}>Select frequency...</option>
            {frequencyTypes?.map(freq => (
              <option key={freq.id} value={freq.id}>
                {freq.name.charAt(0).toUpperCase() + freq.name.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <div 
            className="px-4 py-3 rounded-xl font-medium"
            style={{ 
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="text-sm">
              {frequencyTypes?.find(f => f.id === choreWithCategory.frequency_type_id)?.name?.charAt(0).toUpperCase() + 
               (frequencyTypes?.find(f => f.id === choreWithCategory.frequency_type_id)?.name?.slice(1) || '') || 'Unknown'}
            </span>
          </div>
        )}
      </div>

      <div>
        <label 
          className="block text-sm font-semibold mb-3"
          style={{ color: '#374151' }}
        >
          Last Completed
        </label>
        <div 
          className="px-4 py-3 rounded-xl font-medium"
          style={{ 
            backgroundColor: choreWithCategory.last_completed ? '#f0f9ff' : '#f9fafb',
            border: `1px solid ${choreWithCategory.last_completed ? '#bae6fd' : '#e5e7eb'}`,
            color: choreWithCategory.last_completed ? '#0c4a6e' : '#6b7280',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <span className="text-sm">
            {choreWithCategory.last_completed 
              ? new Date(choreWithCategory.last_completed).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Never completed'
            }
          </span>
        </div>
      </div>
    </div>
  );
}