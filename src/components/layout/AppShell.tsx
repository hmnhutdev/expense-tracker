import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav, type NavTab } from './BottomNav';
import { Modal } from '../ui/Modal';
import { TransactionForm } from '../transaction/TransactionForm';
import { useTransactions } from '../../hooks/useTransactions';
import type { Transaction } from '../../db/types';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Plus,
} from 'lucide-react';

interface AppShellProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setIsSubmitting(true);
    try {
      if (editingTransaction && editingTransaction.id) {
        await updateTransaction(editingTransaction.id, data);
      } else {
        await addTransaction(data);
      }
      setIsModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error saving transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions' as NavTab, label: 'Sổ giao dịch', icon: Receipt },
    { id: 'analytics' as NavTab, label: 'Thống kê & Phân tích', icon: PieChart },
    { id: 'settings' as NavTab, label: 'Cài đặt & Sao lưu', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans pb-20 sm:pb-8">
      {/* Top Header */}
      <Header onOpenAddModal={handleOpenAdd} />

      {/* Desktop Sub-Navigation Bar */}
      <div className="hidden sm:block bg-white border-b border-slate-200 px-4 sm:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 sm:py-6">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Pass helper handlers if needed
            return React.cloneElement(child as React.ReactElement<any>, {
              onOpenAddModal: handleOpenAdd,
              onOpenEditModal: handleOpenEdit,
            });
          }
          return child;
        })}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Global Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
      >
        <TransactionForm
          initialData={editingTransaction}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};
