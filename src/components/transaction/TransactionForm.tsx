import React, { useState, useEffect } from 'react';
import type { Transaction, TransactionType } from '../../db/types';
import { useCategories } from '../../hooks/useCategories';
import { useSettings } from '../../hooks/useSettings';
import { CategoryIcon } from '../category/CategoryIcon';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getTodayDateString } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { Plus, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionFormProps {
  initialData?: Transaction | null;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const QUICK_AMOUNTS_EXPENSE = [50000, 100000, 200000, 500000, 1000000, 2000000];
const QUICK_AMOUNTS_INCOME = [1000000, 2000000, 5000000, 10000000, 15000000, 20000000];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { settings } = useSettings();
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amountStr, setAmountStr] = useState<string>(
    initialData ? initialData.amount.toString() : ''
  );
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || '');
  const [date, setDate] = useState<string>(initialData?.date || getTodayDateString());
  const [note, setNote] = useState<string>(initialData?.note || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { categories } = useCategories(type);

  // Set default category when type changes or categories load
  useEffect(() => {
    if (categories.length > 0) {
      if (!categoryId || !categories.some((c) => c.id === categoryId)) {
        setCategoryId(categories[0].id);
      }
    }
  }, [type, categories]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(raw);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toString());
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: '' }));
    }
  };

  const numericAmount = parseInt(amountStr, 10) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!numericAmount || numericAmount <= 0) {
      newErrors.amount = 'Vui lòng nhập số tiền hợp lệ lớn hơn 0';
    }
    if (!categoryId) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }
    if (!date) {
      newErrors.date = 'Vui lòng chọn ngày giao dịch';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      type,
      amount: numericAmount,
      categoryId,
      date,
      note: note.trim(),
    });
  };

  const quickAmounts = type === 'expense' ? QUICK_AMOUNTS_EXPENSE : QUICK_AMOUNTS_INCOME;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type Toggle */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            type === 'expense'
              ? 'bg-white text-rose-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          Khoản Chi
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            type === 'income'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          Khoản Thu
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Số tiền ({settings.currency})
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={amountStr ? new Intl.NumberFormat('vi-VN').format(numericAmount) : ''}
            onChange={handleAmountChange}
            placeholder="0"
            className={`w-full text-2xl sm:text-3xl font-bold py-3 px-4 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
              type === 'expense'
                ? 'text-rose-600 focus:ring-rose-500 border-slate-200'
                : 'text-emerald-600 focus:ring-emerald-500 border-slate-200'
            } ${errors.amount ? 'border-rose-500 bg-rose-50/20' : ''}`}
            autoFocus
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
            {settings.currency}
          </span>
        </div>
        {errors.amount && <p className="text-xs text-rose-600 font-medium">{errors.amount}</p>}

        {/* Quick Amount Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quickAmounts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleQuickAmount(q)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              +{formatCurrency(q, settings.currency)}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Chọn Danh mục
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
          {categories.map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategoryId(cat.id);
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: '' }));
                  }
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-white shadow-xs scale-[1.02]'
                    : 'border-transparent bg-white/70 hover:bg-white text-slate-600'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-white shrink-0"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-700 line-clamp-1 text-center">
                  {cat.name}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1" />
                )}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-xs text-rose-600 font-medium">{errors.category}</p>}
      </div>

      {/* Date and Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          type="date"
          label="Ngày giao dịch"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <Input
          type="text"
          label="Ghi chú (Tùy chọn)"
          placeholder="Ví dụ: Ăn trưa bún bò..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} fullWidth>
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          variant={type === 'expense' ? 'danger' : 'primary'}
          disabled={isLoading}
          fullWidth
          leftIcon={initialData ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        >
          {initialData ? 'Lưu thay đổi' : 'Thêm giao dịch'}
        </Button>
      </div>
    </form>
  );
};
