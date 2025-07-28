import { useState, useMemo } from 'react';
import { trpc } from '../lib/trpc';

export type CalendarFrequencyFilter = 'all' | number;

export function useCalendarFiltering() {
  const [selectedFrequency, setSelectedFrequency] = useState<CalendarFrequencyFilter>('all');
  
  // Get frequency types for filter options
  const { data: frequencyTypes = [] } = trpc.frequencyTypes.getAll.useQuery();

  // Filter options for the dropdown
  const filterOptions = useMemo(() => {
    const options = [
      { id: 'all' as const, name: 'View All', description: 'Show all chores' },
      ...frequencyTypes.map(freq => ({
        id: freq.id,
        name: freq.name.charAt(0).toUpperCase() + freq.name.slice(1),
        description: `Show ${freq.name} chores only`,
      }))
    ];
    return options;
  }, [frequencyTypes]);

  // Quick filter buttons for common frequencies
  const quickFilters = useMemo(() => {
    // Find common frequency types by name
    const weekly = frequencyTypes.find(f => f.name.toLowerCase().includes('weekly') && !f.name.toLowerCase().includes('biweekly'));
    const biweekly = frequencyTypes.find(f => f.name.toLowerCase().includes('biweekly'));
    const monthly = frequencyTypes.find(f => f.name.toLowerCase().includes('monthly'));

    const filters = [];
    if (weekly) filters.push({ id: weekly.id, name: 'Weekly', icon: '📊' });
    if (biweekly) filters.push({ id: biweekly.id, name: 'Bi-weekly', icon: '📈' });
    if (monthly) filters.push({ id: monthly.id, name: 'Monthly', icon: '📆' });

    return filters;
  }, [frequencyTypes]);

  // Filter function to apply to chore data
  const filterChores = useMemo(() => {
    return (chores: any[]) => {
      if (selectedFrequency === 'all') {
        return chores;
      }
      
      // Find the selected frequency type
      const selectedFrequencyType = frequencyTypes.find(f => f.id === selectedFrequency);
      if (!selectedFrequencyType) {
        return chores;
      }
      
      // Filter chores by matching frequency_name
      return chores.filter((chore: any) => {
        const choreFrequencyName = chore.frequency_name;
        return choreFrequencyName === selectedFrequencyType.name;
      });
    };
  }, [selectedFrequency, frequencyTypes]);

  // Get current filter name for display
  const currentFilterName = useMemo(() => {
    if (selectedFrequency === 'all') return 'All Chores';
    const filterOption = filterOptions.find(option => option.id === selectedFrequency);
    return filterOption?.name || 'Unknown Filter';
  }, [selectedFrequency, filterOptions]);

  // Clear filters
  const clearFilters = () => {
    setSelectedFrequency('all');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedFrequency !== 'all';

  return {
    selectedFrequency,
    setSelectedFrequency,
    filterOptions,
    quickFilters,
    filterChores,
    currentFilterName,
    clearFilters,
    hasActiveFilters,
  };
}