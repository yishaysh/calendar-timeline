import React, { useState } from 'react';
import { useTimelineStore } from '../../store/TimelineContext';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  ExternalLink,
  X,
  Server,
  Layers,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const NeonDatabaseModal: React.FC = () => {
  const {
    isDbModalOpen,
    setIsDbModalOpen,
    dbStatus,
    isSyncing,
    syncWithDatabase,
    pushAllToDatabase,
    items,
  } = useTimelineStore();

  const [copied, setCopied] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isDbModalOpen) return null;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(
      'DATABASE_URL="postgres://username:password@ep-your-endpoint-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePushAll = async () => {
    setSyncFeedback(null);
    const res = await pushAllToDatabase();
    if (res.success) {
      setSyncFeedback({
        message: `סונכרנו בהצלחה ${res.count} פריטים אל דאטהבייס Neon!`,
        type: 'success',
      });
    } else {
      setSyncFeedback({
        message: res.error || 'נכשל בסנכרון. ודא שה-DATABASE_URL מוגדר כראוי.',
        type: 'error',
      });
    }
  };

  const handlePullAll = async () => {
    setSyncFeedback(null);
    await syncWithDatabase();
    setSyncFeedback({
      message: 'הסנכרון מול מסד הנתונים הסתיים.',
      type: 'success',
    });
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slateTheme-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                חיבור מסד נתונים Neon Serverless Postgres
              </h2>
              <p className="text-xs text-slate-400">
                סנכרון ענן מלא, גיבוי מרכזי ושמירת אירועי ציר הזמן
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDbModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              dbStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : dbStatus === 'checking'
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {dbStatus === 'connected' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : dbStatus === 'checking' ? (
                <RefreshCw className="w-6 h-6 text-sky-400 animate-spin shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {dbStatus === 'connected'
                    ? 'מסד נתונים Neon מחובר ומסונכרן'
                    : dbStatus === 'checking'
                    ? 'בודק חיבור למסד הנתונים...'
                    : 'מצב מקומי פעיל (LocalStorage)'}
                </div>
                <div className="text-xs opacity-85">
                  {dbStatus === 'connected'
                    ? `פעיל בענן. כל שינוי בציר הזמן נשמר אוטומטית בענן Neon. (${items.length} פריטים שמורים)`
                    : 'הנתונים נשמרים כרגע בדפדפן המקומי בלבד. חבר מחרוזת התחברות לסנכרון ענן.'}
                </div>
              </div>
            </div>

            <button
              onClick={handlePullAll}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              בדיקת חיבור
            </button>
          </div>

          {/* Feedback Alert */}
          {syncFeedback && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                syncFeedback.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
              }`}
            >
              {syncFeedback.message}
            </div>
          )}

          {/* Quick Setup Guide */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              כיצד להגדיר חיבור ב-3 שלבים:
            </h3>

            <div className="grid gap-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="font-semibold text-slate-100">
                    יצירת מסד נתונים חינמי ב-Neon
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    היכנס ל-
                    <a
                      href="https://console.neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline mx-1 inline-flex items-center gap-0.5"
                    >
                      console.neon.tech
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    וצור פרויקט חדש (ללא צורך בכרטיס אשראי).
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="w-full">
                  <div className="font-semibold text-slate-100">
                    העתקת מחרוזת ההתחברות (Connection String)
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    העתק את כתובת ה-Postgres מדשבורד ה-Neon (בחרו בפורמט Pooled connection עם סיומת -pooler).
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                    <span className="truncate">DATABASE_URL="postgres://..."</span>
                    <button
                      onClick={handleCopyEnv}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'הועתק' : 'העתק תבנית'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="font-semibold text-slate-100">
                    הגדרת משתנה הסביבה
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    • <strong>בלוקלהוסט:</strong> הדבק את המחרוזת בקובץ <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">.env</code> בפרויקט תחת השם <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">DATABASE_URL</code>.
                    <br />
                    • <strong>ב-Vercel:</strong> הגדר את <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">DATABASE_URL</code> תחת Settings ➔ Environment Variables.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>הטבלה <code className="text-slate-200">timeline_items</code> והאינדקסים נוצרים אוטומטית בהתחברות</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePushAll}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                העלה את כל הנתונים המקומיים ל-Neon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
