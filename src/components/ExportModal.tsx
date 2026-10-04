import React from 'react';
import { X, Download, FileSpreadsheet, Printer } from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, formatMonthYear, formatThaiDate } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentMonth: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentMonth,
}) => {
  if (!isOpen) return null;

  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  const exportCSV = () => {
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'วิธีชำระ', 'บันทึกช่วยจำ'];
    const rows = monthlyTransactions.map((t) => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel in Thai
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const printReport = () => {
    window.print();
  };

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">ส่งออกรายงานข้อมูล</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>ช่วงเวลา:</span>
              <span className="font-semibold text-slate-900">{formatMonthYear(currentMonth)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>จำนวนรายการ:</span>
              <span className="font-semibold text-slate-900">{monthlyTransactions.length} รายการ</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>รายรับรวม:</span>
              <span>+{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-medium">
              <span>รายจ่ายรวม:</span>
              <span>-{formatCurrency(totalExpense)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={exportCSV}
              disabled={monthlyTransactions.length === 0}
              className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>ดาวน์โหลดเป็นไฟล์ Excel (CSV)</span>
            </button>

            <button
              onClick={printReport}
              className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์หน้านี้ / บันทึกเป็น PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
