import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/Button';

interface ReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  choreId: number;
  choreTitle: string;
  currentAssignee?: {
    id: number;
    first_name: string;
    avatar: string;
  } | null;
}

export function ReassignModal({ 
  isOpen, 
  onClose, 
  choreId, 
  choreTitle,
  currentAssignee 
}: ReassignModalProps) {
  const utils = trpc.useUtils();
  const { data: users } = trpc.users.getAll.useQuery();
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [reason, setReason] = useState('');

  const reassignMutation = trpc.chores.reassign.useMutation({
    onMutate: async ({ toUserId }) => {
      // Cancel any outgoing refetches
      await utils.chores.getDashboard.cancel();
      await utils.chores.getAll.cancel();

      // Snapshot the previous values
      const previousDashboard = utils.chores.getDashboard.getData();
      const previousAllChores = utils.chores.getAll.getData();

      // Find the new assignee info
      const newAssignee = users?.find(u => u.id === toUserId);

      // Optimistically update dashboard
      if (previousDashboard && newAssignee) {
        const updateChoreAssignment = (chore: any) => 
          chore.id === choreId 
            ? { 
                ...chore, 
                assigned_to: toUserId,
                first_name: newAssignee.first_name,
                avatar: newAssignee.avatar
              }
            : chore;

        utils.chores.getDashboard.setData(undefined, {
          ...previousDashboard,
          overdue: previousDashboard.overdue.map(updateChoreAssignment),
          upcoming: previousDashboard.upcoming.map(updateChoreAssignment),
        });
      }

      // Optimistically update all chores
      if (previousAllChores && newAssignee) {
        utils.chores.getAll.setData({},
          previousAllChores.map(chore => 
            chore.id === choreId 
              ? { 
                  ...chore, 
                  assigned_to: toUserId,
                  first_name: newAssignee.first_name,
                  avatar: newAssignee.avatar
                }
              : chore
          )
        );
      }

      return { previousDashboard, previousAllChores };
    },
    onError: (_err, _variables, context) => {
      // Roll back optimistic updates on error
      if (context?.previousDashboard) {
        utils.chores.getDashboard.setData(undefined, context.previousDashboard);
      }
      if (context?.previousAllChores) {
        utils.chores.getAll.setData({}, context.previousAllChores);
      }
    },
    onSuccess: () => {
      onClose();
      setSelectedUserId(null);
      setReason('');
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      utils.chores.getDashboard.invalidate();
      utils.chores.getAll.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) return;
    
    reassignMutation.mutate({
      id: choreId,
      toUserId: selectedUserId,
      reason: reason.trim() || undefined,
    });
  };

  const handleClose = () => {
    onClose();
    setSelectedUserId(null);
    setReason('');
  };

  const availableUsers = users?.filter(user => user.id !== currentAssignee?.id) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Reassign "${choreTitle}"`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Assignment */}
        {currentAssignee && (
          <div 
            className="rounded-lg p-4"
            style={{ background: 'var(--gradient-elevated)' }}
          >
            <h4 
              className="text-sm font-medium mb-2"
              style={{ color: 'var(--neutral-700)' }}
            >
              Currently assigned to:
            </h4>
            <div className="flex items-center space-x-3">
              <UserAvatar 
                avatar={currentAssignee.avatar} 
                name={currentAssignee.first_name}
                size="md"
              />
              <span 
                className="font-medium"
                style={{ color: 'var(--neutral-900)' }}
              >
                {currentAssignee.first_name}
              </span>
            </div>
          </div>
        )}

        {/* New Assignment */}
        <div>
          <h4 
            className="text-sm font-medium mb-3"
            style={{ color: 'var(--neutral-700)' }}
          >
            Reassign to:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className="p-3 rounded-lg border-2 text-left transition-all duration-200 interactive-scale"
                style={{
                  borderColor: selectedUserId === user.id 
                    ? 'var(--primary-500)' 
                    : 'var(--neutral-200)',
                  backgroundColor: selectedUserId === user.id 
                    ? 'var(--primary-50)' 
                    : 'var(--bg-surface)',
                  boxShadow: selectedUserId === user.id 
                    ? 'var(--shadow-md)' 
                    : 'var(--shadow-sm)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    avatar={user.avatar} 
                    name={user.first_name}
                    size="md"
                  />
                  <span 
                    className="font-medium"
                    style={{ color: 'var(--neutral-900)' }}
                  >
                    {user.first_name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reason (Optional) */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--neutral-700)' }}
          >
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--neutral-200)',
              color: 'var(--neutral-900)'
            }}
            placeholder="Why is this chore being reassigned?"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!selectedUserId}
            isLoading={reassignMutation.isPending}
            className="flex-1"
          >
            {reassignMutation.isPending ? 'Reassigning...' : 'Reassign Chore'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={reassignMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}