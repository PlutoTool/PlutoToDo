import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'Today';
  } else if (isTomorrow(date)) {
    return 'Tomorrow';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d, yyyy');
  }
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  } else if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, 'h:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  } else {
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  }
}

export function isOverdue(dateString: string): boolean {
  const date = parseISO(dateString);
  const now = new Date();
  return date < now; // Simply check if the datetime has passed
}

export function getDaysUntilDue(dateString: string): number {
  const date = parseISO(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
