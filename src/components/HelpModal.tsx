import React from 'react';
import { Modal } from './ui/Modal';
import { Keyboard, Navigation, MousePointer, Filter, Edit3 } from 'lucide-react';
import { getShortcutText } from '../hooks/useKeyboardShortcuts';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const ShortcutSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    shortcuts: Array<{ keys: string; description: string }>;
  }> = ({ title, icon, shortcuts }) => (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-foreground ml-2">{title}</h3>
      </div>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground text-sm flex-1">
              {shortcut.description}
            </span>
            <div className="flex items-center space-x-1">
              {shortcut.keys.split(' + ').map((key, keyIndex) => (
                <React.Fragment key={keyIndex}>
                  {keyIndex > 0 && <span className="text-muted-foreground text-xs">+</span>}
                  <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded shadow-sm">
                    {getShortcutText(key)}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const navigationShortcuts = [
    { keys: 'Cmd/Ctrl + N', description: 'Create new task' },
    { keys: 'Cmd/Ctrl + F', description: 'Focus search bar' },
    { keys: 'Cmd/Ctrl + ,', description: 'Open preferences/settings' },
    { keys: 'Escape', description: 'Close modals/cancel actions' },
    { keys: 'Tab', description: 'Navigate between form fields' },
    { keys: 'Shift + Tab', description: 'Navigate backwards between form fields' },
  ];

  const taskManagementShortcuts = [
    { keys: 'Space', description: 'Toggle task completion (when task selected)' },
    { keys: 'Cmd/Ctrl + E', description: 'Edit selected task' },
    { keys: 'Cmd/Ctrl + D', description: 'Delete selected task (shows smart deletion options)' },
    { keys: 'Cmd/Ctrl + Shift + D', description: 'Bulk delete selected tasks' },
    { keys: 'Cmd/Ctrl + I', description: 'Open task detail modal (when task selected)' },
    { keys: 'Cmd/Ctrl + A', description: 'Select all tasks' },
    { keys: 'Cmd/Ctrl + Shift + A', description: 'Deselect all tasks' },
    { keys: 'Enter', description: 'Confirm/submit forms' },
  ];

  const mouseShortcuts = [
    { keys: 'Click Chevron', description: 'Expand/collapse subtasks' },
    { keys: 'Shift + Click', description: 'Bulk select range of tasks' },
    { keys: 'Click Outside', description: 'Close dropdowns and popovers' },
  ];

  const taskDetailModalShortcuts = [
    { keys: 'Escape', description: 'Close modal/cancel editing' },
    { keys: 'Cmd/Ctrl + E', description: 'Edit current task' },
    { keys: 'Cmd/Ctrl + S', description: 'Save changes (when editing)' },
    { keys: 'Cmd/Ctrl + Delete', description: 'Delete current task' },
    { keys: 'Cmd/Ctrl + N', description: 'Add new subtask' },
    { keys: 'Tab', description: 'Navigate between subtasks' },
    { keys: 'Enter', description: 'Navigate to selected subtask' },
  ];

  const sortingFilteringShortcuts = [
    { keys: 'Cmd/Ctrl + 1', description: 'Quick sort by Name' },
    { keys: 'Cmd/Ctrl + 2', description: 'Quick sort by Due Date' },
    { keys: 'Cmd/Ctrl + 3', description: 'Quick sort by Created Date' },
    { keys: 'Cmd/Ctrl + 4', description: 'Quick sort by Updated Date' },
    { keys: 'Cmd/Ctrl + 5', description: 'Quick sort by Priority' },
    { keys: 'Cmd/Ctrl + 6', description: 'Quick sort by Status' },
    { keys: 'Cmd/Ctrl + R', description: 'Reverse sort order' },
    { keys: 'Cmd/Ctrl + Shift + F', description: 'Open advanced filters' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts & Help"
      size="xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Keyboard className="w-6 h-6 text-blue-500 mr-2" />
            <p className="text-muted-foreground">
              Master Pluto: To-do with these powerful keyboard shortcuts
            </p>
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto">
          {/* Left Column */}
          <div>
            <ShortcutSection
              title="Navigation"
              icon={<Navigation className="w-5 h-5 text-blue-500" />}
              shortcuts={navigationShortcuts}
            />

            <ShortcutSection
              title="Task Management"
              icon={<Edit3 className="w-5 h-5 text-green-500" />}
              shortcuts={taskManagementShortcuts}
            />

            <ShortcutSection
              title="Mouse Actions"
              icon={<MousePointer className="w-5 h-5 text-purple-500" />}
              shortcuts={mouseShortcuts}
            />
          </div>

          {/* Right Column */}
          <div>
            <ShortcutSection
              title="Task Detail Modal"
              icon={<Edit3 className="w-5 h-5 text-orange-500" />}
              shortcuts={taskDetailModalShortcuts}
            />

            <ShortcutSection
              title="Sorting & Filtering"
              icon={<Filter className="w-5 h-5 text-cyan-500" />}
              shortcuts={sortingFilteringShortcuts}
            />
          </div>
        </div>

        {/* Footer Tips */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center">
              <Keyboard className="w-4 h-4 mr-1" />
              Pro Tips
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Shortcuts work globally except when typing in input fields</li>
              <li>• Use <kbd className="px-1 py-0.5 text-xs bg-background border rounded">Shift + Click</kbd> to select multiple tasks in a range</li>
              <li>• Modal-specific shortcuts are available when modals are open</li>
              <li>• Quick sort shortcuts (1-6) cycle between ascending and descending order</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
};