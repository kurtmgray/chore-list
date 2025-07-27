interface ChoreDetailHeaderProps {
  choreWithCategory: any;
  onClose: () => void;
}

export function ChoreDetailHeader({ choreWithCategory, onClose }: ChoreDetailHeaderProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 lg:p-5 border-b"
      style={{ 
        borderBottomColor: 'rgba(226, 232, 240, 0.8)',
        background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)'
      }}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          {choreWithCategory.category_icon || '📋'}
        </div>
        <div>
          <h2 
            className="text-2xl font-bold leading-tight"
            style={{ color: '#1e293b' }}
          >
            {choreWithCategory.title}
          </h2>
          <p 
            className="text-sm font-medium mt-1"
            style={{ color: '#64748b' }}
          >
            {choreWithCategory.category_name || 'Uncategorized'}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-3 rounded-xl transition-all duration-200 hover:bg-red-50"
        style={{ 
          color: '#64748b',
          fontSize: '20px',
          fontWeight: 'bold',
          border: '1px solid rgba(226, 232, 240, 0.6)'
        }}
      >
        ✕
      </button>
    </div>
  );
}