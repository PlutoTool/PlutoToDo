import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { DatePicker } from './ui/DatePicker';
import { Task, CreateTaskRequest, UpdateTaskRequest, Priority } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useCategoryStore } from '../stores/categoryStore';
import { Tag, X } from 'lucide-react';
import { format } from 'date-fns';

interface TaskFormProps {
  task?: Task;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const { createTask, updateTask } = useTaskStore();
  const { categories, loadCategories } = useCategoryStore();
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || Priority.Medium);
  const [dueDate, setDueDate] = useState(
    task?.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : ''
  );
  const [dueTime, setDueTime] = useState(
    task?.due_date ? format(new Date(task.due_date), 'HH:mm') : '23:59'
  );
  const [noDueDate, setNoDueDate] = useState(!task?.due_date);
  const [categoryId, setCategoryId] = useState(task?.category_id || '');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle "No Due Date" checkbox logic
  useEffect(() => {
    if (noDueDate) {
      // Clear date when "No Due Date" is checked
      setDueDate('');
    } else if (!dueDate) {
      // Set today's date when "No Due Date" is unchecked and no date is set
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
    }
  }, [noDueDate, dueDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      // Convert date and time to ISO string if not "No Due Date"
      let dueDateString: string | undefined = undefined;
      if (!noDueDate && dueDate) {
        const dateTimeString = `${dueDate}T${dueTime}:00.000Z`;
        dueDateString = new Date(dateTimeString).toISOString();
      }
      
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDateString,
        category_id: categoryId || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      if (task) {
        await updateTask(task.id, taskData as UpdateTaskRequest);
      } else {
        await createTask(taskData as CreateTaskRequest);
      }
      
      onSubmit?.();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).name === 'newTag') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="text-sm font-medium mb-1 block">
            Title *
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-sm font-medium mb-1 block">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description..."
            rows={3}
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="priority" className="text-sm font-medium mb-1 block">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.High}>High</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <input
              id="noDueDate"
              type="checkbox"
              checked={noDueDate}
              onChange={(e) => setNoDueDate(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="noDueDate" className="text-sm font-medium">
              No Due Date
            </label>
          </div>
          
          {!noDueDate && (
            <div className="space-y-2">
              <div>
                <label htmlFor="dueDate" className="text-sm font-medium mb-1 block">
                  Due Date
                </label>
                <DatePicker
                  value={dueDate}
                  onChange={(value) => setDueDate(value)}
                  placeholder="Select due date..."
                />
              </div>
              <div>
                <label htmlFor="dueTime" className="text-sm font-medium mb-1 block">
                  Due Time
                </label>
                <Input
                  id="dueTime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="text-sm font-medium mb-1 block">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="text-sm font-medium mb-1 block">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              name="newTag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
            />
            <Button type="button" onClick={handleAddTag} size="sm">
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading || !title.trim()} className="flex-1">
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
