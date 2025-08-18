import { useEffect, useCallback } from 'react';

interface KeyboardShortcutCallbacks {
  // Navigation
  onCreateTask?: () => void;
  onFocusSearch?: () => void;
  onOpenPreferences?: () => void;
  
  // Task Management
  onToggleTaskCompletion?: () => void;
  onEditSelectedTask?: () => void;
  onDeleteSelectedTask?: () => void;
  onBulkDeleteSelectedTasks?: () => void;
  onOpenTaskDetail?: () => void;
  onSelectAllTasks?: () => void;
  onDeselectAllTasks?: () => void;
  
  // Task Detail Modal (when modal is open)
  onEditCurrentTask?: () => void;
  onSaveChanges?: () => void;
  onDeleteCurrentTask?: () => void;
  onAddNewSubtask?: () => void;
  
  // Sorting & Filtering
  onQuickSort?: (sortIndex: number) => void; // 1-6 for different sort fields
  onReverseSortOrder?: () => void;
  onOpenAdvancedFilters?: () => void;
}

interface UseKeyboardShortcutsOptions {
  callbacks: KeyboardShortcutCallbacks;
  enabled?: boolean;
  isModalOpen?: boolean;
  isFormOpen?: boolean;
}

export const useKeyboardShortcuts = ({ 
  callbacks, 
  enabled = true, 
  isModalOpen = false,
  isFormOpen = false 
}: UseKeyboardShortcutsOptions) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if typing in input fields (unless specifically intended)
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement || 
        event.target instanceof HTMLSelectElement) {
      // Allow certain shortcuts even in input fields
      if (event.key === 'Escape' || 
          (event.key === 'Enter' && !event.shiftKey) ||
          (event.key === 'Tab')) {
        // These are handled by the form components themselves
        return;
      }
      // Block other shortcuts when typing
      return;
    }

    if (!enabled) return;

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

    // Handle shortcuts based on context
    if (isModalOpen) {
      handleModalShortcuts(event, cmdOrCtrl, callbacks);
    } else if (isFormOpen) {
      handleFormShortcuts(event, cmdOrCtrl, callbacks);
    } else {
      handleGlobalShortcuts(event, cmdOrCtrl, callbacks);
    }
  }, [callbacks, enabled, isModalOpen, isFormOpen]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
};

const handleGlobalShortcuts = (
  event: KeyboardEvent, 
  cmdOrCtrl: boolean, 
  callbacks: KeyboardShortcutCallbacks
) => {
  // Navigation shortcuts
  if (cmdOrCtrl && event.key === 'n' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onCreateTask?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'f' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onFocusSearch?.();
    return;
  }

  if (cmdOrCtrl && event.key === ',') {
    event.preventDefault();
    callbacks.onOpenPreferences?.();
    return;
  }

  // Task Management shortcuts
  if (event.key === ' ' && !cmdOrCtrl && !event.shiftKey) {
    event.preventDefault();
    callbacks.onToggleTaskCompletion?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'e' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onEditSelectedTask?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'd' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onDeleteSelectedTask?.();
    return;
  }

  if (cmdOrCtrl && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    callbacks.onBulkDeleteSelectedTasks?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'i' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onOpenTaskDetail?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'a' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onSelectAllTasks?.();
    return;
  }

  if (cmdOrCtrl && event.shiftKey && event.key === 'A') {
    event.preventDefault();
    callbacks.onDeselectAllTasks?.();
    return;
  }

  // Sorting & Filtering shortcuts
  if (cmdOrCtrl && event.key === 'r' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onReverseSortOrder?.();
    return;
  }

  if (cmdOrCtrl && event.shiftKey && event.key === 'F') {
    event.preventDefault();
    callbacks.onOpenAdvancedFilters?.();
    return;
  }

  // Quick sort shortcuts (Cmd/Ctrl + 1-6)
  if (cmdOrCtrl && event.key >= '1' && event.key <= '6' && !event.shiftKey) {
    event.preventDefault();
    const sortIndex = parseInt(event.key, 10);
    callbacks.onQuickSort?.(sortIndex);
    return;
  }
};

const handleModalShortcuts = (
  event: KeyboardEvent, 
  cmdOrCtrl: boolean, 
  callbacks: KeyboardShortcutCallbacks
) => {
  // Modal-specific shortcuts
  if (cmdOrCtrl && event.key === 'e' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onEditCurrentTask?.();
    return;
  }

  if (cmdOrCtrl && event.key === 's' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onSaveChanges?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'Delete') {
    event.preventDefault();
    callbacks.onDeleteCurrentTask?.();
    return;
  }

  if (cmdOrCtrl && event.key === 'n' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onAddNewSubtask?.();
    return;
  }
};

const handleFormShortcuts = (
  event: KeyboardEvent, 
  cmdOrCtrl: boolean, 
  callbacks: KeyboardShortcutCallbacks
) => {
  // Form-specific shortcuts
  if (cmdOrCtrl && event.key === 's' && !event.shiftKey) {
    event.preventDefault();
    callbacks.onSaveChanges?.();
    return;
  }
};

// Utility function to get platform-specific shortcut display text
export const getShortcutText = (shortcut: string): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return shortcut.replace('Cmd/Ctrl', isMac ? 'Cmd' : 'Ctrl');
};

// Export shortcut definitions for documentation/help
export const KEYBOARD_SHORTCUTS = {
  navigation: {
    createTask: 'Cmd/Ctrl + N',
    focusSearch: 'Cmd/Ctrl + F',
    openPreferences: 'Cmd/Ctrl + ,',
    closeModal: 'Escape',
    navigateFields: 'Tab',
    navigateBackwards: 'Shift + Tab'
  },
  taskManagement: {
    toggleCompletion: 'Space',
    editTask: 'Cmd/Ctrl + E',
    deleteTask: 'Cmd/Ctrl + D',
    bulkDelete: 'Cmd/Ctrl + Shift + D',
    openDetail: 'Cmd/Ctrl + I',
    selectAll: 'Cmd/Ctrl + A',
    deselectAll: 'Cmd/Ctrl + Shift + A',
    submitForm: 'Enter'
  },
  taskDetailModal: {
    closeModal: 'Escape',
    editTask: 'Cmd/Ctrl + E',
    saveChanges: 'Cmd/Ctrl + S',
    deleteTask: 'Cmd/Ctrl + Delete',
    addSubtask: 'Cmd/Ctrl + N',
    navigateSubtasks: 'Tab',
    selectSubtask: 'Enter'
  },
  sortingFiltering: {
    quickSort1: 'Cmd/Ctrl + 1',
    quickSort2: 'Cmd/Ctrl + 2',
    quickSort3: 'Cmd/Ctrl + 3',
    quickSort4: 'Cmd/Ctrl + 4',
    quickSort5: 'Cmd/Ctrl + 5',
    quickSort6: 'Cmd/Ctrl + 6',
    reverseSort: 'Cmd/Ctrl + R',
    advancedFilters: 'Cmd/Ctrl + Shift + F'
  }
};
