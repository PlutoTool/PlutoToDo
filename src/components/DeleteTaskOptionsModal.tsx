import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { AlertTriangle, Trash2, ArrowUp } from 'lucide-react';

interface DeleteTaskOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteWithSubtasks: () => void;
  onDeleteAndPromoteSubtasks: () => void;
  taskTitle: string;
  subtaskCount: number;
}

export const DeleteTaskOptionsModal: React.FC<DeleteTaskOptionsModalProps> = ({
  isOpen,
  onClose,
  onDeleteWithSubtasks,
  onDeleteAndPromoteSubtasks,
  taskTitle,
  subtaskCount,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task with Subtasks" size="md">
      <div className="p-6 space-y-6">
        {/* Warning Message */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Task has subtasks
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              The task "<strong>{taskTitle}</strong>" has {subtaskCount} subtask{subtaskCount !== 1 ? 's' : ''}. 
              What would you like to do?
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Delete All Option */}
          <div className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">
                  Delete task and all subtasks
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This will permanently delete the task and all its subtasks. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteWithSubtasks}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </div>
          </div>

          {/* Promote Subtasks Option */}
          <div className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-start gap-3">
              <ArrowUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">
                  Delete task and promote subtasks
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This will delete only the parent task and move all subtasks up one level in the hierarchy.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDeleteAndPromoteSubtasks}
                  className="w-full"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Promote Subtasks
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
