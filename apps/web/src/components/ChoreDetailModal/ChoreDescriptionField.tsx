import { Textarea } from '../ui/Input';

interface ChoreDescriptionFieldProps {
  choreWithCategory: any;
  isEditing: boolean;
  editedDescription: string;
  onDescriptionChange: (value: string) => void;
}

export function ChoreDescriptionField({ 
  choreWithCategory, 
  isEditing, 
  editedDescription, 
  onDescriptionChange 
}: ChoreDescriptionFieldProps) {
  return (
    <div>
      <label 
        className="block text-xs font-semibold mb-2"
        style={{ color: '#374151' }}
      >
        Description
      </label>
      {isEditing ? (
        <Textarea
          value={editedDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Add a description for this chore..."
          rows={4}
          style={{
            fontSize: '14px',
            lineHeight: '1.5',
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        />
      ) : (
        <div 
          className="text-sm p-4 rounded-xl min-h-[100px] leading-relaxed"
          style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: choreWithCategory.short_description ? '#1e293b' : '#64748b',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {choreWithCategory.short_description || 'No description provided'}
        </div>
      )}
    </div>
  );
}