import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { Modal } from './Modal';
import { UserAvatar } from './UserAvatar';

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
    onSuccess: () => {
      utils.chores.getDashboard.invalidate();
      utils.chores.getAll.invalidate();
      onClose();
      setSelectedUserId(null);
      setReason('');
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Currently assigned to:
            </h4>
            <div className="flex items-center space-x-3">
              <UserAvatar 
                avatar={currentAssignee.avatar} 
                name={currentAssignee.first_name}
                size="md"
              />
              <span className="font-medium">{currentAssignee.first_name}</span>
            </div>
          </div>
        )}

        {/* New Assignment */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Reassign to:
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {availableUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-colors
                  ${selectedUserId === user.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    avatar={user.avatar} 
                    name={user.first_name}
                    size="md"
                  />
                  <span className="font-medium">{user.first_name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reason (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Why is this chore being reassigned?"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={!selectedUserId || reassignMutation.isPending}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {reassignMutation.isPending ? 'Reassigning...' : 'Reassign Chore'}
          </button>
          
          <button
            type="button"
            onClick={handleClose}
            disabled={reassignMutation.isPending}
            className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}