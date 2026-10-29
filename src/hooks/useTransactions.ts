import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Transaction, TransactionType } from '../db/types';
import { getMonthRange } from '../utils/date';

export interface TransactionFilterOptions {
  year?: number;
  monthIndex?: number; // 0-11
  type?: 'all' | TransactionType;
  categoryId?: string;
  searchQuery?: string;
}

export function useTransactions(filterOptions?: TransactionFilterOptions) {
  const transactions = useLiveQuery(
    async () => {
      let collection = db.transactions.orderBy('date').reverse();
      let results = await collection.toArray();

      // Filter by Month Range
      if (
        filterOptions?.year !== undefined &&
        filterOptions?.monthIndex !== undefined &&
        filterOptions.year !== -1 &&
        filterOptions.monthIndex !== -1
      ) {
        const { start, end } = getMonthRange(filterOptions.year, filterOptions.monthIndex);
        results = results.filter((t) => t.date >= start && t.date <= end);
      }

      // Filter by Type
      if (filterOptions?.type && filterOptions.type !== 'all') {
        results = results.filter((t) => t.type === filterOptions.type);
      }

      // Filter by Category
      if (filterOptions?.categoryId && filterOptions.categoryId !== 'all') {
        results = results.filter((t) => t.categoryId === filterOptions.categoryId);
      }

      // Filter by Search Query
      if (filterOptions?.searchQuery && filterOptions.searchQuery.trim() !== '') {
        const q = filterOptions.searchQuery.toLowerCase().trim();
        results = results.filter((t) => {
          const matchNote = t.note?.toLowerCase().includes(q);
          const matchAmount = t.amount.toString().includes(q);
          return matchNote || matchAmount;
        });
      }

      // Sort by date descending, then createdAt descending
      return results.sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.createdAt - a.createdAt;
      });
    },
    [
      filterOptions?.year,
      filterOptions?.monthIndex,
      filterOptions?.type,
      filterOptions?.categoryId,
      filterOptions?.searchQuery,
    ],
    [] as Transaction[]
  );

  const addTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> => {
    const now = Date.now();
    const newTx: Transaction = {
      ...data,
      amount: Math.round(data.amount),
      createdAt: now,
      updatedAt: now,
    };
    return (await db.transactions.add(newTx)) as number;
  };

  const updateTransaction = async (
    id: number,
    data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> => {
    await db.transactions.update(id, {
      ...data,
      amount: data.amount !== undefined ? Math.round(data.amount) : undefined,
      updatedAt: Date.now(),
    });
  };

  const deleteTransaction = async (id: number): Promise<void> => {
    await db.transactions.delete(id);
  };

  const clearAllTransactions = async (): Promise<void> => {
    await db.transactions.clear();
  };

  return {
    transactions: transactions || [],
    isLoading: transactions === undefined,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
  };
}
