import { useState, useEffect } from 'react';
import { trpc } from '../../lib/trpc';
import { useOptimisticChoreUpdates } from '../../hooks/useOptimisticChoreUpdates';
import { ChoreDetailHeader } from './ChoreDetailHeader';
import { ChoreStatusGrid } from './ChoreStatusGrid';
import { ChoreDescriptionField } from './ChoreDescriptionField';
import { ChoreNotesField } from './ChoreNotesField';
import { ChoreFrequencyInfo } from './ChoreFrequencyInfo';
import { ChoreActions } from './ChoreActions';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

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

  // Use shared optimistic updates hook
  const { createOptimisticCompleteMutation, createOptimisticUpdateMutation } = useOptimisticChoreUpdates();
  
  const completeMutation = createOptimisticCompleteMutation(choreId, onClose);
  const updateMutation = createOptimisticUpdateMutation(choreId, () => setIsEditing(false));

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
    return <LoadingState onClose={onClose} message="Loading chore details..." />;
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
      <ErrorState 
        onClose={onClose}
        title="Chore not found"
        message="The requested chore could not be loaded."
      />
    );
  }

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
        <ChoreDetailHeader choreWithCategory={choreWithCategory} onClose={onClose} />

        {/* Content */}
        <div className="p-4 lg:p-5 space-y-4" style={{ background: '#ffffff' }}>
          <ChoreStatusGrid choreWithCategory={choreWithCategory} users={users} />

          <ChoreDescriptionField 
            choreWithCategory={choreWithCategory}
            isEditing={isEditing}
            editedDescription={editedDescription}
            onDescriptionChange={setEditedDescription}
          />

          <ChoreNotesField 
            choreWithCategory={choreWithCategory}
            isEditing={isEditing}
            editedNotes={editedNotes}
            onNotesChange={setEditedNotes}
          />

          <ChoreFrequencyInfo 
            choreWithCategory={choreWithCategory}
            isEditing={isEditing}
            editedFrequencyTypeId={editedFrequencyTypeId}
            onFrequencyChange={setEditedFrequencyTypeId}
            frequencyTypes={frequencyTypes}
          />
        </div>

        <ChoreActions 
          choreWithCategory={choreWithCategory}
          isEditing={isEditing}
          onComplete={handleComplete}
          onReassign={onReassign || (() => {})}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          isCompleting={completeMutation.isPending}
          isUpdating={updateMutation.isPending}
        />
      </div>
    </div>
  );
}