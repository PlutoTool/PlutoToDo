import { create } from 'zustand';
import { Task, TaskFilter, CreateTaskRequest, UpdateTaskRequest, SortConfig, SortField, SortOrder, Priority } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  sortConfig: SortConfig;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: TaskFilter) => void;
  setSortConfig: (sortConfig: SortConfig) => void;
  sortTasks: (tasks: Task[]) => Task[];
  
  // Async actions
  loadTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<Task>;
  searchTasks: (query: string) => Promise<Task[]>;
  
  // Bulk actions
  bulkDeleteTasks: (ids: string[]) => Promise<void>;
  bulkMarkTasksCompleted: (ids: string[], completed: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filter: {},
  sortConfig: { field: SortField.CreatedAt, order: SortOrder.Desc },

  setTasks: (tasks) => {
    const sortedTasks = get().sortTasks(tasks);
    set({ tasks: sortedTasks });
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => {
    set({ filter });
    // Automatically reload tasks when filter changes
    get().loadTasks();
  },
  setSortConfig: (sortConfig) => {
    set({ sortConfig });
    // Re-sort existing tasks with new config
    const currentTasks = get().tasks;
    const sortedTasks = get().sortTasks(currentTasks);
    set({ tasks: sortedTasks });
  },

  sortTasks: (tasks) => {
    const { field, order } = get().sortConfig;
    
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case SortField.Title:
          comparison = a.title.toLowerCase().localeCompare(b.title.toLowerCase());
          break;
        case SortField.DueDate:
          // Handle null/undefined due dates - put them at the end
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case SortField.CreatedAt:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case SortField.UpdatedAt:
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case SortField.Priority:
          const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case SortField.Completed:
          comparison = Number(a.completed) - Number(b.completed);
          break;
        default:
          comparison = 0;
      }
      
      return order === SortOrder.Asc ? comparison : -comparison;
    });
  },

  loadTasks: async () => {
    try {
      set({ loading: true, error: null });
      const currentFilter = get().filter;
      
      // Only pass filter if it has meaningful values
      const hasFilter = currentFilter && (
        currentFilter.completed !== undefined ||
        currentFilter.priority !== undefined ||
        currentFilter.category_id !== undefined ||
        currentFilter.parent_id !== undefined ||
        currentFilter.search_query !== undefined ||
        currentFilter.due_before !== undefined ||
        currentFilter.due_after !== undefined ||
        currentFilter.no_category !== undefined
      );
      
      const tasks = hasFilter 
        ? await invoke<Task[]>('get_tasks', { filter: currentFilter })
        : await invoke<Task[]>('get_tasks', { filter: null });
        
      get().setTasks(tasks); // Use setTasks to apply sorting
      set({ loading: false });
    } catch (error) {
      set({ error: error as string, loading: false });
    }
  },

  createTask: async (taskRequest) => {
    try {
      set({ loading: true, error: null });
      
      // Create request object - single parameter approach
      const requestObject = {
        title: taskRequest.title,
        description: taskRequest.description || null,
        priority: taskRequest.priority || null,
        due_date: taskRequest.due_date || null,
        category_id: taskRequest.category_id || null,
        tags: taskRequest.tags && taskRequest.tags.length > 0 ? taskRequest.tags : null,
        parent_id: taskRequest.parent_id || null,
      };
      
      const newTask = await invoke<Task>('create_task', { request: requestObject });
      
      // Add new task and re-sort
      const currentTasks = get().tasks;
      get().setTasks([newTask, ...currentTasks]);
      set({ loading: false });
      return newTask;
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedTask = await invoke<Task>('update_task', { 
        id, 
        title: updates.title,
        description: updates.description,
        completed: updates.completed,
        priority: updates.priority,
        due_date: updates.due_date,
        category_id: updates.category_id,
        tags: updates.tags,
        parent_id: updates.parent_id,
      });
      
      // Update task and re-sort
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map(task => task.id === id ? updatedTask : task);
      get().setTasks(updatedTasks);
      set({ loading: false });
      return updatedTask;
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      console.log('TaskStore deleteTask called with id:', id);
      set({ loading: true, error: null });
      console.log('Invoking Tauri delete_task command...');
      await invoke('delete_task', { id });
      console.log('Tauri command completed, updating local state...');
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        loading: false
      }));
      console.log('Local state updated');
    } catch (error) {
      console.error('Error in deleteTask:', error);
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  toggleTaskCompletion: async (id) => {
    try {
      const updatedTask = await invoke<Task>('toggle_task_completion', { id });
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task)
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  searchTasks: async (query) => {
    try {
      const tasks = await invoke<Task[]>('search_tasks', { query });
      return tasks;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  bulkDeleteTasks: async (ids) => {
    try {
      console.log('Bulk deleting tasks:', ids);
      set({ loading: true, error: null });
      
      // Delete tasks one by one (we could optimize this with a bulk command later)
      for (const id of ids) {
        await invoke('delete_task', { id });
      }
      
      // Update local state
      set(state => ({
        tasks: state.tasks.filter(task => !ids.includes(task.id)),
        loading: false
      }));
      
      console.log('Bulk delete completed');
    } catch (error) {
      console.error('Bulk delete failed:', error);
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  bulkMarkTasksCompleted: async (ids, completed) => {
    try {
      console.log('Bulk marking tasks as completed:', ids, completed);
      set({ loading: true, error: null });
      
      // Update tasks one by one (we could optimize this with a bulk command later)
      const updatedTasks: Task[] = [];
      for (const id of ids) {
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          const updatedTask = await invoke<Task>('update_task', {
            id,
            title: task.title,
            description: task.description,
            completed,
            priority: task.priority,
            due_date: task.due_date,
            category_id: task.category_id,
            tags: task.tags,
            parent_id: task.parent_id,
          });
          updatedTasks.push(updatedTask);
        }
      }
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => {
          const updated = updatedTasks.find(ut => ut.id === task.id);
          return updated || task;
        }),
        loading: false
      }));
      
      console.log('Bulk mark completed finished');
    } catch (error) {
      console.error('Bulk mark completed failed:', error);
      set({ error: error as string, loading: false });
      throw error;
    }
  },
}));
