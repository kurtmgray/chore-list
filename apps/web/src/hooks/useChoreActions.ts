import { useState } from 'react';

interface ChoreAssignee {
  id: number;
  first_name: string;
  avatar: string;
}

interface ReassignChore {
  id: number;
  title: string;
  assignee?: ChoreAssignee | null;
}

export function useChoreActions() {
  const [detailChoreId, setDetailChoreId] = useState<number | null>(null);
  const [reassignChore, setReassignChore] = useState<ReassignChore | null>(null);

  const handleChoreClick = (chore: any) => {
    setDetailChoreId(chore.id);
  };

  const handleReassignClick = (chore: any) => {
    setReassignChore({
      id: chore.id,
      title: chore.title,
      assignee: chore.first_name ? {
        id: chore.assigned_to || 0,
        first_name: chore.first_name,
        avatar: chore.avatar || '👤'
      } : null
    });
  };

  const handleDetailReassign = (allChores: any[] = []) => {
    if (detailChoreId) {
      const chore = allChores.find(c => c.id === detailChoreId);
      if (chore) {
        handleReassignClick(chore);
        setDetailChoreId(null);
      }
    }
  };

  const closeDetailModal = () => setDetailChoreId(null);
  const closeReassignModal = () => setReassignChore(null);

  return {
    detailChoreId,
    reassignChore,
    handleChoreClick,
    handleReassignClick,
    handleDetailReassign,
    closeDetailModal,
    closeReassignModal,
  };
}