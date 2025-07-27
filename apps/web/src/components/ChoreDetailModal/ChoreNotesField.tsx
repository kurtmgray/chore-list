import { Textarea } from '../ui/Input';

interface ChoreNotesFieldProps {
  choreWithCategory: any;
  isEditing: boolean;
  editedNotes: string;
  onNotesChange: (value: string) => void;
}

export function ChoreNotesField({ 
  choreWithCategory, 
  isEditing, 
  editedNotes, 
  onNotesChange 
}: ChoreNotesFieldProps) {
  return (
    <div>
      <label 
        className="block text-sm font-semibold mb-3"
        style={{ color: '#374151' }}
      >
        Notes
      </label>
      {isEditing ? (
        <Textarea
          value={editedNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any notes or comments..."
          rows={5}
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
          className="text-sm p-4 rounded-xl min-h-[120px] leading-relaxed"
          style={{ 
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: choreWithCategory.notes ? '#1e293b' : '#64748b',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          {choreWithCategory.notes || 'No notes yet'}
        </div>
      )}
    </div>
  );
}