import React from 'react';
import type { TransactionType } from '../../db/types';
import { useCategories } from '../../hooks/useCategories';
import { ChevronLeft, ChevronRight, Search, Calendar, Filter, X } from 'lucide-react';
import { formatMonthYear, addMonths, subMonths } from '../../utils/date';

interface TransactionFilterProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  isAllTime: boolean;
  onToggleAllTime: (isAll: boolean) => void;
  typeFilter: 'all' | TransactionType;
  onTypeFilterChange: (type: 'all' | TransactionType) => void;
  categoryIdFilter: string;
  onCategoryFilterChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export const TransactionFilter: React.FC<TransactionFilterProps> = ({
  currentDate,
  onDateChange,
  isAllTime,
  onToggleAllTime,
  typeFilter,
  onTypeFilterChange,
  categoryIdFilter,
  onCategoryFilterChange,
  searchQuery,
  onSearchQueryChange,
}) => {
  const { categories } = useCategories(typeFilter === 'all' ? undefined : typeFilter);

  const handlePrevMonth = () => {
    onDateChange(subMonths(currentDate, 1));
    if (isAllTime) onToggleAllTime(false);
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
    if (isAllTime) onToggleAllTime(false);
  };

  const handleCurrentMonth = () => {
    onDateChange(new Date());
    if (isAllTime) onToggleAllTime(false);
  };

  return (
    <div className="space-y-3.5 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tháng trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleCurrentMonth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              !isAllTime
                ? 'text-slate-800 bg-slate-100 hover:bg-slate-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="capitalize">{formatMonthYear(currentDate)}</span>
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tháng sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* All time toggle */}
        <button
          type="button"
          onClick={() => onToggleAllTime(!isAllTime)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
            isAllTime
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {isAllTime ? 'Đang xem: Tất cả' : 'Xem toàn bộ thời gian'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm theo ghi chú hoặc số tiền..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl pl-9 pr-8 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Row: Type + Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        {/* Type Segments */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl shrink-0 self-start">
          <button
            type="button"
            onClick={() => {
              onTypeFilterChange('all');
              onCategoryFilterChange('all');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => {
              onTypeFilterChange('expense');
              onCategoryFilterChange('all');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              typeFilter === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khoản chi
          </button>
          <button
            type="button"
            onClick={() => {
              onTypeFilterChange('income');
              onCategoryFilterChange('all');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              typeFilter === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khoản thu
          </button>
        </div>

        {/* Category Filter Select */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onCategoryFilterChange('all')}
            className={`text-xs px-3 py-1.5 rounded-xl shrink-0 font-medium border transition-colors cursor-pointer ${
              categoryIdFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryFilterChange(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl shrink-0 font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                categoryIdFilter === cat.id
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
