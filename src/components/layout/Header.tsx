import React, { useState, useEffect } from 'react';
import { WalletCards, Wifi, WifiOff, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200/60">
            <WalletCards className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-none">
                V-Expense
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
              Quản lý chi tiêu cá nhân Offline-first
            </p>
          </div>
        </div>

        {/* Right Actions: Online/Offline Badge + Add Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline/Online Status Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={isOnline ? 'Đang kết nối internet' : 'Chế độ ngoại tuyến (Offline-first)'}
          >
            {isOnline ? (
              <>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="hidden sm:inline">Offline-ready (PWA)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Ngoại tuyến</span>
              </>
            )}
          </div>

          {/* Quick Add Button */}
          <Button
            size="sm"
            onClick={onOpenAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden sm:inline-flex shadow-xs"
          >
            Thêm Thu Chi
          </Button>
        </div>
      </div>
    </header>
  );
};
