import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { CategoryForm } from './components/CategoryForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SortDropdown } from './components/SortDropdown';
import { Modal } from './components/ui/Modal';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Task, Category } from './types';
import { Search, Plus, X, Check, CheckCheck, Trash2, MoreHorizontal } from 'lucide-react';
import { useTaskStore } from './stores/taskStore';
import { useCategoryStore } from './stores/categoryStore';

function App() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null
  });
  const [confirmBulkAction, setConfirmBulkAction] = useState<{ 
    isOpen: boolean; 
    action: 'delete' | 'markDone' | 'markUndone' | null;
    taskCount: number;
  }>({
    isOpen: false,
    action: null,
    taskCount: 0
  });
  const [confirmCategoryDelete, setConfirmCategoryDelete] = useState<{ 
    isOpen: boolean; 
    categoryId: string | null;
    categoryName: string;
    taskCount: number;
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: '',
    taskCount: 0
  });
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { setFilter, deleteTask, bulkDeleteTasks, bulkMarkTasksCompleted, updateTask, tasks } = useTaskStore();
  const { deleteCategory } = useCategoryStore();

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Close bulk actions menu when no tasks are selected
  useEffect(() => {
    if (selectedTasks.size === 0) {
      setShowBulkActions(false);
    }
  }, [selectedTasks.size]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleFormSubmit = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (id: string) => {
    console.log('Delete task called with id:', id);
    // Temporarily skip confirmation for testing
    try {
      console.log('Calling deleteTask from store...');
      await deleteTask(id);
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const confirmDeleteTask = async () => {
    if (confirmDelete.taskId) {
      try {
        console.log('Calling deleteTask from store...');
        await deleteTask(confirmDelete.taskId);
        console.log('Task deleted successfully');
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
    setConfirmDelete({ isOpen: false, taskId: null });
  };

  const cancelDeleteTask = () => {
    setConfirmDelete({ isOpen: false, taskId: null });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilter({ search_query: query.trim() });
    } else {
      setFilter({ search_query: undefined });
    }
  };

  const handleToggleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(taskId)) {
        newSelected.delete(taskId);
      } else {
        newSelected.add(taskId);
      }
      return newSelected;
    });
  };

  const handleClearSelection = () => {
    setSelectedTasks(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    
    setConfirmBulkAction({
      isOpen: true,
      action: 'delete',
      taskCount: selectedTasks.size
    });
  };

  const handleBulkMarkCompleted = async (completed: boolean) => {
    if (selectedTasks.size === 0) return;
    
    setConfirmBulkAction({
      isOpen: true,
      action: completed ? 'markDone' : 'markUndone',
      taskCount: selectedTasks.size
    });
  };

  const executeBulkAction = async () => {
    if (!confirmBulkAction.action || selectedTasks.size === 0) return;

    const taskIds = Array.from(selectedTasks);
    
    try {
      switch (confirmBulkAction.action) {
        case 'delete':
          await bulkDeleteTasks(taskIds);
          break;
        case 'markDone':
          await bulkMarkTasksCompleted(taskIds, true);
          break;
        case 'markUndone':
          await bulkMarkTasksCompleted(taskIds, false);
          break;
      }
      setSelectedTasks(new Set()); // Clear selection after successful action
    } catch (error) {
      console.error('Failed to execute bulk action:', error);
    }
    
    setConfirmBulkAction({ isOpen: false, action: null, taskCount: 0 });
  };

  const cancelBulkAction = () => {
    setConfirmBulkAction({ isOpen: false, action: null, taskCount: 0 });
  };

  // Category handlers
  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategoryFormSubmit = () => {
    setShowCategoryForm(false);
    setEditingCategory(undefined);
  };

  const handleCategoryFormCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Count tasks in this category
    const tasksInCategory = tasks.filter(task => task.category_id === categoryId);
    const category = useCategoryStore.getState().categories.find(cat => cat.id === categoryId);
    
    setConfirmCategoryDelete({
      isOpen: true,
      categoryId,
      categoryName: category?.name || 'Unknown',
      taskCount: tasksInCategory.length
    });
  };

  const executeCategoryDelete = async () => {
    if (!confirmCategoryDelete.categoryId) return;

    try {
      // First, update all tasks in this category to have no category
      const tasksInCategory = tasks.filter(task => task.category_id === confirmCategoryDelete.categoryId);
      
      for (const task of tasksInCategory) {
        await updateTask(task.id, {
          ...task,
          category_id: undefined
        });
      }

      // Then delete the category
      await deleteCategory(confirmCategoryDelete.categoryId);
      
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
    
    setConfirmCategoryDelete({ isOpen: false, categoryId: null, categoryName: '', taskCount: 0 });
  };

  const cancelCategoryDelete = () => {
    setConfirmCategoryDelete({ isOpen: false, categoryId: null, categoryName: '', taskCount: 0 });
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        onCreateTask={handleCreateTask}
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <h2 className="text-xl font-semibold whitespace-nowrap">Tasks</h2>
              
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <SortDropdown />
            </div>

            <Button onClick={handleCreateTask} className="whitespace-nowrap">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <div className="max-w-4xl mx-auto p-6">

              <TaskList 
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                selectedTasks={selectedTasks}
                onToggleTaskSelect={handleToggleTaskSelect}
              />

              {/* Floating Action Button for Bulk Operations */}
              {selectedTasks.size > 0 && (
                <>
                  {/* Backdrop for mobile */}
                  {showBulkActions && (
                    <div 
                      className="fixed inset-0 bg-black/20 z-40 md:hidden"
                      onClick={() => setShowBulkActions(false)}
                    />
                  )}
                  
                  {/* Desktop: Bottom-right floating menu */}
                  <div className="hidden md:block">
                    <div className="fixed bottom-6 right-6 z-50">
                      {showBulkActions && (
                        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-[200px]">
                          <div className="text-sm text-gray-600 dark:text-gray-300 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                            {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
                          </div>
                          <div className="py-2 space-y-1">
                            <button
                              onClick={() => {
                                handleBulkMarkCompleted(true);
                                setShowBulkActions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-green-600 dark:text-green-400"
                            >
                              <Check className="w-4 h-4" />
                              Mark as Done
                            </button>
                            <button
                              onClick={() => {
                                handleBulkMarkCompleted(false);
                                setShowBulkActions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-blue-600 dark:text-blue-400"
                            >
                              <CheckCheck className="w-4 h-4" />
                              Mark as Undone
                            </button>
                            <button
                              onClick={() => {
                                handleClearSelection();
                                setShowBulkActions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Clear Selection
                            </button>
                            <button
                              onClick={() => {
                                handleBulkDelete();
                                setShowBulkActions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Tasks
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile: Bottom sheet */}
                  <div className="md:hidden">
                    <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-transform duration-300 z-50 ${
                      showBulkActions ? 'translate-y-0' : 'translate-y-full'
                    }`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
                          </h3>
                          <button
                            onClick={() => setShowBulkActions(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleBulkMarkCompleted(true);
                              setShowBulkActions(false);
                            }}
                            className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 flex items-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Mark Done
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleBulkMarkCompleted(false);
                              setShowBulkActions(false);
                            }}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 flex items-center gap-2"
                          >
                            <CheckCheck className="w-4 h-4" />
                            Mark Undone
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleClearSelection();
                              setShowBulkActions(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Clear
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              handleBulkDelete();
                              setShowBulkActions(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating trigger button for mobile */}
                    <div className="fixed bottom-6 right-6 z-40">
                      <button
                        onClick={() => setShowBulkActions(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 relative"
                      >
                        <MoreHorizontal className="w-6 h-6" />
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                          {selectedTasks.size}
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskForm}
        onClose={handleFormCancel}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <TaskForm 
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryForm}
        onClose={handleCategoryFormCancel}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="md"
      >
        <CategoryForm 
          category={editingCategory}
          onSubmit={handleCategoryFormSubmit}
          onCancel={handleCategoryFormCancel}
        />
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Bulk Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmBulkAction.isOpen}
        title={
          confirmBulkAction.action === 'delete' 
            ? 'Delete Tasks' 
            : confirmBulkAction.action === 'markDone'
            ? 'Mark Tasks as Done'
            : 'Mark Tasks as Undone'
        }
        message={
          confirmBulkAction.action === 'delete'
            ? `Are you sure you want to delete ${confirmBulkAction.taskCount} task${confirmBulkAction.taskCount > 1 ? 's' : ''}? This action cannot be undone.`
            : confirmBulkAction.action === 'markDone'
            ? `Mark ${confirmBulkAction.taskCount} task${confirmBulkAction.taskCount > 1 ? 's' : ''} as completed?`
            : `Mark ${confirmBulkAction.taskCount} task${confirmBulkAction.taskCount > 1 ? 's' : ''} as incomplete?`
        }
        onConfirm={executeBulkAction}
        onCancel={cancelBulkAction}
        confirmText={
          confirmBulkAction.action === 'delete' 
            ? 'Delete' 
            : confirmBulkAction.action === 'markDone'
            ? 'Mark Done'
            : 'Mark Undone'
        }
        cancelText="Cancel"
      />

      {/* Category Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmCategoryDelete.isOpen}
        title="Delete Category"
        message={
          confirmCategoryDelete.taskCount > 0
            ? `Are you sure you want to delete the category "${confirmCategoryDelete.categoryName}"? This will remove the category from ${confirmCategoryDelete.taskCount} task${confirmCategoryDelete.taskCount > 1 ? 's' : ''}, but the tasks will not be deleted.`
            : `Are you sure you want to delete the category "${confirmCategoryDelete.categoryName}"?`
        }
        onConfirm={executeCategoryDelete}
        onCancel={cancelCategoryDelete}
        confirmText="Delete Category"
        cancelText="Cancel"
      />
    </div>
  );
}

export default App;
