import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, LogIn, LogOut, PieChart, ShieldCheck, ChevronLeft, ChevronRight, Calendar, SlidersHorizontal, Download } from 'lucide-react';
import { formatMonthYear, THAI_MONTHS } from '../utils/formatters';

interface NavbarProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
  onOpenBudgetModal: () => void;
  onOpenExportModal: () => void;
  activeTab: 'all' | 'charts' | 'history';
  setActiveTab: (tab: 'all' | 'charts' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMonth,
  onMonthChange,
  onOpenBudgetModal,
  onOpenExportModal,
  activeTab,
  setActiveTab,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const prev = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Project 001</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบจัดการรายรับ-รายจ่าย & สรุปผลรายเดือน
              </p>
            </div>
          </div>

          {/* Month Selector Widget */}
          <div className="flex items-center bg-slate-100/90 hover:bg-slate-100 rounded-xl p-1 border border-slate-200/60 shadow-inner">
            <button
              onClick={handlePrevMonth}
              title="เดือนก่อนหน้า"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-3 font-semibold text-slate-800 text-xs sm:text-sm select-none">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatMonthYear(currentMonth)}</span>
            </div>
            <button
              onClick={handleNextMonth}
              title="เดือนถัดไป"
              className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <button
                  onClick={onOpenBudgetModal}
                  title="ตั้งค่างบประมาณรายเดือน"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200/80"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>ตั้งงบประมาณ</span>
                </button>

                <button
                  onClick={onOpenExportModal}
                  title="ส่งออกรายงาน / CSV"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200/80"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>ส่งออกข้อมูล</span>
                </button>

                {/* Profile menu */}
                <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-emerald-500/30 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center justify-center text-xs border border-emerald-200">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="hidden lg:block text-left max-w-[130px]">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate" title={user.email || ''}>
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={signOutUser}
                    title="ออกจากระบบ"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-xl border border-slate-300 shadow-xs hover:shadow-sm font-medium text-xs sm:text-sm transition-all active:scale-[0.98]"
              >
                {/* Google Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.43 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.28 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span className="hidden sm:inline">เข้าสู่ระบบด้วย Gmail</span>
                <span className="sm:hidden">เข้าสู่ระบบ</span>
              </button>
            )}
          </div>

        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center space-x-1 border-t border-slate-100 py-1.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ภาพรวม & รายการทั้งหมด
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'charts'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            กราฟวิเคราะห์ข้อมูล
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            ประวัติธุรกรรม
          </button>
        </div>
      </div>
    </header>
  );
};
