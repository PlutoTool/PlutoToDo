import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, parseISO } from 'date-fns';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Modal } from './ui/Modal';
import { TaskForm } from './TaskForm';
import TaskDetailModal from './TaskDetailModal';
import { DayViewModal } from './DayViewModal';
import { MonthSummary } from './MonthSummary';
import { SubtaskCompletionModal } from './SubtaskCompletionModal';
import { useTaskStore } from '../stores/taskStore';
import { useCategoryStore } from '../stores/categoryStore';
import { Task, Priority } from '../types';
import { cn } from '../utils/cn';
import { isOverdue } from '../utils/dateUtils';
import { buildTaskHierarchy, getTotalSubtaskCount, getCompletedSubtaskCount } from '../utils/taskHierarchy';

interface CalendarViewProps {
  tasks?: Task[];
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onAddSubtask?: (parentTask: Task) => void;
  selectedTasks?: Set<string>;
  onToggleTaskSelect?: (taskId: string) => void;
}

interface DraggedTask {
  task: Task;
  sourceDate: Date | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks: propTasks,
  onEditTask,
  onDeleteTask,
  selectedTasks = new Set(),
  onToggleTaskSelect
}) => {
  const { 
    tasks: storeTasks, 
    updateTask, 
    toggleTaskCompletion, 
    getIncompleteSubtasks,
    toggleTaskCompletionWithSubtasks
  } = useTaskStore();
  const { categories } = useCategoryStore();
  
  // Use provided tasks or fall back to store tasks
  const tasks = propTasks || storeTasks;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [showDayView, setShowDayView] = useState(false);
  const [dayViewDate, setDayViewDate] = useState<Date | null>(null);
  const [fromDayView, setFromDayView] = useState(false); // Track if task form was opened from day view
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set()); // Track collapsed parent tasks
  
  // Subtask completion modal state
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [incompleteSubtasks, setIncompleteSubtasks] = useState<Task[]>([]);
  const [currentTaskForModal, setCurrentTaskForModal] = useState<Task | null>(null);
  
  const dragOverlay = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousMonth();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextMonth();
          break;
        case 't':
        case 'T':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            goToToday();
          }
          break;
        case 'n':
        case 'N':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            handleCreateTask(new Date());
          }
          break;
        case 'h':
        case 'H':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setShowCompletedTasks(!showCompletedTasks);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCompletedTasks]);

  // Generate calendar days with hierarchical task organization
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    
    // Get first day of the week (Sunday) for the calendar grid
    const startDate = new Date(start);
    startDate.setDate(start.getDate() - start.getDay());
    
    // Get last day of the week (Saturday) for the calendar grid
    const endDate = new Date(end);
    endDate.setDate(end.getDate() + (6 - end.getDay()));
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(date => {
      // Get all tasks for this date
      const dayTasks = tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = parseISO(task.due_date);
        const isTaskOnDate = isSameDay(taskDate, date);
        if (!isTaskOnDate) return false;
        // Filter completed tasks if toggle is off
        if (!showCompletedTasks && task.completed) return false;
        return true;
      });

      // Build complete task hierarchy for this day
      const taskHierarchy = buildTaskHierarchy(dayTasks);
      
      // Separate root tasks from orphaned subtasks
      const rootTasks = dayTasks.filter(task => !task.parent_id);
      const allSubtasks = dayTasks.filter(task => task.parent_id);
      
      // Find orphaned subtasks (subtasks whose parents are not on this date)
      const orphanedSubtasks = allSubtasks.filter(subtask => 
        !dayTasks.some(task => task.id === subtask.parent_id)
      );

      // Create enhanced task groups with recursive subtask counting
      const taskGroups = rootTasks.map(parent => {
        const totalSubtasks = getTotalSubtaskCount(parent.id, tasks);
        const completedSubtasks = getCompletedSubtaskCount(parent.id, tasks);
        return {
          parent,
          hierarchy: taskHierarchy.find(h => h.task.id === parent.id),
          totalSubtasks,
          completedSubtasks
        };
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        tasks: dayTasks,
        taskGroups,
        orphanedSubtasks,
        taskHierarchy
      };
    });
  }, [currentDate, tasks, showCompletedTasks]);

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Task creation handler
  const handleCreateTask = (date: Date) => {
    // Save current scroll position
    const scrollContainer = document.querySelector('main .overflow-auto');
    if (scrollContainer) {
      scrollPositionRef.current = scrollContainer.scrollTop;
    }
    setSelectedDate(date);
    setShowTaskForm(true);
    setFromDayView(false); // Regular task creation
  };

  // Task creation from day view modal
  const handleCreateTaskFromDayView = (date: Date) => {
    setSelectedDate(date);
    setShowTaskForm(true);
    setFromDayView(true); // Track that this came from day view
    setShowDayView(false); // Temporarily hide day view
  };

  const handleTaskFormSubmit = () => {
    setShowTaskForm(false);
    setSelectedDate(null);
    
    if (fromDayView) {
      // If came from day view, close day view as well (task was created successfully)
      setShowDayView(false);
      setDayViewDate(null);
      setFromDayView(false);
    }
    
    // Restore scroll position after a short delay to allow modal to close
    setTimeout(() => {
      const scrollContainer = document.querySelector('main .overflow-auto');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollPositionRef.current;
      }
    }, 100);
  };

  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setSelectedDate(null);
    
    if (fromDayView) {
      // If came from day view and cancelled, return to day view
      setShowDayView(true);
      setFromDayView(false);
    }
  };

  // Task interaction handlers
  const handleTaskClick = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  // Handle subtask click from task detail modal
  const handleSubtaskClick = (subtask: Task) => {
    setSelectedTask(subtask);
    // Keep the modal open but show the subtask details
  };

  // Handle parent task click from task detail modal
  const handleParentTaskClick = (parentTask: Task) => {
    setSelectedTask(parentTask);
    // Keep the modal open but show the parent task details
  };

  const handleTaskEdit = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    onEditTask?.(task);
  };

  const handleTaskDelete = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteTask?.(task.id);
  };

  const handleTaskToggleComplete = async (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      // Check if this task is being marked as complete and has incomplete subtasks
      if (!task.completed) {
        const hasSubtasks = tasks.some(t => t.parent_id === task.id);
        if (hasSubtasks) {
          const incomplete = await getIncompleteSubtasks(task.id);
          if (incomplete.length > 0) {
            // Show the modal to ask user what to do
            setIncompleteSubtasks(incomplete);
            setCurrentTaskForModal(task);
            setShowSubtaskModal(true);
            return; // Don't complete the task yet
          }
        }
      }
      
      // If no incomplete subtasks or task is being marked as incomplete, proceed normally
      await toggleTaskCompletion(task.id);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleSubtaskModalConfirm = async (markAllDone: boolean) => {
    try {
      if (currentTaskForModal) {
        await toggleTaskCompletionWithSubtasks(currentTaskForModal.id, markAllDone);
      }
    } catch (error) {
      console.error('Failed to toggle task completion with subtasks:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (task: Task, sourceDate: Date | null) => (event: React.DragEvent) => {
    setDraggedTask({ task, sourceDate });
    event.dataTransfer.effectAllowed = 'move';
    
    // Create custom drag image
    if (dragOverlay.current) {
      dragOverlay.current.textContent = task.title;
      dragOverlay.current.style.display = 'block';
      event.dataTransfer.setDragImage(dragOverlay.current, 0, 0);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setHoveredDate(null);
    if (dragOverlay.current) {
      dragOverlay.current.style.display = 'none';
    }
  };

  const handleDragOver = (date: Date) => (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setHoveredDate(date);
  };

  const handleDragLeave = () => {
    setHoveredDate(null);
  };

  const handleDrop = (targetDate: Date) => async (event: React.DragEvent) => {
    event.preventDefault();
    setHoveredDate(null);
    
    if (!draggedTask) return;
    
    const newDueDate = new Date(targetDate);
    newDueDate.setHours(23, 59, 59); // End of day
    
    try {
      await updateTask(draggedTask.task.id, {
        due_date: newDueDate.toISOString()
      });
    } catch (error) {
      console.error('Failed to update task due date:', error);
    }
    
    setDraggedTask(null);
  };

  // Toggle collapse/expand for parent tasks
  const toggleGroupCollapse = (parentId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  // Render parent task with modern styling and multi-level nesting
  const renderParentTask = (parent: Task, hierarchy: any, totalSubtasks: number, completedSubtasks: number) => {
    const category = categories.find(cat => cat.id === parent.category_id);
    const isSelected = selectedTasks.has(parent.id);
    const isCollapsed = collapsedGroups.has(parent.id);
    const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const hasVisibleSubtasks = hierarchy && hierarchy.children && hierarchy.children.length > 0;

    return (
      <div key={parent.id} className="mb-2">
        {/* Parent Task */}
        <div
          draggable
          onDragStart={handleDragStart(parent, new Date())}
          onDragEnd={handleDragEnd}
          className={cn(
            "group relative rounded-lg text-xs cursor-pointer transition-all duration-200",
            "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border border-blue-600/20",
            parent.completed && "from-gray-400 to-gray-500 bg-gray-400",
            isOverdue(parent.due_date || '') && !parent.completed && "from-red-500 to-red-600",
            isSelected && "ring-2 ring-blue-300 dark:ring-blue-600",
            "hover:shadow-md hover:scale-[1.01] active:scale-95",
            // Priority-based colors when not overdue
            !isOverdue(parent.due_date || '') && !parent.completed && parent.priority === Priority.High && "from-red-500 to-red-600",
            !isOverdue(parent.due_date || '') && !parent.completed && parent.priority === Priority.Medium && "from-yellow-500 to-yellow-600",
            !isOverdue(parent.due_date || '') && !parent.completed && parent.priority === Priority.Low && "from-green-500 to-green-600",
          )}
          onClick={(e) => handleTaskClick(parent, e)}
        >
          <div className="px-3 py-2.5 rounded-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleTaskToggleComplete(parent, e)}
                className="flex-shrink-0 hover:scale-110 transition-transform rounded-full"
              >
                {parent.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-white/80 hover:text-white" />
                )}
              </button>
              
              <span className={cn(
                "font-semibold leading-tight flex-1 text-white text-xs break-words",
                parent.completed && "line-through opacity-75"
              )}>
                {parent.title}
              </span>
              
              {/* Collapse/Expand button for subtasks */}
              {hasVisibleSubtasks && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupCollapse(parent.id);
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="w-3 h-3 text-white" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-white" />
                  )}
                </button>
              )}
              
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => handleTaskEdit(parent, e)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Edit task"
                >
                  <Edit className="w-3 h-3 text-white" />
                </button>
                <button
                  onClick={(e) => handleTaskDelete(parent, e)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
            
            {/* Progress bar and category */}
            <div className="mt-2 space-y-1.5">
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-white rounded-full h-1.5 transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/90 font-medium">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}
              
              {category && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  <span className="text-xs text-white/80 truncate">
                    {category.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recursive Subtasks */}
        {hasVisibleSubtasks && !isCollapsed && (
          <div className="mt-1.5 ml-4 space-y-1 relative">
            {/* Connecting line */}
            <div className="absolute -left-2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
            
            {hierarchy.children.map((childHierarchy: any) => (
              <div key={childHierarchy.task.id} className="relative">
                {/* Horizontal connector */}
                <div className="absolute -left-2 top-3 w-2 h-px bg-gray-300 dark:bg-gray-600" />
                
                {renderTaskHierarchy(childHierarchy, childHierarchy.depth)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Recursive function to render task hierarchy at any depth
  const renderTaskHierarchy = (taskHierarchy: any, depth: number = 0) => {
    const task = taskHierarchy.task;
    const hasChildren = taskHierarchy.children && taskHierarchy.children.length > 0;
    
    // For depth 0, render as parent task
    if (depth === 0) {
      const totalSubtasks = getTotalSubtaskCount(task.id, tasks);
      const completedSubtasks = getCompletedSubtaskCount(task.id, tasks);
      return renderParentTask(task, taskHierarchy, totalSubtasks, completedSubtasks);
    }
    
    // For depth > 0, render as nested subtask
    const category = categories.find(cat => cat.id === task.category_id);
    const isSelected = selectedTasks.has(task.id);
    const isCollapsed = collapsedGroups.has(task.id);
    const totalSubtasks = getTotalSubtaskCount(task.id, tasks);
    const completedSubtasks = getCompletedSubtaskCount(task.id, tasks);
    const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    return (
      <div key={task.id} className="mb-1">
        <div
          draggable
          onDragStart={handleDragStart(task, new Date())}
          onDragEnd={handleDragEnd}
          className={cn(
            "group relative rounded-md text-xs cursor-pointer transition-all duration-150",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm",
            task.completed && "bg-gray-50 dark:bg-gray-800/50 opacity-70",
            isOverdue(task.due_date || '') && !task.completed && "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20",
            isSelected && "ring-2 ring-blue-300 dark:ring-blue-600",
            "hover:shadow-md hover:scale-[1.01] active:scale-95",
            // Add visual depth indicators
            depth > 1 && "ml-2 border-l-2 border-blue-200 dark:border-blue-700",
          )}
          onClick={(e) => handleTaskClick(task, e)}
          title={`${task.title}${task.description ? ' - ' + task.description : ''}${category ? ' | ' + category.name : ''}`}
        >
          <div className="px-2.5 py-2 rounded-md">
            <div className="flex items-center gap-2">
              {/* Collapse/expand for subtasks */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupCollapse(task.id);
                  }}
                  className="flex-shrink-0 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title={isCollapsed ? 'Expand subtasks' : 'Collapse subtasks'}
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              )}
              
              <button
                onClick={(e) => handleTaskToggleComplete(task, e)}
                className="flex-shrink-0 hover:scale-110 transition-transform rounded-full"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "font-medium leading-tight text-gray-900 dark:text-gray-100 text-xs break-words block",
                  task.completed && "line-through opacity-75 text-gray-500 dark:text-gray-400"
                )}>
                  {task.title}
                </span>
                
                {/* Progress indicator for tasks with subtasks */}
                {totalSubtasks > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-500 rounded-full h-1 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {completedSubtasks}/{totalSubtasks}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => handleTaskEdit(task, e)}
                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Edit subtask"
                >
                  <Edit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => handleTaskDelete(task, e)}
                  className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Delete subtask"
                >
                  <Trash2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {category && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recursive children */}
        {hasChildren && !isCollapsed && (
          <div className="mt-1 ml-4 space-y-1 relative">
            {/* Connecting line */}
            <div className="absolute -left-2 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
            
            {taskHierarchy.children.map((childHierarchy: any) => (
              <div key={childHierarchy.task.id} className="relative">
                {/* Horizontal connector */}
                <div className="absolute -left-2 top-3 w-2 h-px bg-gray-300 dark:bg-gray-600" />
                
                {renderTaskHierarchy(childHierarchy, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render subtask with modern styling
  const renderSubtask = (task: Task) => {
    const category = categories.find(cat => cat.id === task.category_id);
    const isSelected = selectedTasks.has(task.id);

    return (
      <div
        draggable
        onDragStart={handleDragStart(task, new Date())}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative rounded-md text-xs cursor-pointer transition-all duration-150",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm",
          task.completed && "bg-gray-50 dark:bg-gray-800/50 opacity-70",
          isOverdue(task.due_date || '') && !task.completed && "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20",
          isSelected && "ring-2 ring-blue-300 dark:ring-blue-600",
          "hover:shadow-md hover:scale-[1.01] active:scale-95",
        )}
        onClick={(e) => handleTaskClick(task, e)}
        title={`${task.title}${task.description ? ' - ' + task.description : ''}${category ? ' | ' + category.name : ''}`}
      >
        <div className="px-2.5 py-2 rounded-md">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleTaskToggleComplete(task, e)}
              className="flex-shrink-0 hover:scale-110 transition-transform rounded-full"
            >
              {task.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
              )}
            </button>
            
            <span className={cn(
              "font-medium leading-tight flex-1 text-gray-900 dark:text-gray-100 text-xs break-words",
              task.completed && "line-through opacity-75 text-gray-500 dark:text-gray-400"
            )}>
              {task.title}
            </span>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => handleTaskEdit(task, e)}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Edit subtask"
              >
                <Edit className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={(e) => handleTaskDelete(task, e)}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Delete subtask"
              >
                <Trash2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {category && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {category.name}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render orphaned subtask (parent not on this date)
  const renderOrphanedSubtask = (task: Task) => {
    const parentTask = tasks.find(t => t.id === task.parent_id);
    const category = categories.find(cat => cat.id === task.category_id);
    const isSelected = selectedTasks.has(task.id);

    return (
      <div key={task.id} className="mb-1.5">
        <div
          draggable
          onDragStart={handleDragStart(task, new Date())}
          onDragEnd={handleDragEnd}
          className={cn(
            "group relative rounded-md text-xs cursor-pointer transition-all duration-150",
            "bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100",
            task.completed && "bg-gray-100 dark:bg-gray-800 opacity-70 text-gray-500 dark:text-gray-400",
            isOverdue(task.due_date || '') && !task.completed && "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800",
            isSelected && "ring-2 ring-blue-300 dark:ring-blue-600",
            "hover:shadow-md hover:scale-[1.01] active:scale-95",
          )}
          onClick={(e) => handleTaskClick(task, e)}
          title={`Subtask of "${parentTask?.title || 'Unknown'}" - ${task.title}${task.description ? ' - ' + task.description : ''}${category ? ' | ' + category.name : ''}`}
        >
          <div className="px-2.5 py-2 rounded-md">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
              
              <button
                onClick={(e) => handleTaskToggleComplete(task, e)}
                className="flex-shrink-0 hover:scale-110 transition-transform rounded-full"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "font-medium leading-tight text-amber-900 dark:text-amber-100 text-xs break-words block",
                  task.completed && "line-through opacity-75"
                )}>
                  {task.title}
                </span>
                {parentTask && (
                  <span className="text-xs text-amber-700 dark:text-amber-300 opacity-75">
                    from "{parentTask.title}"
                  </span>
                )}
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
                <button
                  onClick={(e) => handleTaskEdit(task, e)}
                  className="p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-colors"
                  title="Edit subtask"
                >
                  <Edit className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                </button>
                <button
                  onClick={(e) => handleTaskDelete(task, e)}
                  className="p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded transition-colors"
                  title="Delete subtask"
                >
                  <Trash2 className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                </button>
              </div>
            </div>
            
            {category && (
              <div className="mt-1.5 flex items-center gap-1.5 ml-5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-xs text-amber-700 dark:text-amber-300 truncate">
                  {category.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col w-full max-w-none">
      {/* Custom drag overlay */}
      <div
        ref={dragOverlay}
        className="fixed pointer-events-none bg-primary text-primary-foreground px-2 py-1 rounded shadow-lg text-sm z-50"
        style={{ display: 'none', top: -1000, left: -1000 }}
      />
      
      {/* Month Summary */}
      <MonthSummary tasks={tasks} currentDate={currentDate} />
      
      {/* Calendar Header with macOS styling */}
      <Card className="mb-6 shadow-sm border-0 bg-white dark:bg-gray-900">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {tasks.filter(t => t.due_date).length} scheduled tasks
                {tasks.filter(t => t.due_date && isOverdue(t.due_date) && !t.completed).length > 0 && (
                  <span className="text-red-500 ml-2 font-medium">
                    • {tasks.filter(t => t.due_date && isOverdue(t.due_date) && !t.completed).length} overdue
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                className={cn(
                  "text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
                  showCompletedTasks ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                )}
                title="Toggle completed tasks visibility (H)"
              >
                {showCompletedTasks ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                <span className="hidden sm:inline">{showCompletedTasks ? 'Hide' : 'Show'} Complete</span>
                <span className="sm:hidden">{showCompletedTasks ? 'Hide' : 'Show'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                title="Go to today (T)"
              >
                Today
              </Button>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  title="Previous month (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 py-1 text-sm font-semibold min-w-[120px] sm:min-w-[140px] text-center text-gray-900 dark:text-gray-100">
                  <span className="hidden sm:inline">{format(currentDate, 'MMMM yyyy')}</span>
                  <span className="sm:hidden">{format(currentDate, 'MMM yyyy')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  title="Next month (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="flex-1 shadow-sm border-0 bg-white dark:bg-gray-900">
        <CardContent className="p-0">
          {/* Days of week header - macOS style */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
              <div
                key={day}
                className={`
                  py-3 px-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800
                  ${index === 0 ? 'border-r border-gray-200 dark:border-gray-700' : ''}
                  ${index === 6 ? '' : 'border-r border-gray-200 dark:border-gray-700'}
                `}
              >
                <span className="hidden lg:inline">{day}</span>
                <span className="hidden sm:inline lg:hidden">{day.slice(0, 3)}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 bg-white dark:bg-gray-900 min-h-[600px]">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "h-[160px] sm:h-[180px] lg:h-[200px] border-r border-b border-gray-200 dark:border-gray-700 p-3 transition-all duration-150 relative group flex flex-col",
                  !day.isCurrentMonth && "bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500",
                  day.isCurrentMonth && "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                  day.isToday && "bg-blue-50 dark:bg-blue-900/20",
                  hoveredDate && isSameDay(hoveredDate, day.date) && "bg-blue-100 dark:bg-blue-800/30",
                  "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer",
                  draggedTask && "hover:bg-blue-100 dark:hover:bg-blue-800/30",
                  (index + 1) % 7 === 0 && "border-r-0" // Remove right border on last column
                )}
                onDragOver={handleDragOver(day.date)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(day.date)}
                onClick={() => handleCreateTask(day.date)}
              >
                {/* Date number with macOS style */}
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full transition-all",
                    day.isToday && "bg-blue-600 text-white shadow-sm font-semibold",
                    !day.isToday && !day.isCurrentMonth && "text-gray-400 dark:text-gray-500",
                    !day.isToday && day.isCurrentMonth && "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                    {format(day.date, 'd')}
                  </span>
                  
                  {day.tasks.length > 0 && (
                    <div className="flex items-center gap-1">
                      {day.tasks.some(task => isOverdue(task.due_date || '') && !task.completed) && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {day.tasks.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tasks for this day with hierarchical organization */}
                <div className="flex-1 overflow-hidden">
                  <div className="space-y-2 h-full overflow-y-auto">
                    {/* Render parent tasks with their hierarchical subtasks */}
                    {day.taskGroups
                      .sort((a, b) => {
                        // Sort by parent completion status first, then by priority
                        if (a.parent.completed !== b.parent.completed) {
                          return a.parent.completed ? 1 : -1;
                        }
                        const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                        return priorityOrder[b.parent.priority] - priorityOrder[a.parent.priority];
                      })
                      .map((group) => {
                        // Use the hierarchy if available, otherwise render as simple parent task
                        if (group.hierarchy) {
                          return renderTaskHierarchy(group.hierarchy, 0);
                        } else {
                          return renderParentTask(
                            group.parent, 
                            null,
                            group.totalSubtasks, 
                            group.completedSubtasks
                          );
                        }
                      })
                    }
                    
                    {/* Render orphaned subtasks */}
                    {day.orphanedSubtasks
                      .sort((a, b) => {
                        if (a.completed !== b.completed) {
                          return a.completed ? 1 : -1;
                        }
                        const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                      })
                      .map((task) => renderOrphanedSubtask(task))
                    }

                    {/* Show "more" indicator if there are too many items */}
                    {(day.taskGroups.length + day.orphanedSubtasks.length) > 4 && (
                      <div
                        className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0 text-center font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDayViewDate(day.date);
                          setShowDayView(true);
                        }}
                        title={`View all ${day.tasks.length} tasks for this day`}
                      >
                        <MoreHorizontal className="w-3 h-3 mx-auto" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Add task button with macOS styling */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTask(day.date);
                  }}
                  className={cn(
                    "absolute top-2 right-2 w-5 h-5 rounded-full transition-all duration-150",
                    "opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600",
                    "text-white shadow-sm hover:shadow-md",
                    "flex items-center justify-center"
                  )}
                  title={`Add task for ${format(day.date, 'MMM d')}`}
                >
                  <Plus className="w-3 h-3" />
                </button>

                {/* Drag drop indicator with macOS styling */}
                {hoveredDate && isSameDay(hoveredDate, day.date) && draggedTask && (
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-500 rounded flex items-center justify-center">
                    <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium">
                      Drop here
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Form Modal */}
      {showTaskForm && selectedDate && (
        <Modal
          isOpen={showTaskForm}
          onClose={handleTaskFormCancel}
          title={`Create Task for ${format(selectedDate, 'MMM d, yyyy')}`}
        >
          <TaskForm
            initialDueDate={selectedDate.toISOString()}
            onSubmit={handleTaskFormSubmit}
            onCancel={handleTaskFormCancel}
          />
        </Modal>
      )}

      {/* Day View Modal */}
      {showDayView && dayViewDate && (
        <DayViewModal
          isOpen={showDayView}
          onClose={() => {
            setShowDayView(false);
            setDayViewDate(null);
          }}
          date={dayViewDate}
          tasks={tasks.filter(task => {
            if (!task.due_date) return false;
            const taskDate = parseISO(task.due_date);
            const isTaskOnDate = isSameDay(taskDate, dayViewDate);
            if (!isTaskOnDate) return false;
            // Filter completed tasks if toggle is off
            if (!showCompletedTasks && task.completed) return false;
            return true;
          })}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onTaskClick={(task: Task) => {
            // Simulate event for consistency with existing handler
            const mockEvent = {
              stopPropagation: () => {}
            } as React.MouseEvent;
            handleTaskClick(task, mockEvent);
          }}
          selectedTasks={selectedTasks}
          onCreateTask={(date: Date) => {
            handleCreateTaskFromDayView(date);
          }}
          onToggleTaskSelect={onToggleTaskSelect}
        />
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={showTaskDetail}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          onSubtaskClick={handleSubtaskClick}
          onParentClick={handleParentTaskClick}
          zIndex="z-[60]"
        />
      )}

      {/* Subtask Completion Modal */}
      {currentTaskForModal && (
        <SubtaskCompletionModal
          isOpen={showSubtaskModal}
          onClose={() => {
            setShowSubtaskModal(false);
            setCurrentTaskForModal(null);
          }}
          onConfirm={handleSubtaskModalConfirm}
          taskTitle={currentTaskForModal.title}
          incompleteCount={incompleteSubtasks.length}
          incompleteSubtasks={incompleteSubtasks.map((subtask, index) => ({
            id: subtask.id,
            title: subtask.title,
            depth: index // This could be calculated better with actual depth
          }))}
        />
      )}
    </div>
  );
};