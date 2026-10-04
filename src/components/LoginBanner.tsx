import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, BarChart3, Database, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginBanner: React.FC = () => {
  const { signInWithGoogle, error } = useAuth();

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden my-6">
      {/* Background glow effects */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
          <Database className="w-3.5 h-3.5" />
          <span>เชื่อมต่อกับ Firebase (Project 001) เรียบร้อยแล้ว</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          จัดการรายรับ-รายจ่ายของคุณ <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            วิเคราะห์แม่นยำ ทุกเดือน
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
          เข้าสู่ระบบด้วยบัญชี Gmail ของคุณ เพื่อเริ่มบันทึกธุรกรรม สรุปผลรายเดือน พร้อมกราฟสถิติวิเคราะห์ทางการเงินและระบบคลาวด์ซิงก์แบบเรียลไทม์
        </p>

        {/* Feature bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>สรุปผลรายรับ-รายจ่าย รายเดือนอัตโนมัติ</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>กราฟวิเคราะห์สัดส่วนค่าใช้จ่าย & แนวโน้ม 6 เดือน</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>ระบบงบประมาณรายเดือน แจ้งเตือนเมื่อใกล้เต็ม</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>บันทึกปลอดภัยใน Firebase เฉพาะบัญชีของคุณ</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-black/20 transition-all active:scale-98 cursor-pointer"
          >
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span>เข้าสู่ระบบด้วย Gmail (Google Login)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
