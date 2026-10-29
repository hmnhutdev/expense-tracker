import React from 'react';
import type { SummaryData } from '../../hooks/useSummary';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { Card } from '../ui/Card';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: SummaryData;
  onSetBudgetClick?: () => void;
  onOpenAddModal?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  onSetBudgetClick,
  onOpenAddModal,
}) => {
  const { settings } = useSettings();

  const isOverBudget = summary.monthlyBudget > 0 && summary.totalExpense > summary.monthlyBudget;
  const budgetPercentage =
    summary.monthlyBudget > 0
      ? Math.round((summary.totalExpense / summary.monthlyBudget) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
      {/* Bento Main Balance Hero Card (Col 8) */}
      <div className="md:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Số dư tổng cộng
            </h2>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(summary.balance, settings.currency)}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.transactionCount} giao dịch trong kỳ này
          </span>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block mb-1">
              Tổng thu
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
              +{formatCurrency(summary.totalIncome, settings.currency)}
            </span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-rose-600 font-bold uppercase tracking-wider block mb-1">
              Tổng chi
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-rose-600">
              -{formatCurrency(summary.totalExpense, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Bento Quick Add Action Button (Col 4) */}
      {onOpenAddModal && (
        <button
          type="button"
          onClick={onOpenAddModal}
          className="md:col-span-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-lg shadow-indigo-200/70 hover:shadow-indigo-300 transition-all group active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="font-bold text-base tracking-tight">Thêm giao dịch mới</span>
          <span className="text-xs text-indigo-100 mt-0.5 opacity-90">Ghi chép thu chi tức thì</span>
        </button>
      )}
    </div>
  );
};
