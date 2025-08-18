import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Check, Tag, Calendar, Edit2, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Task as TaskType, TaskProgress } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { SubtaskCompletionModal } from './SubtaskCompletionModal';
import { formatDateTime, isOverdue } from '../utils/dateUtils';
import { getPriorityColor } from '../utils/priorityUtils';
import { cn } from '../utils/cn';

interface SubtaskItemProps {
  task: TaskType;
  depth?: number;
  onEdit?: (task: TaskType) => void;
  onDelete?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  selectedTasks?: Set<string>; // Add this to track all selected tasks
  onTaskClick?: (task: TaskType) => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({ 
  task, 
  depth = 0,
  onEdit, 
  onDelete, 
  onAddSubtask,
  isSelected = false, 
  onToggleSelect,
  selectedTasks, // Add this prop
  onTaskClick
}) => {
  const { 
    toggleTaskCompletion, 
    toggleTaskCompletionWithSubtasks,
    getIncompleteSubtasks,
    expandedTasks, 
    toggleTaskExpansion, 
    calculateTaskProgress,
    tasks // Get all tasks from store to find subtasks
  } = useTaskStore();
  
  const [progress, setProgress] = useState<TaskProgress | null>(null);
  const [loadingSubtasks] = useState(false); // Keep for loading state display
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [incompleteSubtasks, setIncompleteSubtasks] = useState<TaskType[]>([]);

  const isExpanded = expandedTasks.has(task.id);
  
  // Get subtasks from the main task store instead of local state
  const subtasks = tasks.filter(t => t.parent_id === task.id);
  
  // Check if this task has subtasks - either from progress data or from direct count
  const hasSubtasks = (progress?.has_subtasks || subtasks.length > 0);

  // Load progress data
  useEffect(() => {
    loadProgressData();
  }, [task.id]);

  // Reload progress when subtasks change - but only for tasks that have subtasks
  useEffect(() => {
    // Only recalculate if this task might have subtasks
    if (subtasks.length > 0) {
      console.log(`Recalculating progress for task ${task.id} due to subtask changes`);
      loadProgressData();
    }
  }, [subtasks.map(t => `${t.id}-${t.completed}`).join(',')]); // Only react to subtask completion changes

  // Debug: Log when task completion status changes
  useEffect(() => {
    console.log(`Task ${task.id} completion status:`, task.completed);
    console.log(`Task ${task.id} progress:`, progress);
  }, [task.completed, task.id, progress]);

  const loadProgressData = async () => {
    try {
      console.log(`Loading progress for task ${task.id}`);
      const progressData = await calculateTaskProgress(task.id);
      console.log(`Progress data for task ${task.id}:`, progressData);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleToggleCompletion = async () => {
    try {
      // Check if this task is being marked as complete and has incomplete subtasks
      if (!task.completed && hasSubtasks) {
        const incomplete = await getIncompleteSubtasks(task.id);
        if (incomplete.length > 0) {
          // Show the modal to ask user what to do
          setIncompleteSubtasks(incomplete);
          setShowSubtaskModal(true);
          return; // Don't complete the task yet
        }
      }
      
      // If no incomplete subtasks or task is being marked as incomplete, proceed normally
      await toggleTaskCompletion(task.id);
      console.log('Task completion toggled for task:', task.id);
      
      // Reload progress data for this task
      await loadProgressData();
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
      
      // Reload progress data
      await loadProgressData();
    } catch (error) {
      console.error('Failed to complete task with subtasks:', error);
    }
  };

  const handleToggleExpansion = () => {
    toggleTaskExpansion(task.id);
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
      <div className={cn('transition-all duration-200', depth > 0 && 'ml-6')}>
        <Card 
          className={cn(
            'transition-all duration-200 hover:shadow-md cursor-pointer',
            task.completed && 'opacity-70 bg-muted/50',
            depth > 0 && 'border-l-4 border-l-primary/20'
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
                title={isSelected ? "Unselect task" : "Select task"}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </button>

              {/* Expand/Collapse button for tasks with subtasks */}
              <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                {hasSubtasks && (
                  <button
                    onClick={handleToggleExpansion}
                    className="w-5 h-5 hover:bg-muted rounded transition-colors flex items-center justify-center"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className={cn(
                      'text-sm font-medium leading-5',
                      task.completed && 'line-through text-muted-foreground'
                    )}>
                      {task.title}
                    </h3>
                    
                    {/* Progress indicator for parent tasks */}
                    {hasSubtasks && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {progress ? `${progress.completed_subtasks}/${progress.total_subtasks}` : `0/${subtasks.length}`} subtasks completed
                          </span>
                          <div className="flex-1 bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary rounded-full h-1.5 transition-all duration-300"
                              style={{ 
                                width: `${progress ? progress.progress_percentage : 0}%` 
                              }}
                            />
                          </div>
                          <span>{progress ? Math.round(progress.progress_percentage) : 0}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {/* Add Subtask Button */}
                    {onAddSubtask && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAddSubtask(task.id)}
                        className="h-8 w-8 opacity-70 hover:opacity-100 hover:bg-muted transition-all"
                        title="Add subtask"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                    
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
                        onClick={() => onDelete(task.id)}
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

                  {/* Due Date */}
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

        {/* Render subtasks when expanded */}
        {isExpanded && hasSubtasks && (
          <div className="mt-2 space-y-2">
            {loadingSubtasks ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Loading subtasks...
              </div>
            ) : (
              subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  task={subtask}
                  depth={depth + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddSubtask={onAddSubtask}
                  isSelected={selectedTasks?.has(subtask.id) || false}
                  onToggleSelect={onToggleSelect}
                  selectedTasks={selectedTasks}
                  onTaskClick={onTaskClick}
                />
              ))
            )}
          </div>
        )}
      </div>

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
    </>
  );
};
