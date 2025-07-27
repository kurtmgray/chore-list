import { useMemo } from 'react';
import { trpc } from '../lib/trpc';

// Helper function to get Monday of any week
const getMondayOfWeek = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Sunday = 0, Monday = 1
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0); // Start of day
  return monday;
};

// Get rolling 4-week date range starting from current Monday
const getCalendarRange = () => {
  const startMonday = getMondayOfWeek(new Date());
  const endSunday = new Date(startMonday);
  endSunday.setDate(startMonday.getDate() + 27); // 4 weeks - 1 day
  endSunday.setHours(23, 59, 59, 999); // End of day
  return { start: startMonday, end: endSunday };
};

// Generate array of all dates in the 4-week range
const generateCalendarDates = (start: Date, end: Date) => {
  const dates = [];
  const current = new Date(start);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

// Calculate the number of days for each frequency type
const getFrequencyDays = (frequencyName: string | null): number | null => {
  if (!frequencyName) return null;
  
  const name = frequencyName.toLowerCase();
  if (name.includes('daily')) return 1;
  if (name.includes('weekly') && !name.includes('biweekly')) return 7;
  if (name.includes('biweekly')) return 14;
  if (name.includes('monthly')) return 30; // Approximate
  if (name.includes('twice a month')) return 15; // Approximate
  
  return null;
};

// Project recurring chore instances within the calendar range
const projectChoreInstances = (chore: any, start: Date, end: Date): Array<{ chore: any, projectedDate: Date }> => {
  const instances = [];
  
  if (!chore.next_due) return instances;
  
  const nextDueDate = new Date(chore.next_due);
  const frequencyDays = getFrequencyDays(chore.frequency_name);
  
  // If we don't know the frequency, just show the single next_due date if it's in range
  if (!frequencyDays) {
    if (nextDueDate >= start && nextDueDate <= end) {
      instances.push({ chore, projectedDate: new Date(nextDueDate) });
    }
    return instances;
  }
  
  // Find the first occurrence within our window
  let currentDate = new Date(nextDueDate);
  
  // If the next due date is after our window, work backwards to find earlier occurrences
  while (currentDate > end) {
    currentDate.setDate(currentDate.getDate() - frequencyDays);
  }
  
  // If the next due date is before our window, work forwards to find later occurrences
  while (currentDate < start) {
    currentDate.setDate(currentDate.getDate() + frequencyDays);
  }
  
  // Now project all occurrences within the window
  while (currentDate <= end) {
    if (currentDate >= start) {
      instances.push({ 
        chore, 
        projectedDate: new Date(currentDate) 
      });
    }
    currentDate.setDate(currentDate.getDate() + frequencyDays);
  }
  
  return instances;
};

// Group dates into weeks (7 days each)
const groupDatesByWeeks = (dates: Date[]) => {
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  return weeks;
};

export interface CalendarChore {
  id: number;
  title: string;
  next_due: string;
  status: string | null;
  assigned_to: number | null;
  category_name: string | null;
  category_icon: string | null;
  first_name: string | null;
  avatar: string | null;
  priority_boost: number | null;
  frequency_name: string | null;
}

export interface CalendarDayData {
  date: Date;
  isToday: boolean;
  isInCurrentMonth: boolean;
  chores: CalendarChore[];
}

export interface CalendarWeek {
  days: CalendarDayData[];
  weekNumber: number;
}

export function useCalendarData() {
  // Get the rolling 4-week range
  const { start, end } = useMemo(() => getCalendarRange(), []);
  
  // Fetch all chores and filter client-side for now
  // TODO: Optimize with server-side date filtering in future
  const { data: allChores = [], isLoading } = trpc.chores.getAll.useQuery({});
  
  // Project all chore instances within the 4-week range
  const projectedChoreInstances = useMemo(() => {
    console.log('Calendar date range:', { start, end });
    console.log('All chores with due dates:', allChores.filter(c => c.next_due).map(c => ({
      id: c.id,
      title: c.title,
      next_due: c.next_due,
      frequency_name: (c as any).frequency_name
    })));
    
    // Project all recurring instances for each chore
    const allInstances = [];
    for (const chore of allChores) {
      const instances = projectChoreInstances(chore, start, end);
      allInstances.push(...instances);
    }
    
    console.log('Projected chore instances:', allInstances.length);
    console.log('Sample projected instances:', allInstances.slice(0, 5).map(i => ({
      title: i.chore.title,
      originalDue: i.chore.next_due,
      projectedDate: i.projectedDate.toDateString(),
      frequency: i.chore.frequency_name
    })));
    
    return allInstances;
  }, [allChores, start, end]);

  // Process calendar data
  const calendarData = useMemo(() => {
    const dates = generateCalendarDates(start, end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Group projected chore instances by date
    const choresByDate = new Map<string, CalendarChore[]>();
    projectedChoreInstances.forEach((instance) => {
      const choreDate = new Date(instance.projectedDate);
      choreDate.setHours(0, 0, 0, 0);
      const dateKey = choreDate.toDateString();
      
      if (!choresByDate.has(dateKey)) {
        choresByDate.set(dateKey, []);
      }
      choresByDate.get(dateKey)!.push({
        id: instance.chore.id,
        title: instance.chore.title,
        next_due: instance.projectedDate.toISOString(), // Use projected date as the "due date" for this instance
        status: instance.chore.status,
        assigned_to: (instance.chore as any).assigned_to || null,
        category_name: instance.chore.category_name,
        category_icon: instance.chore.category_icon,
        first_name: instance.chore.first_name,
        avatar: instance.chore.avatar,
        priority_boost: instance.chore.priority_boost,
        frequency_name: (instance.chore as any).frequency_name || null,
      });
    });

    // Create calendar days
    const calendarDays: CalendarDayData[] = dates.map((date) => {
      const dateKey = date.toDateString();
      const dayChores = choresByDate.get(dateKey) || [];
      
      return {
        date: new Date(date),
        isToday: date.getTime() === today.getTime(),
        isInCurrentMonth: date.getMonth() === today.getMonth(),
        chores: dayChores,
      };
    });

    // Group into weeks - need to extract dates for grouping function
    const dayDates = calendarDays.map(day => day.date);
    const weekDateGroups = groupDatesByWeeks(dayDates);
    
    // Reconstruct weeks with calendar day objects
    const weeks = weekDateGroups.map((weekDates, index) => ({
      days: weekDates.map(date => {
        const dateKey = date.toDateString();
        return calendarDays.find(day => day.date.toDateString() === dateKey)!;
      }),
      weekNumber: index + 1,
    }));

    return {
      weeks,
      dateRange: {
        start: new Date(start),
        end: new Date(end),
      },
      totalChores: projectedChoreInstances.length,
    };
  }, [projectedChoreInstances, start, end]);

  // Format date range for display
  const dateRangeText = useMemo(() => {
    const startStr = start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${startStr} - ${endStr}`;
  }, [start, end]);

  return {
    ...calendarData,
    dateRangeText,
    isLoading,
  };
}