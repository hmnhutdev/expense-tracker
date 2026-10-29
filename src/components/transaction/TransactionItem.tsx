import React, { useState } from 'react';
import type { Transaction } from '../../db/types';
import { useCategories } from '../../hooks/useCategories';
import { useSettings } from '../../hooks/useSettings';
import { CategoryIcon } from '../category/CategoryIcon';
import { formatCurrency } from '../../utils/currency';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Edit2, Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const { categoryMap } = useCategories();
  const { settings } = useSettings();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const category = categoryMap.get(transaction.categoryId) || {
    id: transaction.categoryId,
    name: transaction.categoryId,
    icon: 'HelpCircle',
    color: '#94A3B8',
    type: transaction.type,
    isDefault: false,
  };

  const isIncome = transaction.type === 'income';

  return (
    <>
      <div className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all duration-150">
        {/* Left: Category Icon & Info */}
        <div className="flex items-center gap-3.5 min-w-0 pr-2">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: category.color }}
          >
            <CategoryIcon name={category.icon} className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {category.name}
              </span>
            </div>
            {transaction.note ? (
              <p className="text-xs text-slate-500 truncate mt-0.5">{transaction.note}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-0.5">Không có ghi chú</p>
            )}
          </div>
        </div>

        {/* Right: Amount & Action Hover */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <span
              className={`text-sm sm:text-base font-bold tracking-tight ${
                isIncome ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount, settings.currency)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa giao dịch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (transaction.id) {
            onDelete(transaction.id);
          }
        }}
        title="Xác nhận xóa giao dịch"
        message={`Bạn có chắc chắn muốn xóa khoản ${
          isIncome ? 'thu' : 'chi'
        } "${category.name}" (${formatCurrency(transaction.amount, settings.currency)})?`}
      />
    </>
  );
};
