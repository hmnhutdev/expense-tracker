import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { TransactionType } from '../db/types';
import { getMonthRange } from '../utils/date';

export interface CategoryStatItem {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
  count: number;
}

export function useCategoryStats(
  type: TransactionType = 'expense',
  year?: number,
  monthIndex?: number
) {
  const stats = useLiveQuery(
    async () => {
      let transactions = await db.transactions.toArray();
      const categories = await db.categories.toArray();
      const categoryMap = new Map(categories.map((c) => [c.id, c]));

      if (year !== undefined && monthIndex !== undefined && year !== -1 && monthIndex !== -1) {
        const { start, end } = getMonthRange(year, monthIndex);
        transactions = transactions.filter((t) => t.date >= start && t.date <= end);
      }

      // Filter by type (income or expense)
      const filtered = transactions.filter((t) => t.type === type);
      const totalAmount = filtered.reduce((acc, curr) => acc + curr.amount, 0);

      const map = new Map<string, { amount: number; count: number }>();
      for (const t of filtered) {
        const current = map.get(t.categoryId) || { amount: 0, count: 0 };
        map.set(t.categoryId, {
          amount: current.amount + t.amount,
          count: current.count + 1,
        });
      }

      const result: CategoryStatItem[] = [];
      map.forEach((value, catId) => {
        const cat = categoryMap.get(catId);
        const percentage = totalAmount > 0 ? (value.amount / totalAmount) * 100 : 0;
        result.push({
          categoryId: catId,
          categoryName: cat?.name || catId,
          icon: cat?.icon || 'HelpCircle',
          color: cat?.color || '#94A3B8',
          amount: value.amount,
          percentage: Number(percentage.toFixed(1)),
          count: value.count,
        });
      });

      // Sort by highest amount first
      return result.sort((a, b) => b.amount - a.amount);
    },
    [type, year, monthIndex],
    [] as CategoryStatItem[]
  );

  return stats || [];
}
