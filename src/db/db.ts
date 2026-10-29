import Dexie, { type Table } from 'dexie';
import type { Transaction, Category, AppSettings } from './types';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export class ExpenseTrackerDB extends Dexie {
  transactions!: Table<Transaction, number>;
  categories!: Table<Category, string>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('ExpenseTrackerDB');

    this.version(1).stores({
      // Indexed fields: primary key + searchable columns
      transactions: '++id, type, categoryId, date, createdAt',
      categories: 'id, type, isDefault',
      settings: 'id',
    });

    this.on('populate', () => {
      this.categories.bulkAdd(DEFAULT_CATEGORIES);
      this.settings.add({
        id: 1,
        currency: 'VND',
        language: 'vi',
        theme: 'system',
        monthlyBudget: 15000000, // 15 triệu mặc định
      });
    });
  }
}

export const db = new ExpenseTrackerDB();

// Ensure default categories and settings exist even if database was opened previously without populate
export async function initializeDatabase(): Promise<void> {
  try {
    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
      await db.categories.bulkAdd(DEFAULT_CATEGORIES);
    }
    const settingsCount = await db.settings.count();
    if (settingsCount === 0) {
      await db.settings.add({
        id: 1,
        currency: 'VND',
        language: 'vi',
        theme: 'system',
        monthlyBudget: 15000000,
      });
    }
  } catch (err) {
    console.error('Failed to initialize database defaults:', err);
  }
}

// Seed sample transactions if user wants to explore with realistic mock data
export async function seedSampleData(): Promise<void> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const sampleTransactions: Omit<Transaction, 'id'>[] = [
    // Tháng này
    {
      type: 'income',
      amount: 25000000,
      categoryId: 'salary',
      date: formatDateStr(year, month, 1),
      note: 'Lương chuyển khoản tháng này',
      createdAt: Date.now() - 20 * 86400000,
      updatedAt: Date.now() - 20 * 86400000,
    },
    {
      type: 'income',
      amount: 4500000,
      categoryId: 'freelance',
      date: formatDateStr(year, month, 10),
      note: 'Dự án UI Design website cho khách hàng',
      createdAt: Date.now() - 10 * 86400000,
      updatedAt: Date.now() - 10 * 86400000,
    },
    {
      type: 'expense',
      amount: 4200000,
      categoryId: 'bills',
      date: formatDateStr(year, month, 5),
      note: 'Tiền thuê nhà + tiền điện nước',
      createdAt: Date.now() - 15 * 86400000,
      updatedAt: Date.now() - 15 * 86400000,
    },
    {
      type: 'expense',
      amount: 650000,
      categoryId: 'food',
      date: formatDateStr(year, month, Math.max(1, today.getDate() - 1)),
      note: 'Ăn tối cùng đồng nghiệp',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      type: 'expense',
      amount: 180000,
      categoryId: 'food',
      date: formatDateStr(year, month, today.getDate()),
      note: 'Cà phê sáng & bữa trưa',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      type: 'expense',
      amount: 850000,
      categoryId: 'shopping',
      date: formatDateStr(year, month, Math.max(1, today.getDate() - 2)),
      note: 'Mua sắm đồ gia dụng siêu thị',
      createdAt: Date.now() - 2 * 86400000,
      updatedAt: Date.now() - 2 * 86400000,
    },
    {
      type: 'expense',
      amount: 320000,
      categoryId: 'transport',
      date: formatDateStr(year, month, 12),
      note: 'Đổ xăng xe & vé gửi xe tháng',
      createdAt: Date.now() - 8 * 86400000,
      updatedAt: Date.now() - 8 * 86400000,
    },
    {
      type: 'expense',
      amount: 500000,
      categoryId: 'health',
      date: formatDateStr(year, month, 8),
      note: 'Mua vitamin & thực phẩm bổ sung',
      createdAt: Date.now() - 12 * 86400000,
      updatedAt: Date.now() - 12 * 86400000,
    },
    {
      type: 'expense',
      amount: 250000,
      categoryId: 'entertainment',
      date: formatDateStr(year, month, Math.max(1, today.getDate() - 4)),
      note: 'Vé xem phim cuối tuần',
      createdAt: Date.now() - 4 * 86400000,
      updatedAt: Date.now() - 4 * 86400000,
    },
    // Tháng trước
    {
      type: 'income',
      amount: 25000000,
      categoryId: 'salary',
      date: formatDateStr(month === 0 ? year - 1 : year, (month + 11) % 12, 1),
      note: 'Lương tháng trước',
      createdAt: Date.now() - 45 * 86400000,
      updatedAt: Date.now() - 45 * 86400000,
    },
    {
      type: 'expense',
      amount: 7200000,
      categoryId: 'bills',
      date: formatDateStr(month === 0 ? year - 1 : year, (month + 11) % 12, 5),
      note: 'Tiền nhà & internet',
      createdAt: Date.now() - 40 * 86400000,
      updatedAt: Date.now() - 40 * 86400000,
    },
    {
      type: 'expense',
      amount: 3800000,
      categoryId: 'food',
      date: formatDateStr(month === 0 ? year - 1 : year, (month + 11) % 12, 15),
      note: 'Ăn uống cả tháng',
      createdAt: Date.now() - 35 * 86400000,
      updatedAt: Date.now() - 35 * 86400000,
    },
  ];

  await db.transactions.bulkAdd(sampleTransactions as Transaction[]);
}
