interface ErrorStateProps {
  onClose: () => void;
  title: string;
  message: string;
}

export function ErrorState({ onClose, title, message }: ErrorStateProps) {
  return (
    <div 
      className="!fixed !inset-0 !z-50 !m-0 md:!flex md:!items-start md:!justify-center md:!pt-8 md:!pb-8"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(20px)',
        margin: '0 !important',
        top: '0 !important',
        left: '0 !important',
        right: '0 !important',
        bottom: '0 !important'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full h-full md:w-auto md:h-auto md:rounded-2xl p-12 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-4xl">❌</div>
          <p className="text-base font-semibold" style={{ color: '#dc2626' }}>{title}</p>
          <p className="text-sm" style={{ color: '#64748b' }}>{message}</p>
        </div>
      </div>
    </div>
  );
}