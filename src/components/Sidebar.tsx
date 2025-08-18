import React, { useEffect, useState } from 'react';
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
  Info,
  Download,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useCategoryStore } from '../stores/categoryStore';
import { useTaskStore } from '../stores/taskStore';
import { useUpdateChecker } from '../hooks/useUpdateChecker';
import { UpdateModal } from './UpdateModal';

interface SidebarProps {
  isExpanded: boolean;
  isMobile: boolean;
  onCreateTask?: () => void;
  onCreateCategory?: () => void;
  onEditCategory?: (category: any) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onShowAbout?: () => void;
  onShowHelp?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded,
  isMobile,
  onCreateTask, 
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onShowAbout,
  onShowHelp,
  darkMode,
  onToggleDarkMode,
  onCollapse
}) => {
  const { categories, loadCategories } = useCategoryStore();
  const { setFilter, filter } = useTaskStore();
  const { updateInfo, isChecking, checkForUpdates, error } = useUpdateChecker();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showUpdateResult, setShowUpdateResult] = useState(false);

  const handleCheckForUpdates = async () => {
    await checkForUpdates();
    setShowUpdateResult(true);
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleFilterChange = (newFilter: any) => {
    setFilter({ ...filter, ...newFilter });
    // Auto-close sidebar on mobile when a filter is selected
    if (isMobile && onCollapse) {
      onCollapse();
    }
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
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onCollapse}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          ${isMobile ? 'fixed left-0 top-0 z-50' : 'relative'}
          ${isExpanded ? (isMobile ? 'translate-x-0' : 'w-64') : (isMobile ? '-translate-x-full' : 'w-0')}
          ${isMobile ? 'w-64' : ''}
          h-full bg-background border-r border-border 
          transition-all duration-300 ease-in-out
          ${!isMobile ? 'overflow-hidden' : ''}
          ${isMobile && isExpanded ? 'shadow-2xl' : isMobile ? 'shadow-none' : 'shadow-lg'}
        `}
      >
        <div className="w-64 h-full bg-background border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h1 className="text-lg font-semibold text-foreground">Pluto: To-do</h1>
            <p className="text-xs text-muted-foreground">
              Organize your universe
              <span className="ml-2 opacity-60">{updateInfo?.currentVersion ? (updateInfo.currentVersion.startsWith('v') ? updateInfo.currentVersion : `v${updateInfo.currentVersion}`) : 'v1.0.0'}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <Button 
              onClick={() => {
                onCreateTask?.();
                if (isMobile && onCollapse) onCollapse();
              }}
              className="w-full justify-start"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
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
                  onClick={() => {
                    onCreateCategory?.();
                    if (isMobile && onCollapse) onCollapse();
                  }}
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
            {/* Update Check */}
            <div className="space-y-2">
              {updateInfo?.hasUpdate ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-start text-primary border-primary/20 bg-primary/10 hover:bg-primary/20"
                  onClick={() => setShowUpdateModal(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Update Available (v{updateInfo.latestVersion})
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleCheckForUpdates}
                  disabled={isChecking}
                  title={error ? `Error: ${error}` : updateInfo ? (updateInfo.latestVersion ? 'You have the latest version' : 'No releases published yet') : 'Check for updates'}
                >
                  {isChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking for updates...
                    </>
                  ) : error ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 text-destructive" />
                      Check for Updates
                    </>
                  ) : updateInfo ? (
                    updateInfo.latestVersion ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 text-green-500" />
                        Check for Updates
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 text-orange-500" />
                        Check for Updates
                      </>
                    )
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Check for Updates
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onToggleDarkMode?.();
                if (isMobile && onCollapse) onCollapse();
              }}
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
              onClick={() => {
                onShowHelp?.();
                if (isMobile && onCollapse) onCollapse();
              }}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Shortcuts
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onShowAbout?.();
                if (isMobile && onCollapse) onCollapse();
              }}
            >
              <Info className="w-4 h-4 mr-2" />
              About
            </Button>
          </div>

          {/* Update Modal */}
          {updateInfo && (showUpdateModal || showUpdateResult) && (
            <UpdateModal
              isOpen={showUpdateModal || showUpdateResult}
              onClose={() => {
                setShowUpdateModal(false);
                setShowUpdateResult(false);
              }}
              updateInfo={updateInfo}
            />
          )}
        </div>
      </div>
    </>
  );
};
