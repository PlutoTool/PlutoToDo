export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  due_date?: string; // ISO string
  category_id?: string;
  tags: string[];
  parent_id?: string; // For subtasks
  created_at: string; // ISO string
  updated_at: string; // ISO string
  // Computed properties for UI
  subtasks?: Task[];
  progress?: TaskProgress;
  depth?: number; // For rendering nested structure
  isExpanded?: boolean; // For UI state
}

export interface TaskProgress {
  total_subtasks: number;
  completed_subtasks: number;
  progress_percentage: number;
  has_subtasks: boolean;
}

export interface TaskHierarchy {
  task: Task;
  children: TaskHierarchy[];
  depth: number;
}

export enum Priority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string; // ISO string
  category_id?: string;
  tags?: string[];
  parent_id?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string; // ISO string
  category_id?: string;
  tags?: string[];
  parent_id?: string;
}

export interface TaskFilter {
  completed?: boolean;
  priority?: Priority;
  category_id?: string;
  parent_id?: string;
  search_query?: string;
  due_before?: string; // ISO string
  due_after?: string; // ISO string
  no_category?: boolean; // true means filter for tasks with no category
}

export enum SortField {
  Title = "title",
  DueDate = "due_date", 
  CreatedAt = "created_at",
  UpdatedAt = "updated_at",
  Priority = "priority",
  Completed = "completed"
}

export enum SortOrder {
  Asc = "asc",
  Desc = "desc"
}

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  created_at: string; // ISO string
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
}
