
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useDateFilterStore } from '@/store/useDateFilterStore';

export const DateRangeDisplay: React.FC = () => {
  const { displayText, selectedFilter, isLoading } = useDateFilterStore();

  const getFilterIcon = () => {
    switch (selectedFilter) {
      case 'today':
      case 'yesterday':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4 text-orange-500" />;
    }
  };

  const getFilterColor = () => {
    switch (selectedFilter) {
      case 'today':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'yesterday':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'last7days':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'lastMonth':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'custom':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Date Range Badge */}
      <div className={`
        inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm font-medium
        ${getFilterColor()}
        ${isLoading ? 'opacity-75' : ''}
      `}>
        {getFilterIcon()}
        <span className="whitespace-nowrap">
          {displayText}
        </span>
        {isLoading && (
          <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent opacity-60"></div>
        )}
      </div>

      {/* Additional Info for Custom Range */}
      {selectedFilter === 'custom' && !isLoading && (
        <div className="text-xs text-gray-500 hidden sm:block">
          Custom period selected
        </div>
      )}

      {/* Loading Text */}
      {isLoading && (
        <div className="text-xs text-gray-500 hidden sm:block">
          Updating data...
        </div>
      )}
    </div>
  );
};

export default DateRangeDisplay;