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
  EyeOff
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, parseISO } from 'date-fns';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Modal } from './ui/Modal';
import { TaskForm } from './TaskForm';
import TaskDetailModal from './TaskDetailModal';
import { DayViewModal } from './DayViewModal';
import { MonthSummary } from './MonthSummary';
import { useTaskStore } from '../stores/taskStore';
import { useCategoryStore } from '../stores/categoryStore';
import { Task, Priority } from '../types';
import { cn } from '../utils/cn';
import { isOverdue } from '../utils/dateUtils';

interface CalendarViewProps {
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
  onEditTask,
  onDeleteTask,
  selectedTasks = new Set(),
  onToggleTaskSelect
}) => {
  const { tasks, updateTask, toggleTaskCompletion } = useTaskStore();
  const { categories } = useCategoryStore();
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

  // Generate calendar days for the current month
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
    
    return days.map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      tasks: tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = parseISO(task.due_date);
        const isTaskOnDate = isSameDay(taskDate, date);
        if (!isTaskOnDate) return false;
        // Filter completed tasks if toggle is off
        if (!showCompletedTasks && task.completed) return false;
        return true;
      })
    }));
  }, [currentDate, tasks]);

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
      await toggleTaskCompletion(task.id);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
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

  // Render task item in calendar day - macOS style
  const renderTaskItem = (task: Task, dayTasks: Task[], index: number) => {
    const category = categories.find(cat => cat.id === task.category_id);
    const isSelected = selectedTasks.has(task.id);
    const maxVisible = window.innerWidth < 640 ? 2 : 3;
    const showMore = index >= maxVisible;
    
    if (showMore && index === maxVisible) {
      const remainingCount = dayTasks.length - maxVisible;
      return (
        <div
          key="more"
          className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0 text-center font-medium"
          onClick={(e) => {
            e.stopPropagation();
            const dayDate = parseISO(dayTasks[0].due_date || '');
            setDayViewDate(dayDate);
            setShowDayView(true);
          }}
          title={`${remainingCount} more tasks on this day`}
        >
          +{remainingCount} more
        </div>
      );
    }
    
    if (showMore) return null;

    return (
      <div
        key={task.id}
        draggable
        onDragStart={handleDragStart(task, new Date())}
        onDragEnd={handleDragEnd}
        className={cn(
          "group relative mb-1.5 rounded-md text-xs cursor-pointer transition-all duration-150",
          "bg-blue-500 text-white shadow-sm",
          task.completed && "bg-gray-400 dark:bg-gray-600 opacity-70",
          isOverdue(task.due_date || '') && !task.completed && "bg-red-500",
          isSelected && "ring-2 ring-blue-300 dark:ring-blue-600",
          "hover:shadow-md hover:scale-[1.02] active:scale-95",
          // Priority-based colors when not overdue
          !isOverdue(task.due_date || '') && !task.completed && task.priority === Priority.High && "bg-red-500",
          !isOverdue(task.due_date || '') && !task.completed && task.priority === Priority.Medium && "bg-yellow-500",
          !isOverdue(task.due_date || '') && !task.completed && task.priority === Priority.Low && "bg-green-500",
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
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-white/80 hover:text-white" />
              )}
            </button>
            
            <span className={cn(
              "font-medium leading-tight flex-1 text-white text-xs break-words",
              task.completed && "line-through opacity-75"
            )}>
              {task.title}
            </span>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity flex-shrink-0">
              <button
                onClick={(e) => handleTaskEdit(task, e)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
                title="Edit task"
              >
                <Edit className="w-3 h-3 text-white" />
              </button>
              <button
                onClick={(e) => handleTaskDelete(task, e)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
          
          {category && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div 
                className="w-1.5 h-1.5 rounded-full bg-white/60"
              />
              <span className="text-xs text-white/80 truncate">
                {category.name}
              </span>
            </div>
          )}
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

                {/* Tasks for this day with macOS styling */}
                <div className="flex-1 overflow-hidden">
                  <div className="space-y-1.5 h-full overflow-y-auto">
                    {day.tasks
                      .sort((a, b) => {
                        // Sort by priority, then by completion status
                        const priorityOrder = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
                        if (a.completed !== b.completed) {
                          return a.completed ? 1 : -1;
                        }
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                      })
                      .map((task, taskIndex) => renderTaskItem(task, day.tasks, taskIndex))
                    }
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
            return isSameDay(taskDate, dayViewDate);
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
          zIndex="z-[60]"
        />
      )}
    </div>
  );
};