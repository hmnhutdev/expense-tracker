import React, { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, parseMoneyInput } from '../utils/currency';
import {
  exportDatabaseToJSON,
  exportTransactionsToCSV,
  importDatabaseFromJSON,
} from '../utils/backup';
import { seedSampleData } from '../db/db';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import {
  Settings,
  Target,
  Coins,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Database,
  Smartphone,
  HardDrive,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { transactions, clearAllTransactions } = useTransactions();

  const [budgetStr, setBudgetStr] = useState<string>(
    settings.monthlyBudget ? settings.monthlyBudget.toString() : '15000000'
  );
  const [isSavedBudget, setIsSavedBudget] = useState(false);

  // Backup / Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Confirm dialogs
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const handleSaveBudget = async () => {
    const numeric = parseMoneyInput(budgetStr);
    await updateSettings({ monthlyBudget: numeric });
    setIsSavedBudget(true);
    setTimeout(() => setIsSavedBudget(false), 2500);
  };

  const handleCurrencyChange = async (currency: string) => {
    await updateSettings({ currency });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSelectedFileContent(content);
      setImportModalOpen(true);
    };
    reader.readAsText(file);
    // Reset file input value so same file can be chosen again
    e.target.value = '';
  };

  const handleExecuteImport = async () => {
    if (!selectedFileContent) return;

    const result = await importDatabaseFromJSON(selectedFileContent, importMode);
    setImportModalOpen(false);
    setSelectedFileContent(null);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSeedData = async () => {
    await seedSampleData();
    setStatusMessage({ type: 'success', text: 'Đã nạp bộ dữ liệu mẫu thành công!' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleClearData = async () => {
    await clearAllTransactions();
    setStatusMessage({ type: 'success', text: 'Đã xóa toàn bộ dữ liệu giao dịch thành công.' });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Cài Đặt & Quản Trị Dữ Liệu
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh ngân sách, tiền tệ và sao lưu dữ liệu an toàn Offline
        </p>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Budget Settings */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Target className="w-4 h-4" />
            </div>
            <CardTitle>Hạn Mức Ngân Sách Tháng</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Đặt ngân sách chi tiêu tối đa mỗi tháng để nhận cảnh báo khi chi tiêu sắp đạt ngưỡng hoặc vượt quá hạn mức.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={new Intl.NumberFormat('vi-VN').format(parseMoneyInput(budgetStr))}
                onChange={(e) => setBudgetStr(e.target.value)}
                placeholder="0"
                rightElement={<span className="text-xs font-bold">{settings.currency}</span>}
              />
            </div>
            <Button
              onClick={handleSaveBudget}
              variant="primary"
              size="md"
              leftIcon={isSavedBudget ? <CheckCircle2 className="w-4 h-4" /> : undefined}
            >
              {isSavedBudget ? 'Đã lưu' : 'Cập nhật ngân sách'}
            </Button>
          </div>

          <p className="text-[11px] text-slate-400">
            Ngân sách hiện tại:{' '}
            <strong className="text-slate-700">
              {formatCurrency(settings.monthlyBudget, settings.currency)} / tháng
            </strong>
          </p>
        </div>
      </Card>

      {/* Section 2: Currency Settings */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Coins className="w-4 h-4" />
            </div>
            <CardTitle>Đơn Vị Tiền Tệ</CardTitle>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { code: 'VND', label: 'VNĐ (Việt Nam Đồng)', symbol: '₫' },
            { code: 'USD', label: 'USD (Đô la Mỹ)', symbol: '$' },
            { code: 'EUR', label: 'EUR (Euro)', symbol: '€' },
            { code: 'JPY', label: 'JPY (Yên Nhật)', symbol: '¥' },
          ].map((item) => {
            const isSelected = settings.currency === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleCurrencyChange(item.code)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-lg font-bold">{item.symbol}</div>
                <div className="text-xs font-semibold mt-0.5">{item.code}</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">{item.label}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Section 3: Backup & Restore (JSON / CSV) */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Database className="w-4 h-4" />
            </div>
            <CardTitle>Sao Lưu & Khôi Phục Dữ Liệu</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Dữ liệu được lưu trữ an toàn trực tiếp trên trình duyệt của bạn (IndexedDB). Bạn có thể tải file sao lưu về máy bất kỳ lúc nào để chuyển sang thiết bị khác hoặc lưu trữ dự phòng.
          </p>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Export JSON */}
            <Button
              variant="outline"
              onClick={exportDatabaseToJSON}
              leftIcon={<Download className="w-4 h-4 text-purple-600" />}
              fullWidth
            >
              Tải file sao lưu (.JSON)
            </Button>

            {/* Import JSON */}
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Upload className="w-4 h-4 text-blue-600" />}
              fullWidth
            >
              Khôi phục từ file (.JSON)
            </Button>

            {/* Export CSV */}
            <Button
              variant="outline"
              onClick={exportTransactionsToCSV}
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              fullWidth
            >
              Xuất bảng tính (.CSV)
            </Button>
          </div>
        </div>
      </Card>

      {/* Section 4: Data Management & Reset */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <HardDrive className="w-4 h-4" />
            </div>
            <CardTitle>Quản Trị Cơ Sở Dữ Liệu</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Tạo dữ liệu mẫu</h4>
              <p className="text-xs text-slate-500">
                Thêm 12 giao dịch mẫu đa dạng để xem biểu đồ và tính năng
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSeedConfirm(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
            >
              Nạp mẫu
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
            <div>
              <h4 className="text-xs font-bold text-rose-800">Xóa toàn bộ giao dịch</h4>
              <p className="text-xs text-rose-600">
                Hiện có {transactions.length} giao dịch được lưu trong cơ sở dữ liệu
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              disabled={transactions.length === 0}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Xóa sạch dữ liệu
            </Button>
          </div>
        </div>
      </Card>

      {/* Section 5: PWA & Offline Storage Information */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Ứng dụng PWA Offline-First</h4>
            <p className="text-xs text-slate-400">Cơ chế lưu trữ Dexie.js + IndexedDB v1</p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ứng dụng hoạt động 100% độc lập không cần kết nối mạng. Tất cả các thao tác thêm, sửa, xóa, tìm kiếm và phân tích biểu đồ đều được thực thi trực tiếp trên máy của bạn với tốc độ tức thì và bảo mật tuyệt đối.
        </p>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Khôi phục cơ sở dữ liệu"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Đã chọn tệp: <strong className="text-slate-800">{selectedFileName}</strong>
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Chọn phương thức khôi phục:
            </label>

            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  importMode === 'replace'
                    ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold block">Ghi đè (Khuyên dùng)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Xóa sạch dữ liệu cũ và thay thế toàn bộ bằng dữ liệu từ tệp sao lưu.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  importMode === 'merge'
                    ? 'border-emerald-600 bg-emerald-50/40 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold block">Gộp dữ liệu (Merge)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Giữ nguyên các giao dịch hiện tại và nhập thêm các giao dịch mới từ tệp.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => setImportModalOpen(false)} fullWidth>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleExecuteImport} fullWidth>
              Bắt đầu khôi phục
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showSeedConfirm}
        onClose={() => setShowSeedConfirm(false)}
        onConfirm={handleSeedData}
        variant="primary"
        title="Xác nhận nạp dữ liệu mẫu"
        message="Hệ thống sẽ thêm 12 giao dịch mẫu vào cơ sở dữ liệu hiện tại để bạn trải nghiệm các biểu đồ và báo cáo."
        confirmText="Nạp dữ liệu mẫu"
      />

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        variant="danger"
        title="Xác nhận xóa toàn bộ dữ liệu"
        message={`Hành động này sẽ xóa vĩnh viễn tất cả ${transactions.length} giao dịch hiện có trên trình duyệt. Bạn có chắc chắn không?`}
        confirmText="Xác nhận xóa sạch"
      />
    </div>
  );
};
