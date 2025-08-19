import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface BulkDeleteOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAll: () => void;
  onPromoteSubtasks: () => void;
  totalTasks: number;
  tasksWithSubtasks: number;
}

export const BulkDeleteOptionsModal: React.FC<BulkDeleteOptionsModalProps> = ({
  isOpen,
  onClose,
  onDeleteAll,
  onPromoteSubtasks,
  totalTasks,
  tasksWithSubtasks,
}) => {
  const tasksWithoutSubtasks = totalTasks - tasksWithSubtasks;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Delete Options">
      <div className="p-6 space-y-6">
        {/* Warning message */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              Some tasks have subtasks
            </h3>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <p>You have selected <strong>{totalTasks}</strong> task{totalTasks > 1 ? 's' : ''} for deletion:</p>
              <ul className="ml-4 space-y-1">
                <li>• <strong>{tasksWithSubtasks}</strong> task{tasksWithSubtasks > 1 ? 's' : ''} with subtasks</li>
                {tasksWithoutSubtasks > 0 && (
                  <li>• <strong>{tasksWithoutSubtasks}</strong> task{tasksWithoutSubtasks > 1 ? 's' : ''} without subtasks</li>
                )}
              </ul>
              <p className="mt-2">How would you like to handle the tasks with subtasks?</p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Button
            onClick={onDeleteAll}
            variant="destructive"
            className="w-full justify-start h-auto p-4 bg-red-600 hover:bg-red-700 text-white whitespace-normal"
          >
            <div className="flex items-start gap-3 w-full">
              <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold leading-tight">Delete All Tasks and Their Subtasks</div>
                <div className="text-sm text-red-100 mt-1 leading-relaxed break-words">
                  This will permanently delete all {totalTasks} selected task{totalTasks > 1 ? 's' : ''} and any subtasks they contain.
                  This action cannot be undone.
                </div>
              </div>
            </div>
          </Button>

          <Button
            onClick={onPromoteSubtasks}
            variant="outline"
            className="w-full justify-start h-auto p-4 border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20 whitespace-normal"
          >
            <div className="flex items-start gap-3 w-full">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg 
                  className="w-4 h-4 text-blue-600 dark:text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-semibold text-blue-700 dark:text-blue-300 leading-tight">
                  Delete Tasks but Promote Their Subtasks
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 leading-relaxed break-words">
                  This will delete the {totalTasks} selected task{totalTasks > 1 ? 's' : ''} but keep their subtasks, 
                  promoting them to the same level as the deleted task{totalTasks > 1 ? 's' : ''}.
                </div>
              </div>
            </div>
          </Button>
        </div>

        {/* Cancel button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="px-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
