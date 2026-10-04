import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  Tag,
  CreditCard,
} from 'lucide-react';
import type { Transaction, TransactionType } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../types';
import { formatCurrency, formatThaiDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  currentMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onAddNew: () => void;
  onSeedDemoData?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentMonth,
  onEdit,
  onDelete,
  onAddNew,
  onSeedDemoData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter for the selected month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  // Available categories in the month for dropdown
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    monthlyTransactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [monthlyTransactions]);

  // Filtered by search, type, and category
  const filteredTransactions = useMemo(() => {
    return monthlyTransactions.filter((tx) => {
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchSearch =
        !searchTerm.trim() ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchType && matchCategory && matchSearch;
    });
  }, [monthlyTransactions, typeFilter, categoryFilter, searchTerm]);

  // Group by Date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filteredTransactions.forEach((t) => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });

    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      items: map.get(date)!,
      dayIncome: map.get(date)!.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      dayExpense: map.get(date)!.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }));
  }, [filteredTransactions]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const getCategoryMeta = (name: string, type: TransactionType) => {
    const list = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;
    return list.find((c) => c.name === name) || { icon: '🏷️', color: '#64748b' };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่, โน้ต..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>

          {/* Category Dropdown */}
          {availableCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">ทุกหมวดหมู่ ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Add New Transaction Button */}
        <button
          onClick={onAddNew}
          className="self-stretch sm:self-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรายการใหม่</span>
        </button>
      </div>

      {/* Transactions List Content */}
      <div className="divide-y divide-slate-100">
        {groupedByDate.length > 0 ? (
          groupedByDate.map((group) => (
            <div key={group.date} className="p-4 sm:p-5">
              {/* Date Header with Daily Subtotals */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatThaiDate(group.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600 font-medium">
                      +รับ {formatCurrency(group.dayIncome)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600 font-medium">
                      -จ่าย {formatCurrency(group.dayExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions for this date */}
              <div className="space-y-2">
                {group.items.map((tx) => {
                  const meta = getCategoryMeta(tx.category, tx.type);
                  const isDeleting = deletingId === tx.id;
                  const isConfirming = deleteConfirmId === tx.id;

                  return (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100/80 transition-all gap-2"
                    >
                      {/* Left: Category Icon + Description */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                          style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                        >
                          <span>{meta.icon}</span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {tx.category}
                            </span>
                            {tx.paymentMethod && (
                              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200/60">
                                {tx.paymentMethod}
                              </span>
                            )}
                          </div>
                          {tx.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5 max-w-sm">
                              {tx.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount + Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {tx.paymentMethod && (
                          <span className="sm:hidden px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                            {tx.paymentMethod}
                          </span>
                        )}

                        <div className="text-right">
                          <span
                            className={`text-sm sm:text-base font-bold tracking-tight ${
                              tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                          {isConfirming ? (
                            <div className="flex items-center gap-1 animate-in fade-in">
                              <button
                                onClick={() => handleDelete(tx.id)}
                                disabled={isDeleting}
                                className="px-2 py-1 text-[10px] font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
                              >
                                {isDeleting ? '...' : 'ลบจริง'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 text-[10px] font-semibold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => onEdit(tx)}
                                title="แก้ไขรายการ"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(tx.id)}
                                title="ลบรายการ"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">ยังไม่มีรายการสำหรับเงื่อนไขนี้</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              คุณสามารถเริ่มบันทึกรายรับหรือรายจ่ายสำหรับเดือนนี้ได้ทันที ข้อมูลจะถูกจัดเก็บลง Firebase อย่างปลอดภัย
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={onAddNew}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มรายการแรก</span>
              </button>
              {onSeedDemoData && monthlyTransactions.length === 0 && (
                <button
                  onClick={onSeedDemoData}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  <span>✨ ใส่ข้อมูลตัวอย่าง (Demo Data)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
