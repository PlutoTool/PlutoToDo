import { Priority } from '../types';

export function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.High:
      return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800';
    case Priority.Medium:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800';
    case Priority.Low:
      return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800';
  }
}

export function getPriorityIcon(priority: Priority): string {
  switch (priority) {
    case Priority.High:
      return '🔴';
    case Priority.Medium:
      return '🟡';
    case Priority.Low:
      return '🟢';
    default:
      return '⚪';
  }
}
