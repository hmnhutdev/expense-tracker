import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Category, TransactionType } from '../db/types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export function useCategories(typeFilter?: TransactionType) {
  const categories = useLiveQuery(
    async () => {
      let list = await db.categories.toArray();
      if (list.length === 0) {
        await db.categories.bulkAdd(DEFAULT_CATEGORIES);
        list = await db.categories.toArray();
      }
      if (typeFilter) {
        return list.filter((c) => c.type === typeFilter);
      }
      return list;
    },
    [typeFilter],
    [] as Category[]
  );

  const categoryMap = useLiveQuery(
    async () => {
      const list = await db.categories.toArray();
      return new Map(list.map((c) => [c.id, c]));
    },
    [],
    new Map<string, Category>()
  );

  const addCategory = async (cat: Category) => {
    await db.categories.put(cat);
  };

  const deleteCategory = async (id: string) => {
    await db.categories.delete(id);
  };

  return {
    categories: categories || [],
    categoryMap: categoryMap || new Map<string, Category>(),
    addCategory,
    deleteCategory,
  };
}
