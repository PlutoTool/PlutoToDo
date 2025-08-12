import React, { useEffect, useState } from 'react';
import { TaskItem } from './TaskItem';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { Loader2 } from 'lucide-react';

interface TaskListProps {
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  onEditTask, 
  onDeleteTask, 
  selectedTasks = new Set(), 
  onToggleTaskSelect 
}) => {
  const { tasks, loading, error, loadTasks } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
  );
};
