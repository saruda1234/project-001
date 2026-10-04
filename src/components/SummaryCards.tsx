import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { Transaction, Budget } from '../types';

interface SummaryCardsProps {
  transactions: Transaction[];
  budget: Budget | null;
  currentMonth: string;
  onOpenBudgetModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  transactions,
  budget,
  currentMonth,
  onOpenBudgetModal,
}) => {
  // Filter transactions for current month
  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const monthlyBudget = budget?.monthlyBudget || 0;
  const budgetRemaining = monthlyBudget > 0 ? monthlyBudget - totalExpense : 0;
  const budgetSpentPercent = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;
  const isOverBudget = monthlyBudget > 0 && totalExpense > monthlyBudget;

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายรับทั้งหมด</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            +{formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {monthlyTransactions.filter((t) => t.type === 'income').length} รายการรับเข้า
          </p>
        </div>
      </div>

      {/* Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">รายจ่ายทั้งหมด</span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-rose-600 tracking-tight">
            -{formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {monthlyTransactions.filter((t) => t.type === 'expense').length} รายการจ่ายออก
          </p>
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${netBalance >= 0 ? 'bg-indigo-500' : 'bg-amber-500'}`} />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">คงเหลือสุทธิ (Cashflow)</span>
          <div className={`w-8 h-8 rounded-lg ${netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center`}>
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-2xl font-bold tracking-tight ${netBalance >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            อัตราการออม: <span className="font-semibold text-slate-700">{savingsRate}%</span> ของรายรับ
          </p>
        </div>
      </div>

      {/* Monthly Budget Tracker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isOverBudget ? 'bg-rose-500' : 'bg-teal-500'}`} />
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">งบประมาณรายเดือน</span>
          <button
            onClick={onOpenBudgetModal}
            className="text-[11px] text-teal-600 hover:text-teal-700 font-medium underline flex items-center gap-1"
          >
            <Target className="w-3.5 h-3.5" />
            {monthlyBudget > 0 ? 'ปรับงบ' : 'ตั้งงบ'}
          </button>
        </div>

        {monthlyBudget > 0 ? (
          <div className="mt-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">ใช้ไปแล้ว:</span>
              <span className={`text-sm font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                {budgetSpentPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 my-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetSpentPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>งบ: {formatCurrency(monthlyBudget)}</span>
              <span className={budgetRemaining < 0 ? 'text-rose-500 font-semibold' : 'text-slate-600'}>
                {budgetRemaining >= 0 ? `เหลือ: ${formatCurrency(budgetRemaining)}` : `เกินงบ: ${formatCurrency(Math.abs(budgetRemaining))}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-center py-1">
            <p className="text-xs text-slate-400">ยังไม่ได้ตั้งงบประจำเดือนนี้</p>
            <button
              onClick={onOpenBudgetModal}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md hover:bg-teal-100 transition-colors"
            >
              + ตั้งงบประมาณตอนนี้
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
