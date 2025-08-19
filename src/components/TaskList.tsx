import React, { useEffect, useState } from 'react';
import { TaskItem } from './TaskItem';
import { SubtaskItem } from './SubtaskItem';
import { TaskTable } from './TaskTable';
import { CalendarView } from './CalendarView';
import TaskDetailModal from './TaskDetailModal';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { Loader2, LayoutGrid, List, TreePine, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (id: string) => void;
}

type ViewMode = 'cards' | 'table' | 'hierarchy' | 'calendar';

export const TaskList: React.FC<TaskListProps> = ({ 
  onEditTask, 
  onDeleteTask, 
  onAddSubtask,
  selectedTasks = new Set(), 
  onToggleTaskSelect 
}) => {
  const { tasks, loading, error, loadTasks, filter, setViewMode } = useTaskStore();
  const [localViewMode, setLocalViewMode] = useState<ViewMode>('hierarchy');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, filter]); // React to filter changes

  // Set initial view mode in store
  useEffect(() => {
    setViewMode('hierarchical');
  }, []); // Run only once on mount

  // Get root tasks (tasks without parent_id)
  const rootTasks = tasks.filter(task => !task.parent_id);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSubtaskClick = (subtask: Task) => {
    // Close current modal and open subtask modal
    setSelectedTask(subtask);
    setIsModalOpen(true);
  };

  const handleParentClick = (parentTask: Task) => {
    // Navigate back to parent task
    setSelectedTask(parentTask);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {/* View Mode Toggle - Always show */}
        <div className="flex items-center justify-end">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={localViewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('cards')}
              className={cn(
                "h-8 px-3 text-xs",
                localViewMode === 'cards' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-muted"
              )}
            >
              <LayoutGrid className="w-3 h-3 mr-1" />
              Cards
            </Button>
            <Button
              variant={localViewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('table')}
              className={cn(
                "h-8 px-3 text-xs",
                localViewMode === 'table' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-muted"
              )}
            >
              <List className="w-3 h-3 mr-1" />
              Table
            </Button>
            <Button
              variant={localViewMode === 'hierarchy' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('hierarchy')}
              className={cn(
                "h-8 px-3 text-xs",
                localViewMode === 'hierarchy' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-muted"
              )}
            >
              <TreePine className="w-3 h-3 mr-1" />
              Hierarchy
            </Button>
            <Button
              variant={localViewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('calendar')}
              className={cn(
                "h-8 px-3 text-xs",
                localViewMode === 'calendar' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-muted"
              )}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Calendar
            </Button>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-destructive">Error loading tasks: {error}</p>
        </div>
      </div>
    );
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setLocalViewMode(mode);
    if (mode === 'hierarchy') {
      setViewMode('hierarchical');
    } else {
      setViewMode('flat');
    }
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle - Always show */}
      <div className="flex items-center justify-end">
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={localViewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('cards')}
            className={cn(
              "h-8 px-3 text-xs",
              localViewMode === 'cards' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <LayoutGrid className="w-3 h-3 mr-1" />
            Cards
          </Button>
          <Button
            variant={localViewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('table')}
            className={cn(
              "h-8 px-3 text-xs",
              localViewMode === 'table' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <List className="w-3 h-3 mr-1" />
            Table
          </Button>
          <Button
            variant={localViewMode === 'hierarchy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('hierarchy')}
            className={cn(
              "h-8 px-3 text-xs",
              localViewMode === 'hierarchy' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <TreePine className="w-3 h-3 mr-1" />
            Hierarchy
          </Button>
          <Button
            variant={localViewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewModeChange('calendar')}
            className={cn(
              "h-8 px-3 text-xs",
              localViewMode === 'calendar' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <Calendar className="w-3 h-3 mr-1" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Task Content */}
      {localViewMode === 'calendar' ? (
        <CalendarView 
          tasks={tasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onAddSubtask={(parentTask) => onAddSubtask?.(parentTask.id)}
          selectedTasks={selectedTasks}
          onToggleTaskSelect={onToggleTaskSelect}
        />
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No tasks yet. Create your first task!</p>
        </div>
      ) : localViewMode === 'hierarchy' ? (
        <div className="space-y-2">
          {rootTasks.map((task) => (
            <div key={task.id} className="group">
              <SubtaskItem 
                task={task} 
                depth={0}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onAddSubtask={onAddSubtask}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={onToggleTaskSelect}
                selectedTasks={selectedTasks}
                onTaskClick={handleTaskClick}
              />
            </div>
          ))}
        </div>
      ) : localViewMode === 'cards' ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="group">
              <TaskItem 
                task={task} 
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                isSelected={selectedTasks.has(task.id)}
                onToggleSelect={onToggleTaskSelect}
                onTaskClick={handleTaskClick}
              />
            </div>
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          selectedTasks={selectedTasks}
          onToggleTaskSelect={onToggleTaskSelect}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubtaskClick={handleSubtaskClick}
        onParentClick={handleParentClick}
      />
    </div>
  );
};
