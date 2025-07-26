import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { useUser } from '../contexts/UserContext';
import { DynamicPropertyForm } from './DynamicPropertyForm';
import { CategoryBadge } from './CategoryBadge';
import { UserAvatar } from './UserAvatar';

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
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="e.g., Clean kitchen counters"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Short Description
          </label>
          <input
            type="text"
            value={formData.short_description}
            onChange={(e) => handleFieldChange('short_description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the task"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Additional notes or instructions"
          />
        </div>
      </div>

      {/* Category & Frequency */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Category & Frequency</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleFieldChange('category_id', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">
              Frequency <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.frequency_type_id}
              onChange={(e) => handleFieldChange('frequency_type_id', parseInt(e.target.value))}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.frequency_type_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Select frequency...</option>
              {frequencyTypes?.map((freq) => (
                <option key={freq.id} value={freq.id}>
                  {freq.description}
                </option>
              ))}
            </select>
            {errors.frequency_type_id && (
              <p className="mt-1 text-sm text-red-600">{errors.frequency_type_id}</p>
            )}
          </div>
        </div>

        {/* Suggested Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Day (Optional)
          </label>
          <select
            value={formData.suggested_day_of_week || ''}
            onChange={(e) => handleFieldChange('suggested_day_of_week', e.target.value ? parseInt(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No preference</option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Suggest a preferred day for weekly or longer intervals
          </p>
        </div>
      </div>

      {/* Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Assignment</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleFieldChange('assigned_to', null)}
              className={`p-3 rounded-lg border-2 text-left transition-colors ${
                formData.assigned_to === null
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
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
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  formData.assigned_to === user.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
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
      <div className="flex space-x-3 pt-6 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Chore' : 'Create Chore'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}