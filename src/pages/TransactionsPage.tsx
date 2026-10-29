import React, { useState } from 'react';
import type { Transaction, TransactionType } from '../db/types';
import { useTransactions } from '../hooks/useTransactions';
import { useSummary } from '../hooks/useSummary';
import { useSettings } from '../hooks/useSettings';
import { TransactionFilter } from '../components/transaction/TransactionFilter';
import { TransactionList } from '../components/transaction/TransactionList';
import { Button } from '../components/ui/Button';
import { exportTransactionsToCSV, exportDatabaseToJSON } from '../utils/backup';
import { formatCurrency } from '../utils/currency';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddModal?: () => void;
  onOpenEditModal?: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isAllTime, setIsAllTime] = useState<boolean>(false);
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryIdFilter, setCategoryIdFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const year = isAllTime ? -1 : currentDate.getFullYear();
  const monthIndex = isAllTime ? -1 : currentDate.getMonth();

  const { transactions, deleteTransaction } = useTransactions({
    year,
    monthIndex,
    type: typeFilter,
    categoryId: categoryIdFilter,
    searchQuery,
  });

  const summary = useSummary(year, monthIndex);

  const handleExportCSV = async () => {
    await exportTransactionsToCSV();
  };

  const handleExportJSON = async () => {
    await exportDatabaseToJSON();
  };

  return (
    <div className="space-y-5">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sổ Giao Dịch</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý, tìm kiếm và lọc tất cả các khoản thu chi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            title="Xuất file Excel CSV"
          >
            Xuất CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-4 h-4 text-blue-600" />}
            title="Sao lưu file JSON"
          >
            Sao lưu
          </Button>
          {onOpenAddModal && (
            <Button
              size="sm"
              onClick={onOpenAddModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Thêm mới
            </Button>
          )}
        </div>
      </div>

      {/* Filter Component */}
      <TransactionFilter
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        isAllTime={isAllTime}
        onToggleAllTime={setIsAllTime}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        categoryIdFilter={categoryIdFilter}
        onCategoryFilterChange={setCategoryIdFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-4 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Số lượng</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-800">
            {transactions.length} giao dịch
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-0.5">Tổng thu</span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-600">
            +{formatCurrency(summary.totalIncome, settings.currency)}
          </span>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider block mb-0.5">Tổng chi</span>
          <span className="text-sm sm:text-base font-extrabold text-rose-600">
            -{formatCurrency(summary.totalExpense, settings.currency)}
          </span>
        </div>
      </div>

      {/* Grouped Transactions List */}
      <TransactionList
        transactions={transactions}
        onEdit={(tx) => onOpenEditModal && onOpenEditModal(tx)}
        onDelete={deleteTransaction}
        onAddNew={onOpenAddModal}
      />
    </div>
  );
};
