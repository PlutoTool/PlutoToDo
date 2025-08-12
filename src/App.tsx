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
  const { setFilter, deleteTask } = useTaskStore();

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

            <TaskList 
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
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
    </div>
  );
}

export default App;
