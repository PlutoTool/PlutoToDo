import { create } from 'zustand';
import { Task, TaskFilter, CreateTaskRequest, UpdateTaskRequest, SortConfig, SortField, SortOrder, Priority, TaskProgress, TaskHierarchy } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface TaskStore {
  tasks: Task[];
  allTasks: Task[]; // Unfiltered tasks for count calculations
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  sortConfig: SortConfig;
  expandedTasks: Set<string>; // Track expanded tasks for hierarchical view
  viewMode: 'flat' | 'hierarchical'; // New view mode
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setAllTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: TaskFilter) => void;
  setSortConfig: (sortConfig: SortConfig) => void;
  setViewMode: (mode: 'flat' | 'hierarchical') => void;
  toggleTaskExpansion: (taskId: string) => void;
  sortTasks: (tasks: Task[]) => Task[];
  
  // Async actions
  loadTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  deleteTaskWithSubtasks: (id: string) => Promise<void>;
  deleteTaskAndPromoteSubtasks: (id: string) => Promise<void>;
  checkTaskHasSubtasks: (id: string) => Promise<boolean>;
  toggleTaskCompletion: (id: string) => Promise<Task>;
  searchTasks: (query: string) => Promise<Task[]>;
  
  // New subtask methods
  loadSubtasks: (parentId: string) => Promise<Task[]>;
  loadTaskHierarchy: (rootId?: string) => Promise<Task[]>;
  loadTaskWithSubtasks: (id: string) => Promise<Task[]>;
  calculateTaskProgress: (id: string) => Promise<TaskProgress>;
  buildTaskHierarchy: (tasks: Task[]) => TaskHierarchy[];
  flattenHierarchy: (hierarchy: TaskHierarchy[]) => Task[];
  getIncompleteSubtasks: (parentId: string) => Promise<Task[]>;
  bulkMarkSubtasksCompleted: (parentId: string) => Promise<Task[]>;
  toggleTaskCompletionWithSubtasks: (taskId: string, markSubtasksDone?: boolean) => Promise<Task>;
  
  // Bulk actions
  bulkDeleteTasks: (ids: string[]) => Promise<void>;
  bulkCheckTasksHaveSubtasks: (ids: string[]) => Promise<string[]>;
  bulkDeleteTasksWithSubtasks: (ids: string[]) => Promise<void>;
  bulkDeleteTasksAndPromoteSubtasks: (ids: string[]) => Promise<void>;
  bulkMarkTasksCompleted: (ids: string[], completed: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  allTasks: [],
  loading: false,
  error: null,
  filter: {},
  sortConfig: { field: SortField.CreatedAt, order: SortOrder.Desc },
  expandedTasks: new Set<string>(),
  viewMode: 'flat',

  setTasks: (tasks) => {
    const sortedTasks = get().sortTasks(tasks);
    set({ tasks: sortedTasks });
  },
  setAllTasks: (allTasks) => set({ allTasks }),
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
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleTaskExpansion: (taskId) => {
    set(state => {
      const newExpanded = new Set(state.expandedTasks);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return { expandedTasks: newExpanded };
    });
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
      
      // Always load all tasks for count calculations
      const allTasks = await invoke<Task[]>('get_tasks', { filter: null });
      get().setAllTasks(allTasks);
      
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
        : allTasks; // Use already loaded allTasks if no filter
        
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
      
      // If this is a subtask (has parent_id), automatically expand the parent task
      if (newTask.parent_id) {
        set(state => {
          const newExpanded = new Set(state.expandedTasks);
          newExpanded.add(newTask.parent_id!);
          return { expandedTasks: newExpanded };
        });
      }
      
      // Add new task and re-sort
      const currentTasks = get().tasks;
      const currentAllTasks = get().allTasks;
      get().setTasks([newTask, ...currentTasks]);
      get().setAllTasks([newTask, ...currentAllTasks]);
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
      console.log('TaskStore: updateTask called with:', { id, updates });
      
      const updatedTask = await invoke<Task>('update_task', { 
        id, 
        request: updates,
      });
      
      console.log('TaskStore: Received updated task from backend:', updatedTask);
      
      // Update task and re-sort
      const currentTasks = get().tasks;
      const currentAllTasks = get().allTasks;
      const updatedTasks = currentTasks.map(task => task.id === id ? updatedTask : task);
      const updatedAllTasks = currentAllTasks.map(task => task.id === id ? updatedTask : task);
      get().setTasks(updatedTasks);
      get().setAllTasks(updatedAllTasks);
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
        allTasks: state.allTasks.filter(task => task.id !== id),
        loading: false
      }));
      console.log('Local state updated');
    } catch (error) {
      console.error('Error in deleteTask:', error);
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  deleteTaskWithSubtasks: async (id) => {
    try {
      set({ loading: true, error: null });
      await invoke('delete_task_with_subtasks', { id });
      
      // Reload all tasks to get the updated state
      const allTasks = await invoke<Task[]>('get_tasks', {});
      set({ tasks: allTasks, allTasks: allTasks, loading: false });
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  deleteTaskAndPromoteSubtasks: async (id) => {
    try {
      set({ loading: true, error: null });
      await invoke('delete_task_and_promote_subtasks', { id });
      
      // Reload all tasks to get the updated state
      const allTasks = await invoke<Task[]>('get_tasks', {});
      set({ tasks: allTasks, allTasks: allTasks, loading: false });
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  checkTaskHasSubtasks: async (id) => {
    try {
      return await invoke<boolean>('check_task_has_subtasks', { id });
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  toggleTaskCompletion: async (id) => {
    try {
      const updatedTask = await invoke<Task>('toggle_task_completion', { id });
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        allTasks: state.allTasks.map(task => task.id === id ? updatedTask : task)
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
        allTasks: state.allTasks.filter(task => !ids.includes(task.id)),
        loading: false
      }));
      
      console.log('Bulk delete completed');
    } catch (error) {
      console.error('Bulk delete failed:', error);
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  bulkCheckTasksHaveSubtasks: async (ids) => {
    try {
      console.log('Checking which tasks have subtasks:', ids);
      const tasksWithSubtasks = await invoke<string[]>('bulk_check_tasks_have_subtasks', { ids });
      console.log('Tasks with subtasks:', tasksWithSubtasks);
      return tasksWithSubtasks;
    } catch (error) {
      console.error('Failed to check tasks for subtasks:', error);
      throw error;
    }
  },

  bulkDeleteTasksWithSubtasks: async (ids) => {
    try {
      console.log('Bulk deleting tasks with subtasks:', ids);
      set({ loading: true, error: null });
      
      // Get all tasks that will be deleted (parents + their subtasks) before deletion
      const state = get();
      const tasksToDelete = new Set<string>();
      
      // Add the selected task IDs
      ids.forEach(id => tasksToDelete.add(id));
      
      // For each selected task, recursively find all subtasks that will be deleted
      const findAllSubtasks = (parentId: string) => {
        const subtasks = state.tasks.filter(task => task.parent_id === parentId);
        subtasks.forEach(subtask => {
          tasksToDelete.add(subtask.id);
          findAllSubtasks(subtask.id); // Recursively find nested subtasks
        });
      };
      
      ids.forEach(id => findAllSubtasks(id));
      
      await invoke('bulk_delete_tasks_with_subtasks', { ids });
      
      // Update local state - remove all tasks that were deleted (parents + subtasks)
      set(state => ({
        tasks: state.tasks.filter(task => !tasksToDelete.has(task.id)),
        allTasks: state.allTasks.filter(task => !tasksToDelete.has(task.id)),
        loading: false
      }));
      
      console.log('Bulk delete with subtasks completed');
    } catch (error) {
      console.error('Bulk delete with subtasks failed:', error);
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  bulkDeleteTasksAndPromoteSubtasks: async (ids) => {
    try {
      console.log('Bulk deleting tasks and promoting subtasks:', ids);
      set({ loading: true, error: null });
      
      await invoke('bulk_delete_tasks_and_promote_subtasks', { ids });
      
      // Reload tasks to get the updated state with promoted subtasks
      const updatedTasks = await invoke<Task[]>('get_tasks', { filter: get().filter });
      const allTasks = await invoke<Task[]>('get_tasks', { filter: null });
      
      set({
        tasks: updatedTasks,
        allTasks: allTasks,
        loading: false
      });
      
      console.log('Bulk delete and promote subtasks completed');
    } catch (error) {
      console.error('Bulk delete and promote subtasks failed:', error);
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
        allTasks: state.allTasks.map(task => {
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

  // New subtask methods
  loadSubtasks: async (parentId) => {
    try {
      const subtasks = await invoke<Task[]>('get_subtasks', { parentId });
      return subtasks;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  loadTaskHierarchy: async (rootId) => {
    try {
      const tasks = await invoke<Task[]>('get_task_hierarchy', { root_id: rootId });
      return tasks;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  loadTaskWithSubtasks: async (id) => {
    try {
      const tasks = await invoke<Task[]>('get_task_with_subtasks', { id });
      return tasks;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  calculateTaskProgress: async (id) => {
    try {
      const progress = await invoke<TaskProgress>('calculate_task_progress', { id });
      return progress;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  getIncompleteSubtasks: async (parentId: string) => {
    try {
      const incompleteSubtasks = await invoke<Task[]>('get_incomplete_subtasks', { parentId });
      return incompleteSubtasks;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  bulkMarkSubtasksCompleted: async (parentId: string) => {
    try {
      const updatedTasks = await invoke<Task[]>('bulk_mark_subtasks_completed', { parentId });
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => {
          const updated = updatedTasks.find(ut => ut.id === task.id);
          return updated || task;
        }),
        allTasks: state.allTasks.map(task => {
          const updated = updatedTasks.find(ut => ut.id === task.id);
          return updated || task;
        })
      }));
      
      return updatedTasks;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  toggleTaskCompletionWithSubtasks: async (taskId: string, markSubtasksDone = false) => {
    try {
      // If we need to mark subtasks done first, do that
      if (markSubtasksDone) {
        await invoke('bulk_mark_subtasks_completed', { parentId: taskId });
      }
      
      // Then toggle the parent task
      const updatedTask = await invoke<Task>('toggle_task_completion', { id: taskId });
      
      // Reload all tasks to get the updated state
      const allTasks = await invoke<Task[]>('get_tasks', {});
      set({ tasks: allTasks, allTasks: allTasks });
      
      return updatedTask;
    } catch (error) {
      set({ error: error as string });
      throw error;
    }
  },

  buildTaskHierarchy: (tasks) => {
    const taskMap = new Map<string, Task>();
    const rootTasks: TaskHierarchy[] = [];
    
    // Create task map
    tasks.forEach(task => taskMap.set(task.id, task));
    
    // Build hierarchy
    const buildNode = (task: Task, depth: number = 0): TaskHierarchy => {
      const children = tasks
        .filter(t => t.parent_id === task.id)
        .map(child => buildNode(child, depth + 1));
      
      return {
        task: { ...task, depth },
        children,
        depth
      };
    };
    
    // Find root tasks (no parent_id)
    tasks
      .filter(task => !task.parent_id)
      .forEach(rootTask => {
        rootTasks.push(buildNode(rootTask));
      });
    
    return rootTasks;
  },

  flattenHierarchy: (hierarchy) => {
    const flattened: Task[] = [];
    
    const flatten = (nodes: TaskHierarchy[]) => {
      nodes.forEach(node => {
        flattened.push(node.task);
        if (node.children.length > 0) {
          flatten(node.children);
        }
      });
    };
    
    flatten(hierarchy);
    return flattened;
  },
}));
