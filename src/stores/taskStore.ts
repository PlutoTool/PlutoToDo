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
}));
