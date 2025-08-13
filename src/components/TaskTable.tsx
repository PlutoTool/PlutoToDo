import React from 'react';
import { Task } from '../types';
import { Button } from './ui/Button';
import { Check, Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { formatDateTime, isOverdue } from '../utils/dateUtils';
import { getPriorityColor } from '../utils/priorityUtils';
import { cn } from '../utils/cn';

interface TaskTableProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (id: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ 
  tasks,
  onEditTask, 
  onDeleteTask, 
  selectedTasks = new Set(), 
  onToggleTaskSelect 
}) => {
  const toggleTaskCompletion = useTaskStore(state => state.toggleTaskCompletion);

  const handleToggleCompletion = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleSelectToggle = (taskId: string) => {
    if (onToggleTaskSelect) {
      onToggleTaskSelect(taskId);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No tasks yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-10 p-3 text-left">
                <span className="sr-only">Select</span>
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                Task
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground min-w-[120px]">
                Due Date & Time
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                Priority
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                Tags
              </th>
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
              <th className="w-24 p-3 text-left text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tasks.map((task) => {
              const isTaskOverdue = task.due_date && !task.completed && isOverdue(task.due_date);
              const isSelected = selectedTasks.has(task.id);
              
              return (
                <tr 
                  key={task.id} 
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    task.completed && 'opacity-70',
                    isSelected && 'bg-primary/5 border-primary/20'
                  )}
                >
                  {/* Selection Checkbox */}
                  <td className="p-3">
                    <button
                      onClick={() => handleSelectToggle(task.id)}
                      className={cn(
                        "w-4 h-4 rounded border-2 transition-colors flex items-center justify-center",
                        isSelected 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-muted-foreground/30 hover:border-primary"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  </td>

                  {/* Task Title & Description */}
                  <td className="p-3">
                    <div className="space-y-1">
                      <h3 className={cn(
                        'font-medium text-sm',
                        task.completed && 'line-through text-muted-foreground'
                      )}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={cn(
                          'text-xs text-muted-foreground truncate max-w-xs',
                          task.completed && 'line-through'
                        )}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Due Date Column */}
                  <td className="p-3">
                    {task.due_date ? (
                      <div className={cn(
                        'inline-flex items-center gap-1 text-sm',
                        isTaskOverdue 
                          ? 'text-destructive font-medium' 
                          : task.completed 
                          ? 'text-muted-foreground line-through' 
                          : 'text-foreground'
                      )}>
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{formatDateTime(task.due_date)}</span>
                        {isTaskOverdue && (
                          <span className="text-xs bg-destructive/10 text-destructive px-1 py-0.5 rounded ml-1">
                            Overdue
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No due date
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="p-3">
                    <div className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="p-3">
                    {task.tags.length > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-24">
                          {task.tags.slice(0, 2).join(', ')}
                          {task.tags.length > 2 && ` +${task.tags.length - 2}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <Button
                      variant={task.completed ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleCompletion(task.id)}
                      className={cn(
                        "h-7 px-3 text-xs",
                        task.completed 
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                          : "border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                      )}
                    >
                      {task.completed ? 'Done' : 'Mark Done'}
                    </Button>
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {onEditTask && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditTask(task)}
                          className="h-7 w-7 opacity-70 hover:opacity-100"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                      {onDeleteTask && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTask(task.id)}
                          className="h-7 w-7 opacity-70 hover:opacity-100 hover:bg-destructive/10 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
