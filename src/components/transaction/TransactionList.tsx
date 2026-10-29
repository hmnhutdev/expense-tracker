import React from 'react';
import type { Transaction } from '../../db/types';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '../ui/EmptyState';
import { formatTransactionDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../hooks/useSettings';
import { ReceiptText, PlusCircle } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: number) => void;
  onAddNew?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const { settings } = useSettings();

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="w-8 h-8" />}
        title="Chưa có giao dịch nào"
        description="Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại. Hãy tạo giao dịch đầu tiên ngay!"
        actionLabel={onAddNew ? 'Thêm giao dịch mới' : undefined}
        onAction={onAddNew}
      />
    );
  }

  // Group transactions by date
  const grouped: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = tx.date;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(tx);
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {sortedDates.map((dateStr) => {
        const items = grouped[dateStr];
        let dayIncome = 0;
        let dayExpense = 0;

        items.forEach((item) => {
          if (item.type === 'income') dayIncome += item.amount;
          if (item.type === 'expense') dayExpense += item.amount;
        });

        const dayNet = dayIncome - dayExpense;

        return (
          <div key={dateStr} className="space-y-2">
            {/* Group Date Header */}
            <div className="flex items-center justify-between px-1 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="capitalize">{formatTransactionDate(dateStr)}</span>
              <span
                className={`font-bold ${
                  dayNet > 0
                    ? 'text-emerald-600'
                    : dayNet < 0
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {dayNet > 0 ? '+' : ''}
                {formatCurrency(dayNet, settings.currency)}
              </span>
            </div>

            {/* List of Transaction Items */}
            <div className="space-y-2">
              {items.map((tx) => (
                <TransactionItem
                  key={tx.id || `${tx.date}-${tx.amount}-${tx.createdAt}`}
                  transaction={tx}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
