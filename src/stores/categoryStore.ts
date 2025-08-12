import { create } from 'zustand';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  loadCategories: () => Promise<void>;
  createCategory: (category: CreateCategoryRequest) => Promise<Category>;
  updateCategory: (id: string, updates: UpdateCategoryRequest) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadCategories: async () => {
    try {
      set({ loading: true, error: null });
      const categories = await invoke<Category[]>('get_categories');
      set({ categories, loading: false });
    } catch (error) {
      set({ error: error as string, loading: false });
    }
  },

  createCategory: async (categoryRequest) => {
    try {
      set({ loading: true, error: null });
      const newCategory = await invoke<Category>('create_category', {
        name: categoryRequest.name,
        color: categoryRequest.color,
        icon: categoryRequest.icon,
      });
      set(state => ({ 
        categories: [...state.categories, newCategory], 
        loading: false 
      }));
      return newCategory;
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  updateCategory: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedCategory = await invoke<Category>('update_category', { 
        id,
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
      });
      set(state => ({
        categories: state.categories.map(cat => cat.id === id ? updatedCategory : cat),
        loading: false
      }));
      return updatedCategory;
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      set({ loading: true, error: null });
      await invoke('delete_category', { id });
      set(state => ({
        categories: state.categories.filter(cat => cat.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error as string, loading: false });
      throw error;
    }
  },
}));
