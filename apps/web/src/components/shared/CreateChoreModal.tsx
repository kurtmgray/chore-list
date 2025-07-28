import { ChoreForm } from '../ChoreForm';

interface CreateChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
  isLoading: boolean;
}

export function CreateChoreModal({ isOpen, onClose, onSubmit, isLoading }: CreateChoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div 
          className="relative w-full max-w-lg mx-3 sm:max-w-2xl lg:max-w-4xl transform transition-all max-h-[90vh] overflow-hidden gradient-surface rounded-xl shadow-floating slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="flex items-center justify-between p-4 sm:p-6 border-b"
            style={{ borderBottomColor: 'var(--neutral-200)' }}
          >
            <h2 
              className="text-lg sm:text-xl lg:text-2xl font-bold pr-2"
              style={{ color: 'var(--neutral-900)' }}
            >
              Create New Chore
            </h2>
            <button
              onClick={onClose}
              className="p-3 rounded-lg button-hover transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ 
                color: 'var(--neutral-400)',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
          
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            <ChoreForm
              onSubmit={onSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}