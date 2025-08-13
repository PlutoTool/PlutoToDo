import React, { useEffect, useState } from 'react';
import { TaskItem } from './TaskItem';
import { TaskTable } from './TaskTable';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (id: string) => void;
}

type ViewMode = 'cards' | 'table';

export const TaskList: React.FC<TaskListProps> = ({ 
  onEditTask, 
  onDeleteTask, 
  selectedTasks = new Set(), 
  onToggleTaskSelect 
}) => {
  const { tasks, loading, error, loadTasks, filter } = useTaskStore();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  useEffect(() => {
    loadTasks();
  }, [loadTasks, filter]); // React to filter changes

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

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className={cn(
              "h-8 px-3 text-xs",
              viewMode === 'cards' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <LayoutGrid className="w-3 h-3 mr-1" />
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={cn(
              "h-8 px-3 text-xs",
              viewMode === 'table' 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-muted"
            )}
          >
            <List className="w-3 h-3 mr-1" />
            Table
          </Button>
        </div>
      </div>

      {/* Task Content */}
      {viewMode === 'cards' ? (
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
