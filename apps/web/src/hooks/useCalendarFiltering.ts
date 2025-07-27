import { useState, useMemo } from 'react';
import { trpc } from '../lib/trpc';

export type CalendarFrequencyFilter = 'all' | number;

export function useCalendarFiltering() {
  const [selectedFrequency, setSelectedFrequency] = useState<CalendarFrequencyFilter>('all');
  
  // Get frequency types for filter options
  const { data: frequencyTypes = [] } = trpc.frequencyTypes.getAll.useQuery();
  
  // Debug logging
  console.log('Frequency types loaded:', frequencyTypes);

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
    const daily = frequencyTypes.find(f => f.name.toLowerCase().includes('daily'));
    const weekly = frequencyTypes.find(f => f.name.toLowerCase().includes('weekly') && !f.name.toLowerCase().includes('biweekly'));
    const biweekly = frequencyTypes.find(f => f.name.toLowerCase().includes('biweekly'));
    const monthly = frequencyTypes.find(f => f.name.toLowerCase().includes('monthly'));

    const filters = [];
    if (daily) filters.push({ id: daily.id, name: 'Daily', icon: '📅' });
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
      
      // Debug logging
      console.log('Filtering chores:', {
        selectedFrequency,
        totalChores: chores.length,
        sampleChore: chores[0],
        choreFrequencyNames: chores.map(c => c.frequency_name)
      });
      
      // For now, just return all chores - we'll fix filtering after projection is working
      return chores;
    };
  }, [selectedFrequency]);

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