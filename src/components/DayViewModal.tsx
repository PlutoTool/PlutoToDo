import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Organize tasks hierarchically
  const { taskGroups, orphanedSubtasks } = useMemo(() => {
    const parentTasks = tasks.filter(task => !task.parent_id);
    const subtasks = tasks.filter(task => task.parent_id);
    
    // Create task groups with their subtasks
    const taskGroups = parentTasks.map(parent => {
      const parentSubtasks = subtasks.filter(subtask => subtask.parent_id === parent.id);
      const allSubtasks = tasks.filter(t => t.parent_id === parent.id);
      return {
        parent,
        subtasks: parentSubtasks,
        totalSubtasks: allSubtasks.length,
        completedSubtasks: allSubtasks.filter(t => t.completed).length
      };
    });

    // Include orphaned subtasks (subtasks whose parents are not on this date)
    const orphanedSubtasks = subtasks.filter(subtask => 
      !parentTasks.some(parent => parent.id === subtask.parent_id)
    );

    return { taskGroups, orphanedSubtasks };
  }, [tasks]);

  const toggleGroupCollapse = (parentId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

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
            {taskGroups.length > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                • {taskGroups.length} parent task{taskGroups.length !== 1 ? 's' : ''}
              </span>
            )}
            {orphanedSubtasks.length > 0 && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                • {orphanedSubtasks.length} subtask{orphanedSubtasks.length !== 1 ? 's' : ''} from other days
              </span>
            )}
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
          <div className="space-y-4">
            {/* Parent tasks with subtasks */}
            {taskGroups
              .sort((a, b) => {
                if (a.parent.completed !== b.parent.completed) {
                  return a.parent.completed ? 1 : -1;
                }
                const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                return (priorityOrder[b.parent.priority] || 0) - (priorityOrder[a.parent.priority] || 0);
              })
              .map((group) => {
                const isCollapsed = collapsedGroups.has(group.parent.id);
                const progressPercentage = group.totalSubtasks > 0 
                  ? Math.round((group.completedSubtasks / group.totalSubtasks) * 100) 
                  : 0;

                return (
                  <div key={group.parent.id} className="space-y-2">
                    {/* Parent Task */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-3">
                        {group.subtasks.length > 0 && (
                          <button
                            onClick={() => toggleGroupCollapse(group.parent.id)}
                            className="p-1 hover:bg-blue-200 dark:hover:bg-blue-700 rounded transition-colors"
                            title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Parent Task
                          </div>
                          {group.totalSubtasks > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 dark:bg-blue-400 rounded-full h-2 transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                {group.completedSubtasks}/{group.totalSubtasks} subtasks
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <TaskItem
                        task={group.parent}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onTaskClick={onTaskClick}
                        isSelected={selectedTasks.has(group.parent.id)}
                        onToggleSelect={onToggleTaskSelect}
                        isInsideModal={true}
                      />
                    </div>

                    {/* Subtasks */}
                    {group.subtasks.length > 0 && !isCollapsed && (
                      <div className="ml-6 space-y-2 relative">
                        {/* Connecting line */}
                        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
                        
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                          <div className="w-2 h-px bg-gray-300 dark:bg-gray-600" />
                          Subtasks ({group.subtasks.length})
                        </div>
                        
                        {group.subtasks
                          .sort((a, b) => {
                            if (a.completed !== b.completed) {
                              return a.completed ? 1 : -1;
                            }
                            const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                          })
                          .map((subtask) => (
                            <div key={subtask.id} className="relative">
                              {/* Horizontal connector */}
                              <div className="absolute -left-4 top-4 w-4 h-px bg-gray-300 dark:bg-gray-600" />
                              
                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <TaskItem
                                  task={subtask}
                                  onEdit={onEditTask}
                                  onDelete={onDeleteTask}
                                  onTaskClick={onTaskClick}
                                  isSelected={selectedTasks.has(subtask.id)}
                                  onToggleSelect={onToggleTaskSelect}
                                  isInsideModal={true}
                                />
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Orphaned subtasks */}
            {orphanedSubtasks.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300 border-t border-amber-200 dark:border-amber-800 pt-4">
                  Subtasks from other days ({orphanedSubtasks.length})
                </div>
                {orphanedSubtasks
                  .sort((a, b) => {
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1;
                    }
                    const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                  })
                  .map((task) => {
                    const parentTask = tasks.find(t => t.id === task.parent_id);
                    return (
                      <div key={task.id} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                        <div className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                          Subtask of "{parentTask?.title || 'Unknown Parent'}"
                        </div>
                        <TaskItem
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onTaskClick={onTaskClick}
                          isSelected={selectedTasks.has(task.id)}
                          onToggleSelect={onToggleTaskSelect}
                          isInsideModal={true}
                        />
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
