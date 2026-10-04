import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { ChartsView } from './components/ChartsView';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ExportModal } from './components/ExportModal';
import { LoginBanner } from './components/LoginBanner';
import { getCurrentMonth, getTodayDate, formatMonthYear } from './utils/formatters';
import type { Transaction, Budget } from './types';
import {
  subscribeTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeBudget,
  saveBudget,
} from './services/transactionService';
import { Plus, Database, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'charts' | 'history'>('all');

  // Real-time synchronization with Firestore
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudget(null);
      return;
    }

    setDataLoading(true);
    setErrorMsg(null);

    const unsubTx = subscribeTransactions(
      user.uid,
      (data) => {
        setTransactions(data);
        setDataLoading(false);
      },
      (err) => {
        console.error('Subscription error:', err);
        setErrorMsg('ไม่สามารถดึงข้อมูลจาก Firebase ได้: ' + err.message);
        setDataLoading(false);
      }
    );

    const unsubBudget = subscribeBudget(
      user.uid,
      currentMonth,
      (b) => {
        setBudget(b);
      },
      (err) => {
        console.error('Budget subscription error:', err);
      }
    );

    return () => {
      unsubTx();
      unsubBudget();
    };
  }, [user, currentMonth]);

  // Handler for adding/updating a transaction
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (!user) throw new Error('กรุณาเข้าสู่ระบบด้วย Gmail ก่อนบันทึกข้อมูล');

    if (editingTx) {
      await updateTransaction(user.uid, editingTx.id, data);
    } else {
      await addTransaction(user.uid, data);
    }
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    await deleteTransaction(user.uid, id);
  };

  // Handler for saving budget
  const handleSaveBudget = async (monthlyBudget: number, savingsGoal: number) => {
    if (!user) throw new Error('กรุณาเข้าสู่ระบบก่อนตั้งงบประมาณ');
    await saveBudget(user.uid, currentMonth, monthlyBudget, savingsGoal);
  };

  // Seed sample demo data
  const handleSeedDemoData = async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const today = getTodayDate();
      const [y, m] = currentMonth.split('-');

      // Add a few realistic Thai transactions
      await addTransaction(user.uid, {
        type: 'income',
        amount: 35000,
        category: 'เงินเดือน / ค่าจ้างประจำ',
        description: 'เงินเดือนโอนเข้าบัญชี',
        date: `${y}-${m}-01`,
        paymentMethod: 'โอนเงิน / Mobile Banking',
      });
      await addTransaction(user.uid, {
        type: 'income',
        amount: 6500,
        category: 'ฟรีแลนซ์ / รับจ้างเสริม',
        description: 'งานออกแบบกราฟิกส่งลูกค้า',
        date: `${y}-${m}-03`,
        paymentMethod: 'โอนเงิน / Mobile Banking',
      });
      await addTransaction(user.uid, {
        type: 'expense',
        amount: 8500,
        category: 'ค่าเช่าห้อง / ค่าบ้าน',
        description: 'ค่าเช่าคอนโดประจำเดือน',
        date: `${y}-${m}-02`,
        paymentMethod: 'โอนเงิน / Mobile Banking',
      });
      await addTransaction(user.uid, {
        type: 'expense',
        amount: 1450,
        category: 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต',
        description: 'ค่าไฟและอินเทอร์เน็ตบ้าน',
        date: `${y}-${m}-03`,
        paymentMethod: 'พร้อมเพย์ QR Code',
      });
      await addTransaction(user.uid, {
        type: 'expense',
        amount: 350,
        category: 'อาหารและเครื่องดื่ม',
        description: 'มื้อกลางวันและกาแฟสด',
        date: `${y}-${m}-04`,
        paymentMethod: 'โอนเงิน / Mobile Banking',
      });
      await addTransaction(user.uid, {
        type: 'expense',
        amount: 1200,
        category: 'การเดินทาง / ค่าน้ำมัน',
        description: 'เติมน้ำมันรถยนต์',
        date: `${y}-${m}-04`,
        paymentMethod: 'บัตรเครดิต',
      });

      // Also set default budget
      await saveBudget(user.uid, currentMonth, 22000, 10000);
    } catch (err: unknown) {
      console.error('Failed to seed demo data', err);
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Prompt',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              ปิด
            </button>
          </div>
        )}

        {/* When user is NOT signed in */}
        {!user && !authLoading && <LoginBanner />}

        {/* When user is signed in */}
        {user && (
          <>
            {/* Top Quick Actions & Summary Cards */}
            <SummaryCards
              transactions={transactions}
              budget={budget}
              currentMonth={currentMonth}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />

            {/* Content Tabs */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                {/* Visual Analytics */}
                <ChartsView transactions={transactions} currentMonth={currentMonth} />

                {/* Transactions Table / List */}
                <TransactionList
                  transactions={transactions}
                  currentMonth={currentMonth}
                  onAddNew={() => {
                    setEditingTx(null);
                    setIsTxModalOpen(true);
                  }}
                  onEdit={(tx) => {
                    setEditingTx(tx);
                    setIsTxModalOpen(true);
                  }}
                  onDelete={handleDeleteTransaction}
                  onSeedDemoData={handleSeedDemoData}
                />
              </div>
            )}

            {activeTab === 'charts' && (
              <ChartsView transactions={transactions} currentMonth={currentMonth} />
            )}

            {activeTab === 'history' && (
              <TransactionList
                transactions={transactions}
                currentMonth={currentMonth}
                onAddNew={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
                onEdit={(tx) => {
                  setEditingTx(tx);
                  setIsTxModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                onSeedDemoData={handleSeedDemoData}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Add Button for Mobile */}
      {user && (
        <button
          onClick={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          title="เพิ่มรายการใหม่"
          className="sm:hidden fixed right-5 bottom-6 z-40 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/40 flex items-center justify-center transition-transform active:scale-90"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentMonth={currentMonth}
        existingBudget={budget}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        currentMonth={currentMonth}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Project 001</span>
            <span>—</span>
            <span>ระบบจัดการรายรับรายจ่ายบนคลาวด์ Firebase</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Google Authentication</span>
            <span>•</span>
            <span>Firestore Realtime DB</span>
            <span>•</span>
            <span>Monthly Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
