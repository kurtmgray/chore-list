import { trpc } from '../lib/trpc';

export function useOptimisticChoreUpdates() {
  const utils = trpc.useUtils();

  const createOptimisticCompleteMutation = (choreId: number, onComplete?: () => void) => {
    return trpc.chores.complete.useMutation({
      onMutate: async () => {
        // Cancel any outgoing refetches
        await utils.chores.getDashboard.cancel();
        await utils.chores.getAll.cancel();

        // Snapshot previous values
        const previousDashboard = utils.chores.getDashboard.getData();
        const previousAllChores = utils.chores.getAll.getData();

        // Optimistically update dashboard - remove from overdue/upcoming
        if (previousDashboard) {
          utils.chores.getDashboard.setData(undefined, {
            ...previousDashboard,
            overdue: previousDashboard.overdue.filter(c => c.id !== choreId),
            upcoming: previousDashboard.upcoming.filter(c => c.id !== choreId),
          });
        }

        // Optimistically update all chores
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
        // Rollback on error
        if (context?.previousDashboard) {
          utils.chores.getDashboard.setData(undefined, context.previousDashboard);
        }
        if (context?.previousAllChores) {
          utils.chores.getAll.setData({}, context.previousAllChores);
        }
      },
      onSettled: () => {
        // Always refetch to ensure consistency
        utils.chores.getDashboard.invalidate();
        utils.chores.getAll.invalidate();
        utils.chores.getById.invalidate({ id: choreId });
        onComplete?.();
      },
    });
  };

  const createOptimisticUpdateMutation = (choreId: number, onSuccess?: () => void) => {
    return trpc.chores.update.useMutation({
      onSuccess: () => {
        utils.chores.getById.invalidate({ id: choreId });
        utils.chores.getAll.invalidate();
        utils.chores.getDashboard.invalidate();
        onSuccess?.();
      },
    });
  };

  return {
    createOptimisticCompleteMutation,
    createOptimisticUpdateMutation,
  };
}