import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
}: ModalProps) {
  // Debug modal props
  console.log('Modal render - isOpen:', isOpen, 'title:', title);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-sm mx-3 sm:max-w-md',
    md: 'w-full max-w-md mx-3 sm:max-w-lg',
    lg: 'w-full max-w-lg mx-3 sm:max-w-xl lg:max-w-2xl',
    xl: 'w-full max-w-xl mx-3 sm:max-w-2xl lg:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className={`
            relative w-full ${sizeClasses[size]} transform transition-all max-h-[90vh] overflow-hidden
            gradient-surface rounded-xl shadow-floating
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 sm:p-6 border-b"
            style={{ borderBottomColor: 'var(--neutral-200)' }}
          >
            <h2 
              className="text-lg sm:text-xl font-semibold pr-2"
              style={{ color: 'var(--neutral-900)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-3 rounded-lg transition-colors duration-200 button-hover min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ 
                color: 'var(--neutral-400)',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
