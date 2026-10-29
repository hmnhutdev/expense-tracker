import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { getMonthRange } from '../utils/date';
import { useSettings } from './useSettings';

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyBudget: number;
  budgetRemaining: number;
  budgetPercentage: number;
  transactionCount: number;
}

export function useSummary(year?: number, monthIndex?: number): SummaryData {
  const { settings } = useSettings();

  const summary = useLiveQuery(
    async () => {
      let transactions = await db.transactions.toArray();

      if (year !== undefined && monthIndex !== undefined && year !== -1 && monthIndex !== -1) {
        const { start, end } = getMonthRange(year, monthIndex);
        transactions = transactions.filter((t) => t.date >= start && t.date <= end);
      }

      let totalIncome = 0;
      let totalExpense = 0;

      for (const t of transactions) {
        if (t.type === 'income') {
          totalIncome += t.amount;
        } else if (t.type === 'expense') {
          totalExpense += t.amount;
        }
      }

      const balance = totalIncome - totalExpense;
      const monthlyBudget = settings.monthlyBudget || 0;
      const budgetRemaining = monthlyBudget > 0 ? monthlyBudget - totalExpense : 0;
      const budgetPercentage =
        monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 200) : 0;

      return {
        totalIncome,
        totalExpense,
        balance,
        monthlyBudget,
        budgetRemaining,
        budgetPercentage,
        transactionCount: transactions.length,
      };
    },
    [year, monthIndex, settings.monthlyBudget],
    {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      monthlyBudget: settings.monthlyBudget || 0,
      budgetRemaining: settings.monthlyBudget || 0,
      budgetPercentage: 0,
      transactionCount: 0,
    } as SummaryData
  );

  return (
    summary || {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      monthlyBudget: settings.monthlyBudget || 0,
      budgetRemaining: settings.monthlyBudget || 0,
      budgetPercentage: 0,
      transactionCount: 0,
    }
  );
}
