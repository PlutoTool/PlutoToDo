import React, { useEffect } from 'react';
import { Button } from './ui/Button';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Plus,
  Moon,
  Sun
} from 'lucide-react';
import { useCategoryStore } from '../stores/categoryStore';
import { useTaskStore } from '../stores/taskStore';

interface SidebarProps {
  onCreateTask?: () => void;
  onCreateCategory?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateTask, 
  onCreateCategory, 
  darkMode,
  onToggleDarkMode 
}) => {
  const { categories, loadCategories } = useCategoryStore();
  const { setFilter, filter } = useTaskStore();

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleFilterChange = (newFilter: any) => {
    setFilter({ ...filter, ...newFilter });
  };

  const menuItems = [
    {
      label: 'All Tasks',
      icon: Home,
      onClick: () => handleFilterChange({ completed: undefined, category_id: undefined }),
      active: !filter.completed && !filter.category_id,
    },
    {
      label: 'Today',
      icon: Calendar,
      onClick: () => {
        const today = new Date().toISOString().split('T')[0];
        handleFilterChange({ 
          due_after: `${today}T00:00:00Z`, 
          due_before: `${today}T23:59:59Z` 
        });
      },
    },
    {
      label: 'Completed',
      icon: CheckSquare,
      onClick: () => handleFilterChange({ completed: true, category_id: undefined }),
      active: filter.completed === true,
    },
    {
      label: 'Pending',
      icon: Clock,
      onClick: () => handleFilterChange({ completed: false, category_id: undefined }),
      active: filter.completed === false && !filter.category_id,
    },
  ];

  return (
    <div className="w-64 h-full bg-background border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">Pluto: To-do</h1>
        <p className="text-xs text-muted-foreground">Organize your universe</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button 
          onClick={onCreateTask}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "secondary" : "ghost"}
              className="w-full justify-start"
              size="sm"
              onClick={item.onClick}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>

        {/* Categories */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCreateCategory}
              className="h-6 w-6"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={filter.category_id === category.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
                onClick={() => handleFilterChange({ category_id: category.id, completed: undefined })}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onToggleDarkMode}
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
