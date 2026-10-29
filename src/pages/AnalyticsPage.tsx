import React, { useState } from 'react';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { MonthlyBarChart } from '../components/dashboard/MonthlyBarChart';
import { useCategoryStats } from '../hooks/useCategoryStats';
import { useSummary } from '../hooks/useSummary';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '../utils/currency';
import { formatMonthYear, addMonths, subMonths } from '../utils/date';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Award,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';
import { CategoryIcon } from '../components/category/CategoryIcon';

export const AnalyticsPage: React.FC = () => {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const summary = useSummary(year, monthIndex);
  const expenseStats = useCategoryStats('expense', year, monthIndex);
  const incomeStats = useCategoryStats('income', year, monthIndex);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleCurrentMonth = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const avgDailyExpense = Math.round(summary.totalExpense / daysInMonth);
  const topExpenseCategory = expenseStats[0];
  const topIncomeCategory = incomeStats[0];

  return (
    <div className="space-y-5">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Thống Kê & Phân Tích
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo chi tiết luồng tiền, xu hướng và tỷ trọng chi tiêu
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCurrentMonth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="capitalize">{formatMonthYear(currentDate)}</span>
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Metric Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-white border-slate-200/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Chi tiêu TB / ngày
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-800">
                {formatCurrency(avgDailyExpense, settings.currency)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Dựa trên {daysInMonth} ngày của {formatMonthYear(currentDate)}
          </p>
        </Card>

        <Card className="bg-white border-slate-200/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Chi nhiều nhất vào
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-800 truncate block max-w-[180px]">
                {topExpenseCategory ? topExpenseCategory.categoryName : 'Chưa có'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {topExpenseCategory
              ? `${formatCurrency(topExpenseCategory.amount, settings.currency)} (${topExpenseCategory.percentage}%)`
              : 'Chưa có khoản chi nào'}
          </p>
        </Card>

        <Card className="bg-white border-slate-200/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CircleDollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Nguồn thu lớn nhất
              </span>
              <span className="text-lg sm:text-xl font-bold text-slate-800 truncate block max-w-[180px]">
                {topIncomeCategory ? topIncomeCategory.categoryName : 'Chưa có'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {topIncomeCategory
              ? `${formatCurrency(topIncomeCategory.amount, settings.currency)} (${topIncomeCategory.percentage}%)`
              : 'Chưa có khoản thu nào'}
          </p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <MonthlyBarChart />
        </div>
        <div className="lg:col-span-5">
          <ExpensePieChart year={year} monthIndex={monthIndex} />
        </div>
      </div>

      {/* Category Leaderboards Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Expenses List */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <CardTitle className="text-rose-700">Chi tiết Hạng mục Chi</CardTitle>
            <span className="text-xs font-bold text-rose-600">
              Tổng: {formatCurrency(summary.totalExpense, settings.currency)}
            </span>
          </CardHeader>

          {expenseStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có chi tiêu trong tháng</p>
          ) : (
            <div className="space-y-3">
              {expenseStats.map((item, idx) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-500 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        <CategoryIcon name={item.icon} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-700">{item.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {formatCurrency(item.amount, settings.currency)}
                      </span>
                      <span className="text-slate-400 font-medium w-9 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Incomes List */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <CardTitle className="text-emerald-700">Chi tiết Hạng mục Thu</CardTitle>
            <span className="text-xs font-bold text-emerald-600">
              Tổng: +{formatCurrency(summary.totalIncome, settings.currency)}
            </span>
          </CardHeader>

          {incomeStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Chưa có thu nhập trong tháng</p>
          ) : (
            <div className="space-y-3">
              {incomeStats.map((item, idx) => (
                <div key={item.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-500 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        <CategoryIcon name={item.icon} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-700">{item.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">
                        +{formatCurrency(item.amount, settings.currency)}
                      </span>
                      <span className="text-slate-400 font-medium w-9 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
