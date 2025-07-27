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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-morphism rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto slide-up shadow-floating"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderBottomColor: 'var(--glass-border)' }}
        >
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--neutral-900)' }}
          >
            Create New Chore
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg button-hover"
            style={{ 
              color: 'var(--neutral-400)',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <ChoreForm
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}