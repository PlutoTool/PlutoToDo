import { create } from 'zustand';
import { Task, TaskFilter, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: TaskFilter) => void;
  
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

  setTasks: (tasks) => set({ tasks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (filter) => set({ filter }),

  loadTasks: async () => {
    try {
      set({ loading: true, error: null });
      const tasks = await invoke<Task[]>('get_tasks', { filter: get().filter });
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: error as string, loading: false });
    }
  },

  createTask: async (taskRequest) => {
    try {
      set({ loading: true, error: null });
      const newTask = await invoke<Task>('create_task', {
        title: taskRequest.title,
        description: taskRequest.description,
        priority: taskRequest.priority,
        due_date: taskRequest.due_date,
        category_id: taskRequest.category_id,
        tags: taskRequest.tags,
        parent_id: taskRequest.parent_id,
      });
      set(state => ({ 
        tasks: [newTask, ...state.tasks], 
        loading: false 
      }));
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
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        loading: false
      }));
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
