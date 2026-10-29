import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { getLastNMonths, getMonthRange } from '../utils/date';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface MonthlyStatItem {
  monthKey: string;     // "2025-08"
  label: string;        // "Th8" or "Tháng 8"
  fullLabel: string;    // "Tháng 8, 2025"
  income: number;
  expense: number;
  net: number;
}

export function useMonthlyStats(monthCount: number = 6) {
  const stats = useLiveQuery(
    async () => {
      const months = getLastNMonths(monthCount);
      const allTransactions = await db.transactions.toArray();

      const result: MonthlyStatItem[] = months.map((monthDate) => {
        const year = monthDate.getFullYear();
        const monthIndex = monthDate.getMonth();
        const { start, end } = getMonthRange(year, monthIndex);

        const monthTxs = allTransactions.filter((t) => t.date >= start && t.date <= end);
        let income = 0;
        let expense = 0;

        for (const t of monthTxs) {
          if (t.type === 'income') income += t.amount;
          if (t.type === 'expense') expense += t.amount;
        }

        return {
          monthKey: format(monthDate, 'yyyy-MM'),
          label: `T${monthDate.getMonth() + 1}`,
          fullLabel: format(monthDate, 'MMMM, yyyy', { locale: vi }),
          income,
          expense,
          net: income - expense,
        };
      });

      return result;
    },
    [monthCount],
    [] as MonthlyStatItem[]
  );

  return stats || [];
}
