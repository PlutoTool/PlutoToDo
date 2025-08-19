import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { CheckCircle2, Clock, AlertTriangle, Target } from 'lucide-react';
import { Task } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { isOverdue } from '../utils/dateUtils';

interface MonthSummaryProps {
  tasks: Task[];
  currentDate: Date;
}

export const MonthSummary: React.FC<MonthSummaryProps> = ({ tasks, currentDate }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Filter tasks for current month
  const monthTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
  });

  const completed = monthTasks.filter(task => task.completed).length;
  const pending = monthTasks.filter(task => !task.completed).length;
  const overdue = monthTasks.filter(task => !task.completed && isOverdue(task.due_date || '')).length;
  const total = monthTasks.length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: total,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30'
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    }
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span className="hidden sm:inline">Month Overview</span>
          <span className="sm:hidden">Overview</span>
          <div className="text-sm font-normal text-muted-foreground">
            {completionRate}% complete
          </div>
        </CardTitle>
        {total > 0 && (
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {stats.map(stat => (
            <div 
              key={stat.label}
              className={`${stat.bgColor} rounded-lg p-2 sm:p-3 border border-border/50`}
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
