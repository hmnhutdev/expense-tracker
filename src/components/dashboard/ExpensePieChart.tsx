import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TransactionType } from '../../db/types';
import { useCategoryStats } from '../../hooks/useCategoryStats';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../category/CategoryIcon';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { PieChart as PieIcon } from 'lucide-react';

interface ExpensePieChartProps {
  year?: number;
  monthIndex?: number;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ year, monthIndex }) => {
  const { settings } = useSettings();
  const [activeType, setActiveType] = useState<TransactionType>('expense');

  const stats = useCategoryStats(activeType, year, monthIndex);
  const totalAmount = stats.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
            <PieIcon className="w-4 h-4" />
          </div>
          <CardTitle>Phân bổ chi tiêu</CardTitle>
        </div>

        {/* Toggle Type */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveType('expense')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeType === 'expense'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setActiveType('income')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeType === 'income'
                ? 'bg-white text-emerald-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Thu nhập
          </button>
        </div>
      </CardHeader>

      {stats.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Chưa có dữ liệu {activeType === 'expense' ? 'chi tiêu' : 'thu nhập'} trong khoảng thời gian này.
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          {/* Chart Container */}
          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="amount"
                  nameKey="categoryName"
                >
                  {stats.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value) || 0, settings.currency),
                    'Số tiền',
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Tổng cộng</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                {formatCurrency(totalAmount, settings.currency)}
              </span>
            </div>
          </div>

          {/* Category Percentage List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {stats.map((item) => (
              <div
                key={item.categoryId}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    <CategoryIcon name={item.icon} className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-700 truncate">{item.categoryName}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.amount, settings.currency)}
                  </span>
                  <span className="w-11 font-medium text-slate-500 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
