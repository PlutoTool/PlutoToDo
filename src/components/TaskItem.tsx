import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Check, Tag, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Task as TaskType } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { SubtaskCompletionModal } from './SubtaskCompletionModal';
import { DeleteTaskOptionsModal } from './DeleteTaskOptionsModal';
import { formatDateTime, isOverdue } from '../utils/dateUtils';
import { getPriorityColor } from '../utils/priorityUtils';
import { cn } from '../utils/cn';

interface TaskItemProps {
  task: TaskType;
  onEdit?: (task: TaskType) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onTaskClick?: (task: TaskType) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  isSelected = false, 
  onToggleSelect,
  onTaskClick 
}) => {
  const { 
    toggleTaskCompletion, 
    toggleTaskCompletionWithSubtasks,
    getIncompleteSubtasks,
    deleteTaskWithSubtasks,
    deleteTaskAndPromoteSubtasks,
    checkTaskHasSubtasks,
    tasks: allTasks 
  } = useTaskStore();

  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [incompleteSubtasks, setIncompleteSubtasks] = useState<TaskType[]>([]);
  const [deleteTaskOptions, setDeleteTaskOptions] = useState<{ 
    isOpen: boolean; 
    taskId: string | null;
    taskTitle: string;
    subtaskCount: number;
  }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
    subtaskCount: 0
  });

  const handleToggleCompletion = async () => {
    try {
      // Check if this task is being marked as complete and has incomplete subtasks
      if (!task.completed) {
        const hasSubtasks = allTasks.some(t => t.parent_id === task.id);
        if (hasSubtasks) {
          const incomplete = await getIncompleteSubtasks(task.id);
          if (incomplete.length > 0) {
            // Show the modal to ask user what to do
            setIncompleteSubtasks(incomplete);
            setShowSubtaskModal(true);
            return; // Don't complete the task yet
          }
        }
      }
      
      // If no incomplete subtasks or task is being marked as incomplete, proceed normally
      await toggleTaskCompletion(task.id);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleSubtaskModalConfirm = async (markAllDone: boolean) => {
    try {
      if (markAllDone) {
        // Use the new method to mark all subtasks done and then complete parent
        await toggleTaskCompletionWithSubtasks(task.id, true);
      } else {
        // Just mark the parent task as done, leave subtasks unchanged
        await toggleTaskCompletion(task.id);
      }
    } catch (error) {
      console.error('Failed to complete task with subtasks:', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      // Check if task has subtasks
      const hasSubtasks = await checkTaskHasSubtasks(task.id);
      
      if (hasSubtasks) {
        // Count direct subtasks for display
        const directSubtasks = allTasks.filter(t => t.parent_id === task.id);
        setDeleteTaskOptions({ 
          isOpen: true, 
          taskId: task.id,
          taskTitle: task.title,
          subtaskCount: directSubtasks.length
        });
      } else {
        // Use the parent's delete handler if no subtasks
        if (onDelete) {
          onDelete(task.id);
        }
      }
    } catch (error) {
      console.error('Failed to check subtasks:', error);
      // Fallback to parent's delete handler
      if (onDelete) {
        onDelete(task.id);
      }
    }
  };

  const handleDeleteWithSubtasks = async () => {
    if (deleteTaskOptions.taskId) {
      try {
        await deleteTaskWithSubtasks(deleteTaskOptions.taskId);
      } catch (error) {
        console.error('Failed to delete task with subtasks:', error);
      }
    }
    setDeleteTaskOptions({ isOpen: false, taskId: null, taskTitle: '', subtaskCount: 0 });
  };

  const handleDeleteAndPromoteSubtasks = async () => {
    if (deleteTaskOptions.taskId) {
      try {
        await deleteTaskAndPromoteSubtasks(deleteTaskOptions.taskId);
      } catch (error) {
        console.error('Failed to delete task and promote subtasks:', error);
      }
    }
    setDeleteTaskOptions({ isOpen: false, taskId: null, taskTitle: '', subtaskCount: 0 });
  };

  const handleSelectToggle = () => {
    if (onToggleSelect) {
      onToggleSelect(task.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons or checkboxes
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest('button') || target.closest('input');
    
    if (!isInteractiveElement && onTaskClick) {
      onTaskClick(task);
    }
  };

  const isTaskOverdue = task.due_date && !task.completed && isOverdue(task.due_date);

  return (
    <>
      <Card 
        className={cn(
          'transition-all duration-200 hover:shadow-md cursor-pointer',
          task.completed && 'opacity-70 bg-muted/50'
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Bulk Selection Checkbox */}
            <button
              onClick={handleSelectToggle}
              className={cn(
                "mt-1 flex-shrink-0 w-4 h-4 rounded border-2 transition-colors flex items-center justify-center",
                isSelected 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-muted-foreground/30 hover:border-primary"
              )}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </button>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  'text-sm font-medium leading-5',
                  task.completed && 'line-through text-muted-foreground'
                )}>
                  {task.title}
                </h3>
                
                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1">
                  {/* Completed Button */}
                  <Button
                    variant={task.completed ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleCompletion}
                    className={cn(
                      "h-7 px-2 text-xs",
                      task.completed 
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                        : "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                    )}
                  >
                    {task.completed ? 'Completed' : 'Mark Done'}
                  </Button>
                  
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-muted transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        console.log('Delete button clicked for task:', task.id);
                        handleDeleteTask();
                      }}
                      className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-destructive/10 transition-all text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div className={cn(
                  'text-sm text-muted-foreground mt-1',
                  task.completed && 'line-through'
                )}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {task.description}
                </div>
              )}

              {/* Meta information - restructured with due date prominence */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                <div className="flex items-center gap-3 text-xs">
                  {/* Priority */}
                  <div className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </div>

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      <span>{task.tags.slice(0, 2).join(', ')}</span>
                      {task.tags.length > 2 && <span>+{task.tags.length - 2}</span>}
                    </div>
                  )}
                </div>

                {/* Due Date Column - More prominent display */}
                <div className="flex flex-col items-end text-right">
                  {task.due_date ? (
                    <>
                      <div className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        isTaskOverdue ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        <Calendar className="w-3 h-3" />
                        <span>Due Date & Time</span>
                      </div>
                      <div className={cn(
                        'text-sm font-semibold mt-0.5',
                        isTaskOverdue 
                          ? 'text-destructive' 
                          : task.completed 
                          ? 'text-muted-foreground line-through' 
                          : 'text-foreground'
                      )}>
                        {formatDateTime(task.due_date)}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      No due date
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtask Completion Modal */}
      <SubtaskCompletionModal
        isOpen={showSubtaskModal}
        onClose={() => setShowSubtaskModal(false)}
        onConfirm={handleSubtaskModalConfirm}
        taskTitle={task.title}
        incompleteCount={incompleteSubtasks.length}
        incompleteSubtasks={incompleteSubtasks.map((subtask, index) => ({
          id: subtask.id,
          title: subtask.title,
          depth: index // This could be calculated better with actual depth
        }))}
      />

      {/* Delete Task Options Modal for tasks with subtasks */}
      <DeleteTaskOptionsModal
        isOpen={deleteTaskOptions.isOpen}
        onClose={() => setDeleteTaskOptions({ isOpen: false, taskId: null, taskTitle: '', subtaskCount: 0 })}
        onDeleteWithSubtasks={handleDeleteWithSubtasks}
        onDeleteAndPromoteSubtasks={handleDeleteAndPromoteSubtasks}
        taskTitle={deleteTaskOptions.taskTitle}
        subtaskCount={deleteTaskOptions.subtaskCount}
      />
    </>
  );
};
