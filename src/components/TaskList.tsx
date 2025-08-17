import React, { useEffect, useState } from 'react';
import { TaskItem } from './TaskItem';
import { SubtaskItem } from './SubtaskItem';
import { TaskTable } from './TaskTable';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { Loader2, LayoutGrid, List, TreePine } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  onAddSubtask?: (parentId: string) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (id: string) => void;
}

type ViewMode = 'cards' | 'table' | 'hierarchy';

export const TaskList: React.FC<TaskListProps> = ({ 
  onEditTask, 
  onDeleteTask, 
  onAddSubtask,
  selectedTasks = new Set(), 
  onToggleTaskSelect 
}) => {
  const { tasks, loading, error, loadTasks, filter, setViewMode } = useTaskStore();
  const [localViewMode, setLocalViewMode] = useState<ViewMode>('cards');

  useEffect(() => {
    loadTasks();
  }, [loadTasks, filter]); // React to filter changes

  // Get root tasks (tasks without parent_id)
  const rootTasks = tasks.filter(task => !task.parent_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive">Error loading tasks: {error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No tasks yet. Create your first task!</p>
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
      {/* View Mode Toggle */}
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
        </div>
      </div>

      {/* Task Content */}
      {localViewMode === 'hierarchy' ? (
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
        />
      )}
    </div>
  );
};
