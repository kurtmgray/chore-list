interface ChoreActionsProps {
  choreWithCategory: any;
  isEditing: boolean;
  onComplete: () => void;
  onReassign: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isCompleting: boolean;
  isUpdating: boolean;
}

export function ChoreActions({ 
  choreWithCategory,
  isEditing,
  onComplete,
  onReassign,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  isCompleting,
  isUpdating
}: ChoreActionsProps) {
  return (
    <div 
      className="p-6 lg:p-8 border-t"
      style={{ 
        borderTopColor: 'rgba(226, 232, 240, 0.8)',
        background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)'
      }}
    >
      {isEditing ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onSaveEdit}
            disabled={isUpdating}
            className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)',
              transform: isUpdating ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>✓</span>
                Save Changes
              </span>
            )}
          </button>
          <button
            onClick={onCancelEdit}
            disabled={isUpdating}
            className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: '#ffffff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          {choreWithCategory.status !== 'completed' && (
            <button
              onClick={onComplete}
              disabled={isCompleting}
              className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)',
                transform: isCompleting ? 'scale(0.98)' : 'scale(1)'
              }}
            >
              {isCompleting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Completing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✓</span>
                  Mark Complete
                </span>
              )}
            </button>
          )}
          
          <button
            onClick={onReassign}
            disabled={isCompleting}
            className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <span>↗</span>
              Reassign
            </span>
          </button>
          
          <button
            onClick={onStartEdit}
            disabled={isCompleting}
            className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
            style={{
              background: '#ffffff',
              color: '#374151',
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <span>✏️</span>
              Edit
            </span>
          </button>
        </div>
      )}
    </div>
  );
}