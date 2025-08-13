import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Save, Palette } from 'lucide-react';
import { Category } from '../types';
import { useCategoryStore } from '../stores/categoryStore';

interface CategoryFormProps {
  category?: Category;
  onSubmit: () => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
];

const PRESET_ICONS = [
  'User', 'Briefcase', 'ShoppingCart', 'Heart', 'Home', 'Calendar', 
  'Star', 'Tag', 'Coffee', 'Book', 'Camera', 'Music'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  onSubmit, 
  onCancel 
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Tag');
  const [errors, setErrors] = useState<{ name?: string }>({});
  
  const { createCategory, updateCategory } = useCategoryStore();

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
      setIcon(category.icon || 'Tag');
    }
  }, [category]);

  const validateForm = () => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (category) {
        await updateCategory(category.id, { name: name.trim(), color, icon });
      } else {
        await createCategory({ name: name.trim(), color, icon });
      }
      
      onSubmit();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === presetColor 
                    ? 'border-foreground scale-110' 
                    : 'border-muted-foreground/20 hover:border-muted-foreground/50'
                }`}
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-20 h-10 p-1 border rounded"
          />
        </div>

        {/* Icon Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Icon</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            {PRESET_ICONS.map((presetIcon) => (
              <option key={presetIcon} value={presetIcon}>
                {presetIcon}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preview</label>
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-medium">
              {name || 'Category Name'}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {category ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};
