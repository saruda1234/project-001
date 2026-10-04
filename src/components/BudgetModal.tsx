import React, { useState, useEffect } from 'react';
import { X, Check, Target, AlertCircle, Sparkles } from 'lucide-react';
import type { Budget } from '../types';
import { formatMonthYear, formatCurrency } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (monthlyBudget: number, savingsGoal: number) => Promise<void>;
  currentMonth: string;
  existingBudget?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentMonth,
  existingBudget,
}) => {
  const [budgetVal, setBudgetVal] = useState<string>('');
  const [savingsVal, setSavingsVal] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBudget) {
      setBudgetVal(existingBudget.monthlyBudget ? existingBudget.monthlyBudget.toString() : '');
      setSavingsVal(existingBudget.savingsGoal ? existingBudget.savingsGoal.toString() : '');
    } else {
      setBudgetVal('');
      setSavingsVal('');
    }
    setError(null);
  }, [existingBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const b = parseFloat(budgetVal);
    const s = parseFloat(savingsVal) || 0;

    if (isNaN(b) || b < 0) {
      setError('กรุณาระบุงบประมาณรายเดือนที่ถูกต้อง (ไม่ต่ำกว่า 0)');
      return;
    }
    if (s < 0) {
      setError('เป้าหมายเงินออมต้องไม่ต่ำกว่า 0');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(b, s);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกงบประมาณได้');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">ตั้งค่างบประมาณ</h2>
              <p className="text-[11px] text-slate-500">ประจำเดือน {formatMonthYear(currentMonth)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              งบประมาณรายจ่ายสูงสุดสำหรับเดือนนี้ (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="เช่น 15000"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ระบบจะคอยติดตามและแจ้งเตือนเมื่อยอดใช้จ่ายเข้าใกล้งบประมาณนี้
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เป้าหมายเงินออมประจำเดือนนี้ (บาท - ไม่บังคับ)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="เช่น 5000"
                value={savingsVal}
                onChange={(e) => setSavingsVal(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-teal-900 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              การตั้งงบประมาณจะช่วยให้คุณควบคุมค่าใช้จ่ายได้อย่างมีวินัย และเพิ่มอัตราการออมในแต่ละเดือน
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
