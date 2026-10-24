import React, { useState, useEffect, useRef } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Settings2,
} from 'lucide-react';

export const AdminAuthModal: React.FC = () => {
  const {
    isAdmin,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    isAdminModalOpen,
    setIsAdminModalOpen,
    adminModalMessage,
  } = useTimelineStore();

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on open
  useEffect(() => {
    if (isAdminModalOpen) {
      setPasswordInput('');
      setErrorMessage('');
      setSuccessMessage('');
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAdminModalOpen]);

  if (!isAdminModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMessage('נא להזין סיסמת מנהל');
      return;
    }

    const success = loginAdmin(passwordInput.trim());
    if (success) {
      setErrorMessage('');
      setPasswordInput('');
    } else {
      setErrorMessage('סיסמת מנהל שגויה. נסה שוב (ברירת מחדל: admin123)');
      inputRef.current?.select();
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!oldPassword.trim()) {
      setErrorMessage('נא להזין את הסיסמה הנוכחית');
      return;
    }
    if (newPassword.trim().length < 4) {
      setErrorMessage('הסיסמה החדשה חייבת להכיל לפחות 4 תווים');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('הסיסמה החדשה ואימות הסיסמה אינם תואמים');
      return;
    }

    const res = changeAdminPassword(oldPassword.trim(), newPassword.trim());
    if (res.success) {
      setSuccessMessage('סיסמת המנהל עודכנה בהצלחה!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setSuccessMessage('');
      }, 1500);
    } else {
      setErrorMessage(res.error || 'שגיאה בעדכון הסיסמה');
    }
  };

  return (
    <div
      dir="rtl"
      id="admin-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsAdminModalOpen(false)}
    >
      <div
        id="admin-auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl text-slate-100 p-6 flex flex-col gap-5 animate-scaleUp"
      >
        {/* Top Accent Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            isAdmin
              ? 'from-emerald-400 via-teal-400 to-cyan-400'
              : 'from-amber-400 via-yellow-400 to-amber-600'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={() => setIsAdminModalOpen(false)}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
          title="סגור"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pt-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg ${
              isAdmin
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-emerald-950/40'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-amber-950/40'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              {isAdmin ? 'פאנל מנהל מערכת' : 'כניסת מנהל מערכת'}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950 text-amber-300 border-amber-500/40'
                }`}
              >
                {isAdmin ? 'הרשאות מלאות' : 'נעול לעריכה'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAdmin
                ? 'אתה מחובר כמנהל. הרשאות עריכה, הוספה ומחיקה פתוחות.'
                : (adminModalMessage || 'עריכה והוספת אירועים מוגבלות למנהל בלבד.')}
            </p>
          </div>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* BODY: Mode 1 - Login Form (When not admin) */}
        {!isAdmin && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                סיסמת מנהל:
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="הזן סיסמת מנהל (ברירת מחדל: admin123)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 pl-10 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <span>💡 מידע שימושי:</span>
              </div>
              <p>
                סיסמת ברירת המחדל הראשונית הינה <span className="font-mono text-amber-200 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">admin123</span>. לאחר ההתחברות תוכל לעדכן אותה לכל סיסמה מבוקשת.
              </p>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                id="btn-admin-login-submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                <span>התחבר ופתח הרשאות</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                המשך בצפייה
              </button>
            </div>
          </form>
        )}

        {/* BODY: Mode 2 - Authenticated Admin Management */}
        {isAdmin && (
          <div className="space-y-4">
            {!isChangingPassword ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>מצב מנהל פעיל בהצלחה</span>
                  </div>
                  <p className="leading-relaxed">
                    כעת יש לך גישה מלאה:
                    <br />• הוספת תקופות, אירועים ואישים חדשים
                    <br />• עריכה ומחיקה של כל פריט בציר הזמן
                    <br />• הוספת פריטים דרך עוזר ה-AI
                    <br />• סנכרון ושמירה ישירה למסד הנתונים Neon
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Settings2 className="w-4 h-4 text-amber-400" />
                    <span>שינוי סיסמת מנהל</span>
                  </button>

                  <button
                    onClick={() => {
                      logoutAdmin();
                      setIsAdminModalOpen(false);
                    }}
                    id="btn-admin-logout"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>נעילת ציר הזמן (יציאה ממצב מנהל)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Sub-form: Change Password */
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  הגדרת סיסמת מנהל חדשה:
                </h4>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">סיסמה נוכחית:</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="הזן סיסמה נוכחית"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">סיסמה חדשה (מינימום 4 תווים):</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="הזן סיסמה חדשה"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">אימות סיסמה חדשה:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="הזן שוב את הסיסמה החדשה"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    שמור סיסמה חדשה
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setErrorMessage('');
                    }}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
