import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Check, Tag, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Task as TaskType } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { getPriorityColor } from '../utils/priorityUtils';
import { cn } from '../utils/cn';

interface TaskItemProps {
  task: TaskType;
  onEdit?: (task: TaskType) => void;
  onDelete?: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);

  const handleToggleCompletion = async () => {
    try {
      await toggleTaskCompletion(task.id);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const isTaskOverdue = task.due_date && !task.completed && isOverdue(task.due_date);

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      task.completed && 'opacity-70 bg-muted/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleCompletion}
            className="mt-1 flex-shrink-0 w-4 h-4 rounded border-2 border-primary/30 hover:border-primary transition-colors flex items-center justify-center"
          >
            {task.completed && <Check className="w-3 h-3 text-primary" />}
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
                      onDelete(task.id);
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
              <p className={cn(
                'text-sm text-muted-foreground mt-1 line-clamp-2',
                task.completed && 'line-through'
              )}>
                {task.description}
              </p>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {/* Priority */}
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                getPriorityColor(task.priority)
              )}>
                {task.priority}
              </div>

              {/* Due date */}
              {task.due_date && (
                <div className={cn(
                  'inline-flex items-center gap-1',
                  isTaskOverdue && 'text-destructive'
                )}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              )}

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{task.tags.slice(0, 2).join(', ')}</span>
                  {task.tags.length > 2 && <span>+{task.tags.length - 2}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
