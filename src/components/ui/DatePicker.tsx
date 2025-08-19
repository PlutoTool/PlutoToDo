/**
 * Custom DatePicker Component
 * 
 * A cross-platform date picker built with Radix UI that provides consistent
 * behavior across all operating systems. Solves the Ubuntu/Linux issue where
 * native HTML5 date inputs don't close when clicking outside.
 * 
 * Features:
 * - Consistent behavior across Windows, macOS, and Linux
 * - Click outside to close (proper modal behavior)
 * - ESC key to close
 * - Calendar grid navigation
 * - Quick action buttons (Today, Tomorrow, Clear)
 * - Manual date input fallback
 * - Keyboard navigation support
 * - Accessible with proper ARIA labels
 * - Integrates seamlessly with existing UI design system
 * 
 * @author PlutoTool Development Team
 */

import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '../../utils/cn';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  zIndex?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date...",
  disabled = false,
  className,
  zIndex = "z-50"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );

  const selectedDate = value ? new Date(value) : null;

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        setIsOpen(false);
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get days from previous month to fill the first week
  const firstDayOfWeek = monthStart.getDay();
  const previousMonthDays = [];
  if (firstDayOfWeek > 0) {
    const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(prevMonthEnd);
      day.setDate(prevMonthEnd.getDate() - i);
      previousMonthDays.push(day);
    }
  }

  // Get days from next month to fill the last week
  const lastDayOfWeek = monthEnd.getDay();
  const nextMonthDays = [];
  if (lastDayOfWeek < 6) {
    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const day = new Date(nextMonthStart);
      day.setDate(i);
      nextMonthDays.push(day);
    }
  }

  const allDays = [...previousMonthDays, ...days, ...nextMonthDays];

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Update current month when manually typing a valid date
    if (inputValue && !isNaN(Date.parse(inputValue))) {
      setCurrentMonth(new Date(inputValue));
    }
  };

  const handleClearDate = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayValue = selectedDate ? format(selectedDate, 'MMM d, yyyy') : '';

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          type="button"
          aria-label={value ? `Selected date: ${displayValue}` : "Select a date"}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className={cn(
            "w-auto p-0 bg-background border-2 border-border rounded-lg shadow-2xl animate-in fade-in-0 zoom-in-95 backdrop-blur-sm max-h-[400px] max-w-[300px] overflow-y-auto",
            zIndex
          )}
          sideOffset={6}
          align="start"
          alignOffset={-10}
          collisionPadding={10}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={() => setIsOpen(false)}
          onPointerDownOutside={() => setIsOpen(false)}
          onFocusOutside={() => setIsOpen(false)}
        >
          <div className="p-3 bg-background rounded-lg border border-border/50">
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-3 bg-muted/30 rounded-md p-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                type="button"
                className="h-7 w-7 p-0 bg-background hover:bg-accent"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              
              <h3 className="text-xs font-semibold text-foreground">
                {format(currentMonth, 'MMM yyyy')}
              </h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                type="button"
                className="h-7 w-7 p-0 bg-background hover:bg-accent"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2 bg-muted/20 rounded-md p-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-xs font-semibold text-foreground text-center py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 bg-muted/10 rounded-md p-1.5 mb-3">
              {allDays.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateSelect(day)}
                    type="button"
                    className={cn(
                      "h-7 w-7 p-0 text-xs transition-colors bg-background hover:bg-accent border border-transparent",
                      !isCurrentMonth && "text-muted-foreground/50 bg-muted/20 hover:text-muted-foreground/70 hover:bg-muted/40",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 border-primary",
                      isCurrentDay && !isSelected && "bg-accent text-accent-foreground hover:bg-accent/80 border-accent font-semibold",
                      !isSelected && isCurrentMonth && "hover:bg-accent hover:text-accent-foreground border-border/50",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    )}
                    tabIndex={isCurrentMonth ? 0 : -1}
                  >
                    {day.getDate()}
                  </Button>
                );
              })}
            </div>

            {/* Direct input and quick actions */}
            <div className="pt-2 border-t border-border bg-muted/10 rounded-md p-2 space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateSelect(new Date())}
                  type="button"
                  className="text-xs h-7 bg-background hover:bg-accent"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    handleDateSelect(tomorrow);
                  }}
                  type="button"
                  className="text-xs h-7 bg-background hover:bg-accent"
                >
                  Tomorrow
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDate}
                  type="button"
                  className="text-xs h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  Clear
                </Button>
              </div>
              
              <details className="group">
                <summary className="text-xs font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
                  Manual input
                </summary>
                <div className="mt-2">
                  <Input
                    type="date"
                    value={value}
                    onChange={handleInputChange}
                    className="h-7 text-xs bg-background"
                  />
                </div>
              </details>
            </div>
          </div>

          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
