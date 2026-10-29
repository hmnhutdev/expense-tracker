export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: number;              // Auto-increment primary key
  type: TransactionType;    // 'income' | 'expense'
  amount: number;           // Số tiền (VNĐ, integer)
  categoryId: string;       // FK -> Category.id
  date: string;             // ISO 8601: "YYYY-MM-DD" e.g., "2025-08-21"
  note?: string;            // Ghi chú (có thể rỗng)
  createdAt: number;        // timestamp (Date.now())
  updatedAt: number;        // timestamp (Date.now())
}

export interface Category {
  id: string;               // Slug: "food", "transport", "salary"…
  name: string;             // Tên hiển thị: "Ăn uống", "Di chuyển"…
  type: TransactionType;    // Danh mục thuộc loại Thu hay Chi
  icon: string;             // Lucide icon name: "UtensilsCrossed", "Car", etc.
  color: string;            // Hex color: "#FF6384"
  isDefault: boolean;       // true = do app seed, false = user-created
}

export interface AppSettings {
  id: number;               // Singleton row ID (always 1)
  currency: string;         // "VND", "USD", etc.
  language: string;         // "vi" | "en"
  theme: 'light' | 'dark' | 'system';
  monthlyBudget: number;    // Ngân sách tháng (0 = không đặt)
}

export interface BackupData {
  version: string;
  exportedAt: string;
  data: {
    transactions: Transaction[];
    categories: Category[];
    settings?: AppSettings;
  };
}
