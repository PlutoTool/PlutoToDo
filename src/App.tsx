import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Task } from './types';
import { Search, Plus, X } from 'lucide-react';
import { useTaskStore } from './stores/taskStore';

function App() {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
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
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const { setFilter, deleteTask, bulkDeleteTasks, bulkMarkTasksCompleted } = useTaskStore();

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  const getSelectedTaskTitles = () => {
    const { tasks } = useTaskStore.getState();
    return Array.from(selectedTasks)
      .map(id => tasks.find(task => task.id === id)?.title)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ') + (selectedTasks.size > 3 ? '...' : '');
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        onCreateTask={handleCreateTask}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Tasks</h2>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
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
            </div>

            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {showTaskForm ? (
              <div className="mb-6">
                <TaskForm 
                  task={editingTask}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              </div>
            ) : null}

            {/* Bulk Actions Bar */}
            {selectedTasks.size > 0 && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.size} task{selectedTasks.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkMarkCompleted(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
                  >
                    Mark Done
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkMarkCompleted(false)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                  >
                    Mark Undone
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}

            <TaskList 
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              selectedTasks={selectedTasks}
              onToggleTaskSelect={handleToggleTaskSelect}
            />
          </div>
        </main>
      </div>

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
    </div>
  );
}

export default App;
