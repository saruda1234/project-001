export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  monthlyBudget: number;
  savingsGoal?: number;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: '🍲', color: '#f97316' },
  { id: 'transport', name: 'การเดินทาง / ค่าน้ำมัน', type: 'expense', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', type: 'expense', icon: '🛍️', color: '#ec4899' },
  { id: 'bills', name: 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต', type: 'expense', icon: '💡', color: '#eab308' },
  { id: 'housing', name: 'ค่าเช่าห้อง / ค่าบ้าน', type: 'expense', icon: '🏠', color: '#8b5cf6' },
  { id: 'entertainment', name: 'บันเทิง / ท่องเที่ยว', type: 'expense', icon: '🎬', color: '#a855f7' },
  { id: 'healthcare', name: 'สุขภาพ / ยารักษาโรค', type: 'expense', icon: '💊', color: '#10b981' },
  { id: 'education', name: 'การศึกษา / หนังสือ', type: 'expense', icon: '📚', color: '#06b6d4' },
  { id: 'family', name: 'ให้ครอบครัว / กตัญญู', type: 'expense', icon: '👨‍👩‍👧', color: '#f43f5e' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: '📦', color: '#64748b' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้างประจำ', type: 'income', icon: '💼', color: '#10b981' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: '🏪', color: '#059669' },
  { id: 'freelance', name: 'ฟรีแลนซ์ / รับจ้างเสริม', type: 'income', icon: '💻', color: '#0ea5e9' },
  { id: 'investment', name: 'ผลตอบแทนการลงทุน / ปันผล', type: 'income', icon: '📈', color: '#6366f1' },
  { id: 'bonus', name: 'โบนัส / เงินรางวัลพิเศษ', type: 'income', icon: '🎁', color: '#8b5cf6' },
  { id: 'interest', name: 'ดอกเบี้ยเงินฝาก', type: 'income', icon: '🏦', color: '#14b8a6' },
  { id: 'other_income', name: 'รายได้อื่นๆ', type: 'income', icon: '✨', color: '#84cc16' },
];

export const PAYMENT_METHODS = [
  { id: 'transfer', name: 'โอนเงิน / Mobile Banking', icon: '📱' },
  { id: 'cash', name: 'เงินสด', icon: '💵' },
  { id: 'credit', name: 'บัตรเครดิต', icon: '💳' },
  { id: 'promptpay', name: 'พร้อมเพย์ QR Code', icon: '⚡' },
  { id: 'other', name: 'อื่นๆ', icon: '📝' },
];
