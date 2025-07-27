import { useState } from 'react';

export interface ChoreFilter {
  assignedTo?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'missed' | 'skipped';
}

export type SortBy = 'due_date' | 'priority' | 'category' | 'title';
export type GroupBy = 'none' | 'category' | 'status' | 'assignee' | 'due_date';

export function useChoreFiltering() {
  const [choreFilter, setChoreFilter] = useState<ChoreFilter>({});
  const [sortBy, setSortBy] = useState<SortBy>('due_date');
  const [groupBy, setGroupBy] = useState<GroupBy>('category');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const sortChores = (chores: any[]) => {
    return chores.sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.next_due && !b.next_due) return 0;
          if (!a.next_due) return 1;
          if (!b.next_due) return -1;
          return new Date(a.next_due).getTime() - new Date(b.next_due).getTime();
        case 'priority':
          return (b.priority_boost || 0) - (a.priority_boost || 0);
        case 'category':
          return (a.category_name || '').localeCompare(b.category_name || '');
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const getGroupedChores = (allChores: any[] | undefined) => {
    if (!allChores) return { ungrouped: [], grouped: {} };
    
    let filtered = [...allChores];

    if (groupBy === 'none') {
      return { ungrouped: sortChores(filtered), grouped: {} };
    }

    const groups: Record<string, any[]> = {};
    
    filtered.forEach(chore => {
      let groupKey = '';
      let groupLabel = '';
      
      switch (groupBy) {
        case 'category':
          groupKey = chore.category_name || 'uncategorized';
          groupLabel = chore.category_name || 'Uncategorized';
          break;
        case 'status':
          groupKey = chore.status || 'pending';
          groupLabel = (chore.status || 'pending').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          break;
        case 'assignee':
          groupKey = chore.first_name || 'unassigned';
          groupLabel = chore.first_name || 'Unassigned';
          break;
        case 'due_date':
          if (!chore.next_due) {
            groupKey = 'no_due_date';
            groupLabel = 'No Due Date';
          } else {
            const dueDate = new Date(chore.next_due);
            const today = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              groupKey = 'overdue';
              groupLabel = 'Overdue';
            } else if (diffDays === 0) {
              groupKey = 'today';
              groupLabel = 'Due Today';
            } else if (diffDays === 1) {
              groupKey = 'tomorrow';
              groupLabel = 'Due Tomorrow';
            } else if (diffDays <= 7) {
              groupKey = 'this_week';
              groupLabel = 'This Week';
            } else {
              groupKey = 'later';
              groupLabel = 'Later';
            }
          }
          break;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({ ...chore, groupLabel });
    });

    const sortedGroups: Record<string, any[]> = {};
    Object.keys(groups)
      .sort((a, b) => {
        if (groupBy === 'due_date') {
          const order = ['overdue', 'today', 'tomorrow', 'this_week', 'later', 'no_due_date'];
          return order.indexOf(a) - order.indexOf(b);
        }
        return a.localeCompare(b);
      })
      .forEach(key => {
        sortedGroups[key] = sortChores(groups[key]);
      });

    return { ungrouped: [], grouped: sortedGroups };
  };

  const toggleGroup = (groupKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey);
    } else {
      newCollapsed.add(groupKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  return {
    choreFilter,
    setChoreFilter,
    sortBy,
    setSortBy,
    groupBy,
    setGroupBy,
    collapsedGroups,
    setCollapsedGroups,
    getGroupedChores,
    toggleGroup,
  };
}