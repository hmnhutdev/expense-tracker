import React, { useState } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import { MonthlyBarChart } from '../components/dashboard/MonthlyBarChart';
import { TransactionList } from '../components/transaction/TransactionList';
import { useSummary } from '../hooks/useSummary';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';
import type { Transaction } from '../db/types';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ArrowRight,
  Plus,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Download,
} from 'lucide-react';
import { formatMonthYear, addMonths, subMonths } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { seedSampleData } from '../db/db';
import { exportDatabaseToJSON } from '../utils/backup';

interface DashboardPageProps {
  onOpenAddModal?: () => void;
  onOpenEditModal?: (tx: Transaction) => void;
  onNavigateToTransactions?: () => void;
  onNavigateToSettings?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  onNavigateToTransactions,
  onNavigateToSettings,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const summary = useSummary(year, monthIndex);
  const { settings } = useSettings();
  const { transactions, deleteTransaction } = useTransactions({
    year,
    monthIndex,
  });

  const recentTransactions = transactions.slice(0, 5);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleCurrentMonth = () => setCurrentDate(new Date());

  const handleSeedData = async () => {
    await seedSampleData();
  };

  const isOverBudget = summary.monthlyBudget > 0 && summary.totalExpense > summary.monthlyBudget;
  const budgetPercentage =
    summary.monthlyBudget > 0
      ? Math.round((summary.totalExpense / summary.monthlyBudget) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Bento Top Header: Month Selector & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tháng trước"
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
            title="Tháng sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {summary.transactionCount === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
            >
              Nạp dữ liệu mẫu
            </Button>
          )}
          {onOpenAddModal && (
            <Button
              size="sm"
              onClick={onOpenAddModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Thêm giao dịch
            </Button>
          )}
        </div>
      </div>

      {/* Bento Hero Cards: Balance & Quick Action */}
      <SummaryCards
        summary={summary}
        onSetBudgetClick={onNavigateToSettings}
        onOpenAddModal={onOpenAddModal}
      />

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Trend Chart & Recent Transactions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Bento: Monthly Trend */}
          <MonthlyBarChart />

          {/* Bento: Recent Transactions Card */}
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <CardTitle>Giao dịch gần đây ({formatMonthYear(currentDate)})</CardTitle>
              {transactions.length > 5 && onNavigateToTransactions && (
                <button
                  type="button"
                  onClick={onNavigateToTransactions}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <span>Xem tất cả ({transactions.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>

            <TransactionList
              transactions={recentTransactions}
              onEdit={(tx) => onOpenEditModal && onOpenEditModal(tx)}
              onDelete={deleteTransaction}
              onAddNew={onOpenAddModal}
            />
          </Card>
        </div>

        {/* Right Column (4 cols): Category Donut, Budget Progress & Offline Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bento: Expense Distribution Donut */}
          <ExpensePieChart year={year} monthIndex={monthIndex} />

          {/* Bento: Monthly Budget Card */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-xl ${
                    isOverBudget
                      ? 'bg-rose-100 text-rose-600'
                      : budgetPercentage >= 80
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">Ngân sách tháng</h3>
              </div>

              {onNavigateToSettings && (
                <button
                  type="button"
                  onClick={onNavigateToSettings}
                  className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  Cài đặt
                </button>
              )}
            </div>

            {summary.monthlyBudget > 0 ? (
              <div className="space-y-3">
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-rose-500'
                        : budgetPercentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    Đã dùng:{' '}
                    <strong className="text-slate-900">
                      {formatCurrency(summary.totalExpense, settings.currency)}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    Hạn mức:{' '}
                    <strong className="text-slate-900">
                      {formatCurrency(summary.monthlyBudget, settings.currency)}
                    </strong>
                  </span>
                </div>

                <div className="pt-1">
                  {isOverBudget ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Vượt {formatCurrency(summary.totalExpense - summary.monthlyBudget, settings.currency)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Còn lại {formatCurrency(summary.budgetRemaining, settings.currency)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-3 text-center">
                <p className="text-xs text-slate-500 mb-2">Chưa thiết lập ngân sách chi tiêu</p>
                {onNavigateToSettings && (
                  <Button variant="outline" size="sm" onClick={onNavigateToSettings} fullWidth>
                    Đặt hạn mức tháng
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Bento: Offline & Dexie Storage Dark Card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-white">Tính năng Offline</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Dữ liệu được lưu trữ an toàn trực tiếp trên trình duyệt của bạn thông qua Dexie.js. Không cần mạng vẫn hoạt động 100%!
              </p>
              <button
                type="button"
                onClick={exportDatabaseToJSON}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tải sao lưu JSON</span>
              </button>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-white">
              <HardDrive className="w-28 h-28 transform rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
