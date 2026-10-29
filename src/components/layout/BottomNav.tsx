import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  Plus,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'transactions' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 pb-safe sm:hidden">
      <div className="grid grid-cols-5 items-center h-16 px-2 relative">
        {/* Tab: Dashboard */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Tổng quan</span>
        </button>

        {/* Tab: Transactions */}
        <button
          type="button"
          onClick={() => onTabChange('transactions')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'transactions' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1">Giao dịch</span>
        </button>

        {/* Center Prominent Add Button (FAB) */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-12 h-12 -mt-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
            aria-label="Thêm mới giao dịch"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab: Analytics */}
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Thống kê</span>
        </button>

        {/* Tab: Settings */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1">Cài đặt</span>
        </button>
      </div>
    </div>
  );
};
