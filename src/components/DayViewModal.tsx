import React from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Task, Priority } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { TaskItem } from './TaskItem';

interface DayViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
  onCreateTask?: (date: Date, fromDayView?: boolean) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (taskId: string) => void;
}

export const DayViewModal: React.FC<DayViewModalProps> = ({
  isOpen,
  onClose,
  date,
  tasks,
  onEditTask,
  onDeleteTask,
  onTaskClick,
  onCreateTask,
  selectedTasks = new Set(),
  onToggleTaskSelect
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tasks for ${format(date, 'EEEE, MMMM d, yyyy')}`}
      size="lg"
    >
      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} scheduled for this day
          </div>
          
          {onCreateTask && (
            <Button
              size="sm"
              onClick={() => {
                onCreateTask(date, true);
                // Don't close the modal - let the parent handle this
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          )}
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-lg mb-2">No tasks scheduled</div>
            <div className="text-sm">This day is free of scheduled tasks</div>
            {onCreateTask && (
              <Button
                onClick={() => {
                  onCreateTask(date, true);
                  // Don't close the modal - let the parent handle this
                }}
                className="mt-4 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks
              .sort((a, b) => {
                // Sort by completion status first, then by priority
                if (a.completed !== b.completed) {
                  return a.completed ? 1 : -1;
                }
                const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
              })
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onTaskClick={onTaskClick}
                  isSelected={selectedTasks.has(task.id)}
                  onToggleSelect={onToggleTaskSelect}
                />
              ))
            }
          </div>
        )}
      </div>
    </Modal>
  );
};
