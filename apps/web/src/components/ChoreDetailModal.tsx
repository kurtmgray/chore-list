import { useState, useEffect } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { UserAvatar } from './UserAvatar';

interface ChoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  choreId: number;
  onReassign?: () => void;
}

export function ChoreDetailModal({ 
  isOpen, 
  onClose, 
  choreId, 
  onReassign 
}: ChoreDetailModalProps) {
  const utils = trpc.useUtils();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedFrequencyTypeId, setEditedFrequencyTypeId] = useState(0);

  // Fetch chore details
  const { data: chore, isLoading } = trpc.chores.getById.useQuery(
    { id: choreId },
    { enabled: isOpen && choreId > 0 }
  );

  const { data: users } = trpc.users.getAll.useQuery();
  const { data: frequencyTypes } = trpc.frequencyTypes.getAll.useQuery();
  const { data: categories } = trpc.categories.getAll.useQuery();

  // Mutations
  const completeMutation = trpc.chores.complete.useMutation({
    onMutate: async () => {
      // Optimistic updates similar to ChoreCard
      await utils.chores.getDashboard.cancel();
      await utils.chores.getAll.cancel();

      const previousDashboard = utils.chores.getDashboard.getData();
      const previousAllChores = utils.chores.getAll.getData();

      if (previousDashboard) {
        utils.chores.getDashboard.setData(undefined, {
          ...previousDashboard,
          overdue: previousDashboard.overdue.filter(c => c.id !== choreId),
          upcoming: previousDashboard.upcoming.filter(c => c.id !== choreId),
        });
      }

      if (previousAllChores) {
        const updatedChores = previousAllChores.map(c => 
          c.id === choreId 
            ? { ...c, status: 'completed' as const, last_completed: new Date().toISOString() }
            : c
        );
        utils.chores.getAll.setData({}, updatedChores);
      }

      return { previousDashboard, previousAllChores };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDashboard) {
        utils.chores.getDashboard.setData(undefined, context.previousDashboard);
      }
      if (context?.previousAllChores) {
        utils.chores.getAll.setData({}, context.previousAllChores);
      }
    },
    onSuccess: () => {
      onClose();
    },
    onSettled: () => {
      utils.chores.getDashboard.invalidate();
      utils.chores.getAll.invalidate();
    },
  });

  const updateMutation = trpc.chores.update.useMutation({
    onSuccess: () => {
      utils.chores.getById.invalidate({ id: choreId });
      utils.chores.getAll.invalidate();
      utils.chores.getDashboard.invalidate();
      setIsEditing(false);
    },
  });

  const handleComplete = () => {
    completeMutation.mutate({ id: choreId });
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: choreId,
      notes: editedNotes,
      short_description: editedDescription,
      frequency_type_id: editedFrequencyTypeId,
    });
  };

  const handleStartEdit = () => {
    setEditedNotes(choreWithCategory?.notes || '');
    setEditedDescription(choreWithCategory?.short_description || '');
    setEditedFrequencyTypeId(choreWithCategory?.frequency_type_id || 0);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedNotes('');
    setEditedDescription('');
    setEditedFrequencyTypeId(0);
  };

  // Add/remove modal-open class to body when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (isLoading) {
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
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>Loading chore details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get category information
  const category = chore && categories ? categories.find(cat => cat.id === chore.category_id) : null;
  const choreWithCategory = chore ? {
    ...chore,
    category_name: category?.name || null,
    category_icon: category?.icon || null,
    category_color: category?.color || null
  } : null;

  if (!choreWithCategory) {
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
            <p className="text-base font-semibold" style={{ color: '#dc2626' }}>Chore not found</p>
            <p className="text-sm" style={{ color: '#64748b' }}>The requested chore could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  const isOverdue = choreWithCategory.next_due && new Date(choreWithCategory.next_due) < new Date();
  const isDueToday = choreWithCategory.next_due && new Date(choreWithCategory.next_due).toDateString() === new Date().toDateString();

  const getDueDateText = () => {
    if (!choreWithCategory.next_due) return 'No due date';

    const dueDate = new Date(choreWithCategory.next_due);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div 
      className="!fixed !inset-0 !z-50 !m-0 md:!flex md:!items-start md:!justify-center md:!pt-8 md:!pb-8"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        margin: '0 !important',
        top: '0 !important',
        left: '0 !important',
        right: '0 !important',
        bottom: '0 !important'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full h-full md:w-auto md:h-auto md:max-w-3xl md:max-h-[calc(100vh-4rem)] overflow-y-auto md:rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Content */}
        <div className="p-4 lg:p-5 space-y-4" style={{ background: '#ffffff' }}>
          {/* Status, Due Date, and Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label 
                className="block text-xs font-semibold mb-2"
                style={{ color: '#374151' }}
              >
                Status
              </label>
              <div 
                className="px-3 py-2 rounded-lg inline-flex items-center gap-2 font-medium text-xs"
                style={{ 
                  backgroundColor: choreWithCategory.status === 'completed' 
                    ? '#10b981' 
                    : choreWithCategory.status === 'in_progress'
                    ? '#f59e0b'
                    : '#e5e7eb',
                  color: choreWithCategory.status === 'completed' || choreWithCategory.status === 'in_progress' 
                    ? 'white' 
                    : '#374151',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="font-semibold">
                  {(choreWithCategory.status || 'pending').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
                {choreWithCategory.priority_boost && choreWithCategory.priority_boost > 0 && (
                  <span>⚡</span>
                )}
              </div>
            </div>

            <div>
              <label 
                className="block text-xs font-semibold mb-2"
                style={{ color: '#374151' }}
              >
                Due Date
              </label>
              <div 
                className="px-3 py-2 rounded-lg"
                style={{ 
                  backgroundColor: isOverdue ? '#fef2f2' : isDueToday ? '#fefbf2' : '#f9fafb',
                  border: `1px solid ${isOverdue ? '#fecaca' : isDueToday ? '#fed7aa' : '#e5e7eb'}`,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                <p 
                  className="text-xs font-semibold"
                  style={{ 
                    color: isOverdue 
                      ? '#dc2626'
                      : isDueToday 
                      ? '#d97706'
                      : '#374151' 
                  }}
                >
                  {getDueDateText()}
                </p>
                {choreWithCategory.next_due && (
                  <p 
                    className="text-xs mt-1 font-medium opacity-75"
                    style={{ color: '#6b7280' }}
                  >
                    {new Date(choreWithCategory.next_due).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label 
                className="block text-xs font-semibold mb-2"
                style={{ color: '#374151' }}
              >
                Assigned To
              </label>
              {choreWithCategory.assigned_to ? (
                <div 
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span className="text-sm">{users?.find(u => u.id === choreWithCategory.assigned_to)?.avatar || '👤'}</span>
                  <span 
                    className="font-semibold text-xs"
                    style={{ color: '#0c4a6e' }}
                  >
                    {users?.find(u => u.id === choreWithCategory.assigned_to)?.first_name || 'Unknown'}
                  </span>
                </div>
              ) : (
                <div 
                  className="px-3 py-2 rounded-lg text-center"
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <p 
                    className="text-xs font-medium italic"
                    style={{ color: '#6b7280' }}
                  >
                    Unassigned
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* Description */}
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
                onChange={(e) => setEditedDescription(e.target.value)}
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

          {/* Notes */}
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
                onChange={(e) => setEditedNotes(e.target.value)}
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

          {/* Frequency and Last Completed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-semibold mb-3"
                style={{ color: '#374151' }}
              >
                Frequency
              </label>
              {isEditing ? (
                <select
                  value={editedFrequencyTypeId}
                  onChange={(e) => setEditedFrequencyTypeId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb',
                    color: '#374151',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <option value={0}>Select frequency...</option>
                  {frequencyTypes?.map(freq => (
                    <option key={freq.id} value={freq.id}>
                      {freq.name.charAt(0).toUpperCase() + freq.name.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <div 
                  className="px-4 py-3 rounded-xl font-medium"
                  style={{ 
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <span className="text-sm">
                    {frequencyTypes?.find(f => f.id === chore.frequency_type_id)?.name?.charAt(0).toUpperCase() + 
                     (frequencyTypes?.find(f => f.id === choreWithCategory.frequency_type_id)?.name?.slice(1) || '') || 'Unknown'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-semibold mb-3"
                style={{ color: '#374151' }}
              >
                Last Completed
              </label>
              <div 
                className="px-4 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: chore.last_completed ? '#f0f9ff' : '#f9fafb',
                  border: `1px solid ${chore.last_completed ? '#bae6fd' : '#e5e7eb'}`,
                  color: choreWithCategory.last_completed ? '#0c4a6e' : '#6b7280',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <span className="text-sm">
                  {choreWithCategory.last_completed 
                    ? new Date(choreWithCategory.last_completed).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'Never completed'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
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
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)',
                  transform: updateMutation.isPending ? 'scale(0.98)' : 'scale(1)'
                }}
              >
                {updateMutation.isPending ? (
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
                onClick={handleCancelEdit}
                disabled={updateMutation.isPending}
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
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)',
                    transform: completeMutation.isPending ? 'scale(0.98)' : 'scale(1)'
                  }}
                >
                  {completeMutation.isPending ? (
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
                disabled={completeMutation.isPending}
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
                onClick={handleStartEdit}
                disabled={completeMutation.isPending}
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
      </div>
    </div>
  );
}