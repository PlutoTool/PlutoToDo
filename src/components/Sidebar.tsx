import React, { useEffect } from 'react';
import { Button } from './ui/Button';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Circle,
  Plus,
  Moon,
  Sun,
  Edit2,
  Trash2,
  Inbox,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useCategoryStore } from '../stores/categoryStore';
import { useTaskStore } from '../stores/taskStore';

interface SidebarProps {
  onCreateTask?: () => void;
  onCreateCategory?: () => void;
  onEditCategory?: (category: any) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onShowAbout?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateTask, 
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onShowAbout,
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
      onClick: () => handleFilterChange({ completed: undefined, category_id: undefined, no_category: undefined, due_before: undefined, due_after: undefined }),
      active: !filter.completed && !filter.category_id && !filter.no_category && !filter.due_before && !filter.due_after,
    },
    {
      label: 'Today',
      icon: Calendar,
      onClick: () => {
        const today = new Date().toISOString().split('T')[0];
        handleFilterChange({ 
          due_after: `${today}T00:00:00Z`, 
          due_before: `${today}T23:59:59Z`,
          category_id: undefined,
          completed: undefined,
          no_category: undefined
        });
      },
      active: filter.due_after && filter.due_before && 
              filter.due_after.startsWith(new Date().toISOString().split('T')[0]) &&
              filter.due_before.startsWith(new Date().toISOString().split('T')[0]),
    },
    {
      label: 'Overdue',
      icon: AlertTriangle,
      onClick: () => {
        const now = new Date().toISOString();
        handleFilterChange({ 
          due_before: now,
          completed: false, // Only show incomplete overdue tasks
          category_id: undefined,
          no_category: undefined,
          due_after: undefined
        });
      },
      active: filter.due_before && filter.completed === false && !filter.due_after && 
              new Date(filter.due_before) < new Date(),
    },
    {
      label: 'Completed',
      icon: CheckSquare,
      onClick: () => handleFilterChange({ completed: true, category_id: undefined, no_category: undefined, due_before: undefined, due_after: undefined }),
      active: filter.completed === true,
    },
    {
      label: 'Pending',
      icon: Circle,
      onClick: () => handleFilterChange({ completed: false, category_id: undefined, no_category: undefined, due_before: undefined, due_after: undefined }),
      active: filter.completed === false && !filter.category_id && !filter.no_category && !filter.due_before && !filter.due_after,
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
            {/* No Category Option */}
            <Button
              variant={filter.no_category === true ? "secondary" : "ghost"}
              className="w-full justify-start"
              size="sm"
              onClick={() => handleFilterChange({ 
                category_id: undefined, 
                completed: undefined, 
                no_category: true,
                due_before: undefined,
                due_after: undefined
              })}
            >
              <Inbox className="w-3 h-3 mr-2 text-muted-foreground" />
              No Category
            </Button>
            
            {categories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center"
              >
                <Button
                  variant={filter.category_id === category.id ? "secondary" : "ghost"}
                  className="flex-1 justify-start"
                  size="sm"
                  onClick={() => handleFilterChange({ 
                    category_id: category.id, 
                    completed: undefined, 
                    no_category: undefined,
                    due_before: undefined,
                    due_after: undefined
                  })}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </Button>
                
                {/* Category Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                  {onEditCategory && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEditCategory(category)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  )}
                  {onDeleteCategory && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
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
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onShowAbout}
        >
          <Info className="w-4 h-4 mr-2" />
          About
        </Button>
      </div>
    </div>
  );
};
