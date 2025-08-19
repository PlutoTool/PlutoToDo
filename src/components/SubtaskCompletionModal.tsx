import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SubtaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (markAllDone: boolean) => void;
  taskTitle: string;
  incompleteCount: number;
  incompleteSubtasks: Array<{ id: string; title: string; depth: number }>;
  zIndex?: string;
  showBackdrop?: boolean;
}

export const SubtaskCompletionModal: React.FC<SubtaskCompletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
  incompleteCount,
  incompleteSubtasks,
  zIndex = 'z-50',
  showBackdrop = true,
}) => {
  const handleMarkParentOnly = () => {
    onConfirm(false);
    onClose();
  };

  const handleMarkAllDone = () => {
    onConfirm(true);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Task with Subtasks" zIndex={zIndex} showBackdrop={showBackdrop}>
      <div className="p-6 space-y-4">
        {/* Warning message */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Incomplete Subtasks Found
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              The task "<strong>{taskTitle}</strong>" has {incompleteCount} incomplete subtask{incompleteCount > 1 ? 's' : ''}.
            </p>
          </div>
        </div>

        {/* List of incomplete subtasks */}
        <div className="max-h-48 overflow-y-auto">
          <h5 className="text-sm font-medium text-muted-foreground mb-2">
            Incomplete subtasks:
          </h5>
          <ul className="space-y-1">
            {incompleteSubtasks.slice(0, 10).map((subtask) => (
              <li key={subtask.id} className="flex items-center gap-2 text-sm">
                <div 
                  className="flex-shrink-0 w-2 h-2 bg-muted-foreground/30 rounded-full"
                  style={{ marginLeft: `${subtask.depth * 12}px` }}
                />
                <span className="truncate">{subtask.title}</span>
              </li>
            ))}
            {incompleteSubtasks.length > 10 && (
              <li className="text-sm text-muted-foreground italic">
                ... and {incompleteSubtasks.length - 10} more
              </li>
            )}
          </ul>
        </div>

        {/* Action question */}
        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-4">
            What would you like to do?
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleMarkAllDone}
            className="w-full justify-start gap-2"
            variant="default"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all subtasks as done and complete parent task
          </Button>
          
          <Button
            onClick={handleMarkParentOnly}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Only mark parent task as done
          </Button>
          
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
