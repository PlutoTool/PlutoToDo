import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { TaskForm } from './TaskForm';
import { ConfirmDialog } from './ConfirmDialog';
import { Task } from '../types';
import { useTaskStore } from '../stores/taskStore';
import { useCategoryStore } from '../stores/categoryStore';
import { 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  User, 
  Clock, 
  CheckCircle, 
  Circle,
  FolderOpen,
  Plus,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { formatDateTime, isOverdue } from '../utils/dateUtils';
import { getPriorityColor } from '../utils/priorityUtils';
import { cn } from '../utils/cn';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubtaskClick?: (subtask: Task) => void;
  onParentClick?: (parentTask: Task) => void;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSubtaskClick,
  onParentClick
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { 
    toggleTaskCompletion, 
    deleteTask,
    tasks: allTasks 
  } = useTaskStore();
  const { categories } = useCategoryStore();

  // Get the current task data from the store to ensure it's up-to-date
  const currentTask = task ? allTasks.find(t => t.id === task.id) || task : null;

  // Reset editing state when modal closes or task changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowSubtaskForm(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset editing state when task changes
    setIsEditing(false);
    setShowSubtaskForm(false);
    setShowDeleteConfirm(false);
  }, [task?.id]);

  // Debug effect to track showDeleteConfirm changes
  useEffect(() => {
    console.log('showDeleteConfirm state changed to:', showDeleteConfirm);
  }, [showDeleteConfirm]);

  if (!currentTask) return null;

  const subtasks = allTasks.filter(t => t.parent_id === currentTask.id);
  const parentTask = currentTask.parent_id ? allTasks.find(t => t.id === currentTask.parent_id) : null;
  const category = categories.find(c => c.id === currentTask.category_id);

  const handleToggleCompletion = async () => {
    try {
      await toggleTaskCompletion(currentTask.id);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    // Use setTimeout to ensure React has re-rendered with the updated task data
    // before switching back to view mode
    setTimeout(() => {
      setIsEditing(false);
    }, 50);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Delete button clicked for task:', currentTask.id);
    console.log('Setting showDeleteConfirm to true');
    setShowDeleteConfirm(true);
    console.log('showDeleteConfirm state should now be true');
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    
    try {
      console.log('Deleting task:', task.id);
      await deleteTask(task.id);
      console.log('Task deleted successfully, closing modal...');
      
      // Close modal - don't call parent's delete handler since we already deleted it
      onClose();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleAddSubtask = () => {
    setShowSubtaskForm(true);
  };

  const handleSubtaskSubmit = () => {
    // Use setTimeout to ensure React has re-rendered with the updated task data
    // before switching back to view mode
    setTimeout(() => {
      setShowSubtaskForm(false);
    }, 50);
  };

  const handleSubtaskCancel = () => {
    setShowSubtaskForm(false);
  };

  if (isEditing) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleEditCancel}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          task={currentTask}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      </Modal>
    );
  }

  if (showSubtaskForm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleSubtaskCancel}
        title="Add Subtask"
        size="lg"
      >
        <TaskForm
          parentId={currentTask.id}
          onSubmit={handleSubtaskSubmit}
          onCancel={handleSubtaskCancel}
        />
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={parentTask ? `Subtask Details - ${parentTask.title}` : (currentTask.completed ? "Task Details - Completed" : "Task Details")}
        size="lg"
      >
      <div className="p-6 space-y-6">
        {/* Back to Parent Navigation */}
        {parentTask && onParentClick && (
          <div className="border-b border-border pb-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onParentClick(parentTask)}
              className="px-2 py-1 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to "{parentTask.title}"
            </Button>
          </div>
        )}

        {/* Task Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className={cn(
                "text-xl font-semibold flex-1",
                currentTask.completed && "line-through text-gray-500 dark:text-gray-400"
              )}>
                {currentTask.title}
              </h2>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                getPriorityColor(currentTask.priority)
              )}>
                {currentTask.priority}
              </span>
            </div>
            
            {/* Completion Status Section */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <Button
                  onClick={handleToggleCompletion}
                  variant={currentTask.completed ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "transition-all duration-200",
                    currentTask.completed 
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600 dark:bg-green-700 dark:hover:bg-green-800" 
                      : "border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-green-400 dark:hover:bg-green-900/20"
                  )}
                >
                  {currentTask.completed ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </div>
              {currentTask.completed && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-16">
                  ✓ This task has been completed
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:hover:border-red-500"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Description Section - Full Width */}
        {currentTask.description && (
          <div className="w-full">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description:</h3>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg whitespace-pre-wrap">
              {currentTask.description}
            </div>
          </div>
        )}

        {/* Task Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Due Date */}
          {currentTask.due_date && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Due Date</span>
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  isOverdue(currentTask.due_date) && !currentTask.completed
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-800 dark:text-gray-200"
                )}>
                  {formatDateTime(currentTask.due_date)}
                </p>
                {isOverdue(currentTask.due_date) && !currentTask.completed && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">⚠ Overdue</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category */}
          {category && (
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Category</span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{category.name}</p>
              </CardContent>
            </Card>
          )}

          {/* Created */}
          <Card className="border-l-4 border-l-gray-400 dark:border-l-gray-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Created</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(currentTask.created_at)}
              </p>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card className="border-l-4 border-l-gray-400 dark:border-l-gray-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(currentTask.updated_at)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        {currentTask.tags && currentTask.tags.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">Tags</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({currentTask.tags.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentTask.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200 hover:bg-orange-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subtasks */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Subtasks</span>
                {subtasks.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {subtasks.filter(s => s.completed).length}/{subtasks.length} completed
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddSubtask}
                className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Subtask
              </Button>
            </div>
            
            {/* Progress Bar for Subtasks */}
            {subtasks.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {Math.round((subtasks.filter(s => s.completed).length / subtasks.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {subtasks.length > 0 ? (
              <div className="space-y-3">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="group flex items-center gap-3 p-4 rounded-lg border bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                    onClick={() => {
                      if (onSubtaskClick) {
                        onSubtaskClick(subtask);
                      }
                    }}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium",
                      subtask.completed 
                        ? "bg-green-100 text-green-700 border-2 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700" 
                        : "bg-gray-100 text-gray-500 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600"
                    )}>
                      {subtask.completed ? "✓" : "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-sm font-medium",
                          subtask.completed && "line-through text-gray-500 dark:text-gray-400"
                        )}>
                          {subtask.title}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          getPriorityColor(subtask.priority)
                        )}>
                          {subtask.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {subtask.completed && (
                          <span className="text-green-600 dark:text-green-400 font-medium">✓ Completed</span>
                        )}
                        {subtask.description && (
                          <span className="truncate max-w-[200px]" title={subtask.description}>
                            {subtask.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {subtask.due_date && (
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Due
                        </div>
                        <div className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          isOverdue(subtask.due_date) && !subtask.completed
                            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                            : "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
                        )}>
                          {formatDateTime(subtask.due_date)}
                        </div>
                        {isOverdue(subtask.due_date) && !subtask.completed && (
                          <div className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">⚠ Overdue</div>
                        )}
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-1">No subtasks yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Break this task into smaller steps</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>

    {/* Delete Confirmation Dialog - Outside the main modal for proper layering */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${currentTask.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
