import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../types';
import { formatCurrency, formatMonthYear, THAI_MONTHS_SHORT } from '../utils/formatters';
import { PieChart as PieIcon, BarChart3, TrendingUp, TrendingDown, Layers, Calendar, ChevronRight } from 'lucide-react';

interface ChartsViewProps {
  transactions: Transaction[];
  currentMonth: string;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ transactions, currentMonth }) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [chartSubTab, setChartSubTab] = useState<'expense' | 'income'>('expense');

  // Filter transactions for current month
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonth));
  }, [transactions, currentMonth]);

  // Aggregate by Category
  const categoryStats = useMemo(() => {
    const expenses = monthlyTransactions.filter((t) => t.type === chartSubTab);
    const totalAmount = expenses.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, { amount: number; count: number }>();
    expenses.forEach((t) => {
      const current = map.get(t.category) || { amount: 0, count: 0 };
      map.set(t.category, {
        amount: current.amount + t.amount,
        count: current.count + 1,
      });
    });

    const categoryList = chartSubTab === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

    const items = Array.from(map.entries()).map(([name, stat]) => {
      const meta = categoryList.find((c) => c.name === name);
      return {
        name,
        amount: stat.amount,
        count: stat.count,
        percent: totalAmount > 0 ? (stat.amount / totalAmount) * 100 : 0,
        color: meta?.color || '#94a3b8',
        icon: meta?.icon || '🏷️',
      };
    });

    // Sort descending by amount
    items.sort((a, b) => b.amount - a.amount);
    return { items, totalAmount };
  }, [monthlyTransactions, chartSubTab]);

  // 6-Month Comparison Trends
  const monthlyTrends = useMemo(() => {
    const [currY, currM] = currentMonth.split('-').map(Number);
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currY, currM - 1 - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(ym);
    }

    return months.map((ym) => {
      const monthTx = transactions.filter((t) => t.date.startsWith(ym));
      const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const [y, m] = ym.split('-').map(Number);
      return {
        monthKey: ym,
        label: `${THAI_MONTHS_SHORT[m - 1]} ${String(y + 543).slice(-2)}`,
        income,
        expense,
        net: income - expense,
      };
    });
  }, [transactions, currentMonth]);

  // Daily Expense Distribution in current month
  const dailyDistribution = useMemo(() => {
    const [y, m] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = String(i + 1).padStart(2, '0');
      const dateKey = `${currentMonth}-${dayStr}`;
      const dayTx = monthlyTransactions.filter((t) => t.date === dateKey);
      const income = dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = dayTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { day: i + 1, dateKey, income, expense };
    });
    return days;
  }, [monthlyTransactions, currentMonth]);

  // Donut SVG geometry calculations
  const donutSlices = useMemo(() => {
    const total = categoryStats.totalAmount;
    if (total === 0) return [];

    let accumulatedAngle = 0;
    const radius = 80;
    const cx = 100;
    const cy = 100;

    return categoryStats.items.map((item, index) => {
      const sliceAngle = (item.amount / total) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle = endAngle;

      // Deg to Rad
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData =
        sliceAngle >= 359.99
          ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`
          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        ...item,
        pathData,
        sliceAngle,
        startAngle,
        endAngle,
      };
    });
  }, [categoryStats]);

  const maxTrendVal = Math.max(
    ...monthlyTrends.map((t) => Math.max(t.income, t.expense)),
    1000
  );

  const maxDailyExpense = Math.max(
    ...dailyDistribution.map((d) => d.expense),
    500
  );

  return (
    <div className="space-y-6">
      {/* Header with Title and Mode Switch */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>รายงานวิเคราะห์การเงิน ประจำเดือน {formatMonthYear(currentMonth)}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              วิเคราะห์พฤติกรรมการใช้จ่ายและกระแสเงินสด พร้อมเปรียบเทียบแนวโน้มย้อนหลัง 6 เดือน
            </p>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 self-start md:self-auto border border-slate-200/60">
            <button
              onClick={() => {
                setChartSubTab('expense');
                setActiveSegment(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartSubTab === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สัดส่วนรายจ่าย
            </button>
            <button
              onClick={() => {
                setChartSubTab('income');
                setActiveSegment(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartSubTab === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สัดส่วนรายรับ
            </button>
          </div>
        </div>

        {/* Breakdown Section: Donut + Legend */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Donut Chart Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {categoryStats.totalAmount > 0 ? (
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 transform">
                  {/* Background track */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#f1f5f9" strokeWidth="24" />

                  {donutSlices.map((slice, idx) => {
                    const isHovered = activeSegment === idx;
                    return (
                      <path
                        key={idx}
                        d={slice.pathData}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isHovered ? 28 : 22}
                        strokeLinecap="round"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setActiveSegment(idx)}
                        onMouseLeave={() => setActiveSegment(null)}
                      />
                    );
                  })}
                </svg>

                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  {activeSegment !== null && donutSlices[activeSegment] ? (
                    <div>
                      <span className="text-xl">{donutSlices[activeSegment].icon}</span>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5">
                        {donutSlices[activeSegment].name}
                      </p>
                      <p className="text-base font-bold text-slate-800">
                        {formatCurrency(donutSlices[activeSegment].amount)}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-700">
                        {donutSlices[activeSegment].percent.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs text-slate-400 font-medium">
                        รวม{chartSubTab === 'expense' ? 'รายจ่าย' : 'รายรับ'}
                      </span>
                      <p className="text-lg font-bold text-slate-800 tracking-tight">
                        {formatCurrency(categoryStats.totalAmount)}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {categoryStats.items.length} หมวดหมู่
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-64 h-64 rounded-full border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6">
                <PieIcon className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-500">ไม่มีข้อมูลธุรกรรมในเดือนนี้</p>
                <p className="text-[11px] text-slate-400 mt-1">เริ่มบันทึกเพื่อดูกราฟวิเคราะห์</p>
              </div>
            )}
          </div>

          {/* Category List Breakdown */}
          <div className="lg:col-span-7">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>หมวดหมู่ยอดนิยม ({categoryStats.items.length})</span>
              <span>สัดส่วน & ยอดรวม</span>
            </h3>

            {categoryStats.items.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {categoryStats.items.map((cat, idx) => {
                  const isHovered = activeSegment === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveSegment(idx)}
                      onMouseLeave={() => setActiveSegment(null)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? 'bg-slate-50 border-slate-300 shadow-xs'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({cat.count} รายการ)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{formatCurrency(cat.amount)}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-medium">
                            {cat.percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(cat.percent, 2)}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">ยังไม่มีรายการบันทึกสำหรับเดือนนี้</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6-Month Income vs Expense Trends Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>แนวโน้มรายรับ-รายจ่าย ย้อนหลัง 6 เดือน</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">เปรียบเทียบรายได้และค่าใช้จ่ายของแต่ละเดือน</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-600 font-medium">รายรับ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-600 font-medium">รายจ่าย</span>
            </div>
          </div>
        </div>

        {/* Bar Chart Visual */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-200 px-2">
          {monthlyTrends.map((trend, idx) => {
            const incomeHeight = maxTrendVal > 0 ? (trend.income / maxTrendVal) * 100 : 0;
            const expenseHeight = maxTrendVal > 0 ? (trend.expense / maxTrendVal) * 100 : 0;
            const isCurrent = trend.monthKey === currentMonth;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] rounded-lg py-1 px-2 pointer-events-none mb-2 z-10 whitespace-nowrap shadow-lg">
                  <p className="text-emerald-300">รับ: {formatCurrency(trend.income)}</p>
                  <p className="text-rose-300">จ่าย: {formatCurrency(trend.expense)}</p>
                  <p className="font-semibold border-t border-slate-700 mt-0.5 pt-0.5">
                    คงเหลือ: {formatCurrency(trend.net)}
                  </p>
                </div>

                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                  {/* Income bar */}
                  <div
                    className="w-1/2 max-w-[24px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300 relative"
                    style={{ height: `${Math.max(incomeHeight, 4)}%` }}
                    title={`รายรับ: ${formatCurrency(trend.income)}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-1/2 max-w-[24px] bg-rose-500 hover:bg-rose-600 rounded-t-md transition-all duration-300 relative"
                    style={{ height: `${Math.max(expenseHeight, 4)}%` }}
                    title={`รายจ่าย: ${formatCurrency(trend.expense)}`}
                  />
                </div>

                {/* X-axis Month Label */}
                <span
                  className={`mt-2 text-[11px] truncate ${
                    isCurrent ? 'font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
                  }`}
                >
                  {trend.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Expense Distribution in Current Month */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>การกระจายตัวของรายจ่ายรายวัน (ในเดือนนี้)</span>
            </h3>
            <p className="text-xs text-slate-500">ดูว่าในแต่ละวันของเดือน มีการใช้จ่ายมากหรือน้อยเพียงใด</p>
          </div>
        </div>

        <div className="h-32 flex items-end gap-1 pt-4 pb-2 border-b border-slate-200 overflow-x-auto">
          {dailyDistribution.map((d) => {
            const barH = maxDailyExpense > 0 ? (d.expense / maxDailyExpense) * 100 : 0;
            const hasData = d.expense > 0;

            return (
              <div key={d.day} className="flex-1 min-w-[14px] flex flex-col items-center h-full justify-end group">
                <div
                  className={`w-full rounded-t-xs transition-all ${
                    hasData ? 'bg-amber-400 group-hover:bg-amber-500' : 'bg-slate-100'
                  }`}
                  style={{ height: `${Math.max(barH, 3)}%` }}
                  title={`วันที่ ${d.day}: ${formatCurrency(d.expense)}`}
                />
                <span className="text-[9px] text-slate-400 mt-1">{d.day % 5 === 0 || d.day === 1 ? d.day : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
