import React, { useState } from 'react';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortField, SortOrder } from '../types';
import { useTaskStore } from '../stores/taskStore';

export const SortDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { sortConfig, setSortConfig } = useTaskStore();

  const sortOptions = [
    { field: SortField.Title, label: 'Name', shortLabel: 'Name' },
    { field: SortField.DueDate, label: 'Due Date', shortLabel: 'Due' },
    { field: SortField.CreatedAt, label: 'Created Date', shortLabel: 'Created' },
    { field: SortField.UpdatedAt, label: 'Updated Date', shortLabel: 'Updated' },
    { field: SortField.Priority, label: 'Priority', shortLabel: 'Priority' },
    { field: SortField.Completed, label: 'Status', shortLabel: 'Status' },
  ];

  const handleSortChange = (field: SortField) => {
    const newOrder = 
      sortConfig.field === field && sortConfig.order === SortOrder.Asc 
        ? SortOrder.Desc 
        : SortOrder.Asc;
    
    setSortConfig({ field, order: newOrder });
    setIsOpen(false);
  };

  const getCurrentSortLabel = (useShort = false) => {
    const option = sortOptions.find(opt => opt.field === sortConfig.field);
    return useShort ? (option?.shortLabel || 'Sort') : (option?.label || 'Sort');
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    return sortConfig.order === SortOrder.Asc 
      ? <ArrowUp className="w-4 h-4 text-blue-500" />
      : <ArrowDown className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-0"
      >
        {getSortIcon(sortConfig.field)}
        {/* Show short label on small screens, full label on larger screens */}
        <span className="hidden sm:inline truncate">{getCurrentSortLabel()}</span>
        <span className="sm:hidden truncate">{getCurrentSortLabel(true)}</span>
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
            <div className="py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                >
                  <span className={sortConfig.field === option.field ? 'font-medium text-blue-600 dark:text-blue-400' : ''}>
                    {option.label}
                  </span>
                  {getSortIcon(option.field)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
