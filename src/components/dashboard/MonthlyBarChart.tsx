import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency, formatCompactNumber } from '../../utils/currency';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { BarChart3 } from 'lucide-react';

export const MonthlyBarChart: React.FC = () => {
  const stats = useMonthlyStats(6);
  const { settings } = useSettings();

  const hasData = stats.some((s) => s.income > 0 || s.expense > 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <CardTitle>Xu hướng Thu & Chi (6 tháng)</CardTitle>
        </div>
      </CardHeader>

      {!hasData ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          Chưa có đủ lịch sử giao dịch để hiển thị biểu đồ xu hướng.
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(value) => formatCompactNumber(value)}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value) || 0, settings.currency),
                  name === 'income' ? 'Thu nhập' : 'Chi tiêu',
                ]}
                labelFormatter={(label) => {
                  const item = stats.find((s) => s.label === label);
                  return item?.fullLabel || label;
                }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs font-semibold text-slate-700">
                    {value === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                  </span>
                )}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Bar dataKey="income" name="income" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
