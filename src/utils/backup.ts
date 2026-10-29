import { db } from '../db/db';
import type { BackupData, Transaction, Category, AppSettings } from '../db/types';

export async function exportDatabaseToJSON(): Promise<void> {
  const transactions = await db.transactions.toArray();
  const categories = await db.categories.toArray();
  const settings = (await db.settings.get(1)) || {
    id: 1,
    currency: 'VND',
    language: 'vi',
    theme: 'system',
    monthlyBudget: 15000000,
  };

  const backup: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      transactions,
      categories,
      settings,
    },
  };

  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `expense_tracker_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportTransactionsToCSV(): Promise<void> {
  const transactions = await db.transactions.toArray();
  const categories = await db.categories.toArray();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['ID', 'Loại', 'Số tiền (VNĐ)', 'Danh mục', 'Ngày', 'Ghi chú', 'Thời gian tạo'];
  const rows = transactions.map((t) => [
    t.id ?? '',
    t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
    t.amount,
    categoryMap.get(t.categoryId) || t.categoryId,
    t.date,
    `"${(t.note || '').replace(/"/g, '""')}"`,
    new Date(t.createdAt).toISOString(),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `giao_dich_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: {
    transactions: number;
    categories: number;
  };
}

export async function importDatabaseFromJSON(
  fileContent: string,
  mode: 'replace' | 'merge' = 'replace'
): Promise<ImportResult> {
  try {
    const parsed = JSON.parse(fileContent) as Partial<BackupData>;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Tệp không phải định dạng JSON hợp lệ.' };
    }

    if (!parsed.data || !Array.isArray(parsed.data.transactions)) {
      return { success: false, message: 'Dữ liệu không khớp định dạng sao lưu của Expense Tracker.' };
    }

    const { transactions, categories, settings } = parsed.data;

    // Use Dexie transaction to ensure atomic execution
    await db.transaction('rw', db.transactions, db.categories, db.settings, async () => {
      if (mode === 'replace') {
        await db.transactions.clear();
        if (categories && categories.length > 0) {
          await db.categories.clear();
        }
      }

      if (categories && categories.length > 0) {
        if (mode === 'replace') {
          await db.categories.bulkPut(categories);
        } else {
          // Merge categories (keep existing if exists)
          for (const cat of categories) {
            const existing = await db.categories.get(cat.id);
            if (!existing) {
              await db.categories.add(cat);
            }
          }
        }
      }

      if (transactions && transactions.length > 0) {
        if (mode === 'replace') {
          // Keep IDs or let them auto-increment
          await db.transactions.bulkPut(transactions);
        } else {
          // In merge mode, insert transactions as new items
          const cleaned = transactions.map(({ id: _, ...rest }) => rest as Transaction);
          await db.transactions.bulkAdd(cleaned);
        }
      }

      if (settings && typeof settings === 'object') {
        await db.settings.put({
          id: 1,
          currency: settings.currency || 'VND',
          language: settings.language || 'vi',
          theme: settings.theme || 'system',
          monthlyBudget: Number(settings.monthlyBudget) || 0,
        });
      }
    });

    return {
      success: true,
      message: `Khôi phục thành công ${transactions.length} giao dịch!`,
      importedCount: {
        transactions: transactions.length,
        categories: categories ? categories.length : 0,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Có lỗi xảy ra trong quá trình đọc hoặc ghi dữ liệu.',
    };
  }
}
