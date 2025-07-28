import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { useUser } from '../contexts/UserContext';
import { DynamicPropertyForm } from './DynamicPropertyForm';
import { CategoryBadge } from './CategoryBadge';
import { UserAvatar } from './UserAvatar';
import { Input, Textarea } from './ui/Input';
import { Button } from './ui/Button';

interface ChoreFormData {
  title: string;
  short_description: string;
  notes: string;
  category_id: number | null;
  frequency_type_id: number;
  suggested_day_of_week: number | null;
  assigned_to: number | null;
  properties: Record<string, any>;
}

interface ChoreFormProps {
  initialData?: Partial<ChoreFormData>;
  onSubmit: (data: ChoreFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
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

export function ChoreForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ChoreFormProps) {
  const { currentUser } = useUser();
  
  // Fetch data
  const { data: categories } = trpc.categories.getAll.useQuery();
  const { data: frequencyTypes } = trpc.frequencyTypes.getAll.useQuery();
  const { data: users } = trpc.users.getAll.useQuery();

  // Form state
  const [formData, setFormData] = useState<ChoreFormData>({
    title: '',
    short_description: '',
    notes: '',
    category_id: null,
    frequency_type_id: 0,
    suggested_day_of_week: null,
    assigned_to: currentUser?.id || null,
    properties: {},
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get selected category schema
  const selectedCategory = categories?.find(c => c.id === formData.category_id);
  const categorySchema = selectedCategory?.property_schema;

  // Get selected frequency type for conditional rendering
  const selectedFrequencyType = frequencyTypes?.find(f => f.id === formData.frequency_type_id);
  const isMonthlyOrLonger = selectedFrequencyType && 
    (selectedFrequencyType.days_interval === null || selectedFrequencyType.days_interval >= 30);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.frequency_type_id) {
      newErrors.frequency_type_id = 'Frequency is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const handleFieldChange = (field: keyof ChoreFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferredWeekChange = (preferredWeek: number | null) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        preferred_week: preferredWeek
      }
    }));
  };

  const handlePropertiesChange = (properties: Record<string, any>) => {
    handleFieldChange('properties', properties);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        {/* Title */}
        <Input
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="e.g., Clean kitchen counters"
          error={errors.title}
          required
        />

        {/* Short Description */}
        <Input
          label="Short Description"
          type="text"
          value={formData.short_description}
          onChange={(e) => handleFieldChange('short_description', e.target.value)}
          placeholder="Brief description of the task"
        />

        {/* Notes */}
        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          rows={3}
          placeholder="Additional notes or instructions"
        />
      </div>

      {/* Category & Frequency */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Category & Frequency</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--neutral-700)' }}
            >
              Category
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleFieldChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--neutral-200)',
                color: 'var(--neutral-900)'
              }}
            >
              <option value="">Select a category...</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {selectedCategory && (
              <div className="mt-2">
                <CategoryBadge
                  name={selectedCategory.name}
                  icon={selectedCategory.icon || undefined}
                  color={selectedCategory.color || undefined}
                  size="sm"
                />
              </div>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--neutral-700)' }}
            >
              Frequency <span style={{ color: 'var(--error-red)' }}>*</span>
            </label>
            <select
              value={formData.frequency_type_id}
              onChange={(e) => handleFieldChange('frequency_type_id', parseInt(e.target.value))}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 ${
                errors.frequency_type_id ? 'focus:ring-red-500 border-red-300' : 'focus:ring-blue-500'
              }`}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: errors.frequency_type_id ? 'var(--error-red)' : 'var(--neutral-200)',
                color: 'var(--neutral-900)'
              }}
            >
              <option value="">Select frequency...</option>
              {frequencyTypes?.map((freq) => (
                <option key={freq.id} value={freq.id}>
                  {freq.description}
                </option>
              ))}
            </select>
            {errors.frequency_type_id && (
              <p 
                className="text-sm mt-1 animate-pulse"
                style={{ color: 'var(--error-red)' }}
              >
                {errors.frequency_type_id}
              </p>
            )}
          </div>
        </div>

        {/* Suggested Day */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--neutral-700)' }}
          >
            Preferred Day (Optional)
          </label>
          <select
            value={formData.suggested_day_of_week || ''}
            onChange={(e) => handleFieldChange('suggested_day_of_week', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
          >
            <option value="">No preference</option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <p 
            className="mt-1 text-xs"
            style={{ color: 'var(--neutral-500)' }}
          >
            Suggest a preferred day for weekly or longer intervals
          </p>
        </div>

        {/* Preferred Week (for monthly+ chores) */}
        {isMonthlyOrLonger && (
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: 'var(--neutral-700)' }}
            >
              Preferred Week of Month (Optional)
            </label>
            <select
              value={formData.properties?.preferred_week || ''}
              onChange={(e) => handlePreferredWeekChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--neutral-200)',
                color: 'var(--neutral-900)'
              }}
            >
              <option value="">No preference</option>
              {WEEKS_OF_MONTH.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
            <p 
              className="mt-1 text-xs"
              style={{ color: 'var(--neutral-500)' }}
            >
              Specify which week of the month this chore should ideally occur
            </p>
          </div>
        )}
      </div>

      {/* Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Assignment</h3>
        
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--neutral-700)' }}
          >
            Assigned To
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleFieldChange('assigned_to', null)}
              className="p-3 rounded-lg border-2 text-left transition-colors"
              style={{
                borderColor: formData.assigned_to === null ? 'var(--primary-blue)' : 'var(--neutral-200)',
                backgroundColor: formData.assigned_to === null ? 'var(--primary-blue-50)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (formData.assigned_to !== null) {
                  e.currentTarget.style.borderColor = 'var(--neutral-300)';
                }
              }}
              onMouseLeave={(e) => {
                if (formData.assigned_to !== null) {
                  e.currentTarget.style.borderColor = 'var(--neutral-200)';
                }
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm font-medium">Unassigned</div>
              </div>
            </button>
            
            {users?.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleFieldChange('assigned_to', user.id)}
                className="p-3 rounded-lg border-2 text-left transition-colors"
                style={{
                  borderColor: formData.assigned_to === user.id ? 'var(--primary-blue)' : 'var(--neutral-200)',
                  backgroundColor: formData.assigned_to === user.id ? 'var(--primary-blue-50)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (formData.assigned_to !== user.id) {
                    e.currentTarget.style.borderColor = 'var(--neutral-300)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.assigned_to !== user.id) {
                    e.currentTarget.style.borderColor = 'var(--neutral-200)';
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    avatar={user.avatar} 
                    name={user.first_name} 
                    size="md"
                  />
                  <div className="text-sm font-medium mt-2">{user.first_name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category-specific Properties */}
      {categorySchema && typeof categorySchema === 'object' && 'properties' in categorySchema && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            {selectedCategory?.name} Details
          </h3>
          
          <DynamicPropertyForm
            schema={categorySchema as any}
            values={formData.properties}
            onChange={handlePropertiesChange}
            errors={errors}
          />
        </div>
      )}

      {/* Form Actions */}
      <div 
        className="flex space-x-3 pt-6 border-t"
        style={{ borderTopColor: 'var(--neutral-200)' }}
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Chore' : 'Create Chore'}
        </Button>
        
        <Button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}