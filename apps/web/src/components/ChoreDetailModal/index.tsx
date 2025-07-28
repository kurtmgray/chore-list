import { useState, useEffect } from 'react';
import { trpc } from '../../lib/trpc';
import { useOptimisticChoreUpdates } from '../../hooks/useOptimisticChoreUpdates';
import { ChoreDetailHeader } from './ChoreDetailHeader';
import { ChoreStatusGrid } from './ChoreStatusGrid';
import { ChoreDescriptionField } from './ChoreDescriptionField';
import { ChoreNotesField } from './ChoreNotesField';
import { ChoreFrequencyInfo } from './ChoreFrequencyInfo';
import { ChoreSchedulingPreferences } from './ChoreSchedulingPreferences';
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
  const [editedPreferredDay, setEditedPreferredDay] = useState<number | null>(null);
  const [editedPreferredWeek, setEditedPreferredWeek] = useState<number | null>(null);
  const [scheduleChangeScope, setScheduleChangeScope] = useState<'once' | 'always'>('once');

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
    // Prepare properties object for preferred week (monthly+ chores)
    const currentProperties = choreWithCategory?.properties || {};
    const updatedProperties = editedPreferredWeek !== null 
      ? { ...currentProperties, preferred_week: editedPreferredWeek }
      : currentProperties;

    updateMutation.mutate({
      id: choreId,
      notes: editedNotes,
      short_description: editedDescription,
      frequency_type_id: editedFrequencyTypeId,
      suggested_day_of_week: editedPreferredDay,
      properties: updatedProperties,
      // TODO: Implement schedule_change_scope in backend for "once" vs "always"
    });
  };

  const handleStartEdit = () => {
    setEditedNotes(choreWithCategory?.notes || '');
    setEditedDescription(choreWithCategory?.short_description || '');
    setEditedFrequencyTypeId(choreWithCategory?.frequency_type_id || 0);
    setEditedPreferredDay(choreWithCategory?.suggested_day_of_week || null);
    setEditedPreferredWeek(choreWithCategory?.properties?.preferred_week || null);
    setScheduleChangeScope('once'); // Default to "once" for safety
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedNotes('');
    setEditedDescription('');
    setEditedFrequencyTypeId(0);
    setEditedPreferredDay(null);
    setEditedPreferredWeek(null);
    setScheduleChangeScope('once');
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div 
          className="relative w-full max-w-md mx-3 sm:max-w-lg lg:max-w-3xl transform transition-all max-h-[90vh] overflow-hidden gradient-surface rounded-xl shadow-floating"
          onClick={(e) => e.stopPropagation()}
        >
          <ChoreDetailHeader choreWithCategory={choreWithCategory} onClose={onClose} />

          {/* Content */}
          <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
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

          <ChoreSchedulingPreferences
            choreWithCategory={choreWithCategory}
            isEditing={isEditing}
            editedFrequencyTypeId={editedFrequencyTypeId}
            editedPreferredDay={editedPreferredDay}
            editedPreferredWeek={editedPreferredWeek}
            scheduleChangeScope={scheduleChangeScope}
            onPreferredDayChange={setEditedPreferredDay}
            onPreferredWeekChange={setEditedPreferredWeek}
            onScopeChange={setScheduleChangeScope}
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
    </div>
  );
}