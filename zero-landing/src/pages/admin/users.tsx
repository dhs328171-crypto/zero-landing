import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  Search, Eye, EyeOff, KeyRound, Trash2, Lock, Unlock, X,
  Shield, Clock, AlertTriangle, CheckCircle2, RefreshCw,
  History, Crown, User as UserIcon, Loader2, Copy
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  country: string | null;
  website: string | null;
  verified: boolean;
  joinedAt: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
  hasVault: boolean;
}

interface LoginAttempt {
  id: string;
  email: string | null;
  ip: string;
  userAgent: string | null;
  success: boolean;
  reason: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

interface UsersResp {
  items: User[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "locked" | "admins">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state
  const [revealed, setRevealed] = useState<{ user: User; password: string; at: string } | null>(null);
  const [revealing, setRevealing] = useState<string | null>(null);
  const [showLoginHistory, setShowLoginHistory] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [confirmReset, setConfirmReset] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `&q=${encodeURIComponent(search)}` : "";
      const data = await apiGet<UsersResp>(`/admin/users?page=${page}&limit=20&filter=${filter}${q}`);
      setUsers(data.items);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (e: any) {
      setToast({ msg: e.message, type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleReveal = async (user: User) => {
    setRevealing(user.id);
    try {
      const res = await apiPost<{ password: string; revealedAt: string }>(
        `/admin/users/${user.id}/reveal-password`
      );
      setRevealed({ user, password: res.password, at: res.revealedAt });
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setRevealing(null);
    }
  };

  const handleReset = async (user: User) => {
    try {
      const res = await apiPost<{ password: string; generatedAt: string }>(
        `/admin/users/${user.id}/reset-password`
      );
      setConfirmReset(null);
      setRevealed({ user, password: res.password, at: res.generatedAt });
      showToast("تم إعادة تعيين كلمة المرور بنجاح");
      loadUsers();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleToggleLock = async (user: User) => {
    try {
      const lock = !user.lockedUntil || new Date(user.lockedUntil).getTime() <= Date.now();
      await apiPut(`/admin/users/${user.id}/lock`, { lock });
      showToast(lock ? "تم قفل الحساب" : "تم فك قفل الحساب");
      loadUsers();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleRoleChange = async (user: User) => {
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await apiPut(`/admin/users/${user.id}/role`, { role: newRole });
      showToast(`تم تغيير الدور إلى ${newRole === "admin" ? "أدمن" : "مستخدم"}`);
      loadUsers();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await apiDelete(`/admin/users/${user.id}`);
      setConfirmDelete(null);
      showToast("تم حذف المستخدم");
      loadUsers();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const loadHistory = async (user: User) => {
    setShowLoginHistory(user);
    setHistoryLoading(true);
    setLoginHistory([]);
    try {
      const res = await apiGet<{ items: LoginAttempt[] }>(`/admin/users/${user.id}/login-history?limit=30`);
      setLoginHistory(res.items);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("تم النسخ");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <KeyRound size={22} className="text-primary" />
              إدارة المستخدمين وكلمات المرور
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              // {total} مستخدم — عرض كلمات المرور، إعادة التعيين، القفل، والأدوار
            </p>
          </div>
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg hover:border-primary/40 transition-colors"
          >
            <RefreshCw size={12} /> تحديث
          </button>
        </div>

        {/* Warning banner */}
        <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="text-yellow-400 font-semibold mb-1">⚠️ تنبيه أمني</p>
            <p className="text-muted-foreground">
              كل عملية عرض لكلمة مرور أو إعادة تعيين تُسجَّل في سجل التدقيق (Audit Log) مع الـ IP والوقت.
              استخدم هذه الميزة فقط عند الضرورة القصوى لدعم العملاء. يمكن مراجعة السجل من صفحة <span className="text-yellow-400">الأمان</span>.
            </p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="بحث بالاسم أو البريد أو الهاتف..."
              className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {([
              { v: "all", l: "الكل" },
              { v: "active", l: "نشط" },
              { v: "locked", l: "مقفل" },
              { v: "admins", l: "أدمن" },
            ] as const).map((f) => (
              <button
                key={f.v}
                onClick={() => { setFilter(f.v); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                  filter === f.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 px-5 py-3 border-b border-border text-xs font-mono text-muted-foreground">
            <span>المستخدم</span>
            <span>البريد</span>
            <span>الدور</span>
            <span>آخر دخول</span>
            <span>الحالة</span>
            <span className="text-left">إجراءات</span>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">لا يوجد مستخدمون مطابقون</div>
          ) : (
            <AnimatePresence>
              {users.map((u, i) => {
                const isLocked = u.lockedUntil && new Date(u.lockedUntil).getTime() > Date.now();
                return (
                  <motion.div
                    key={u.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: i * 0.03 }}
                    className="grid grid-cols-[2fr_2fr_1fr_1.5fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-background/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{u.name}</p>
                        {u.role === "admin" && <Crown size={12} className="text-yellow-400 flex-shrink-0" />}
                        {u.verified && <CheckCircle2 size={12} className="text-green-400 flex-shrink-0" />}
                      </div>
                      {u.phone && <p className="text-xs text-muted-foreground font-mono">{u.phone}</p>}
                      <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                        انضم: {new Date(u.joinedAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono text-foreground truncate" dir="ltr">{u.email}</p>
                      {u.lastLoginIp && (
                        <p className="text-[10px] text-muted-foreground/60 font-mono" dir="ltr">{u.lastLoginIp}</p>
                      )}
                    </div>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full border inline-block w-fit ${
                      u.role === "admin"
                        ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                        : "bg-primary/10 text-primary border-primary/30"
                    }`}>
                      {u.role === "admin" ? "أدمن" : "مستخدم"}
                    </span>
                    <div className="text-xs">
                      {u.lastLoginAt ? (
                        <>
                          <p className="text-foreground font-mono">{new Date(u.lastLoginAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</p>
                          <p className="text-muted-foreground/60 font-mono text-[10px]">{u.lastLoginIp}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground/50 font-mono">لم يسجل بعد</span>
                      )}
                    </div>
                    <div>
                      {isLocked ? (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full border bg-red-400/10 text-red-400 border-red-400/30 flex items-center gap-1 w-fit">
                          <Lock size={10} /> مقفل
                        </span>
                      ) : u.failedAttempts > 0 ? (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full border bg-yellow-400/10 text-yellow-400 border-yellow-400/30 flex items-center gap-1 w-fit">
                          <AlertTriangle size={10} /> {u.failedAttempts} محاولات
                        </span>
                      ) : (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full border bg-green-400/10 text-green-400 border-green-400/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={10} /> سليم
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Reveal password */}
                      <button
                        onClick={() => handleReveal(u)}
                        disabled={revealing === u.id || !u.hasVault}
                        title="عرض كلمة المرور"
                        className="p-1.5 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
                      >
                        {revealing === u.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                      </button>
                      {/* Reset password */}
                      <button
                        onClick={() => setConfirmReset(u)}
                        title="إعادة تعيين كلمة المرور"
                        className="p-1.5 text-muted-foreground hover:text-yellow-400 transition-colors"
                      >
                        <KeyRound size={14} />
                      </button>
                      {/* Login history */}
                      <button
                        onClick={() => loadHistory(u)}
                        title="سجل الدخول"
                        className="p-1.5 text-muted-foreground hover:text-blue-400 transition-colors"
                      >
                        <History size={14} />
                      </button>
                      {/* Lock/unlock */}
                      <button
                        onClick={() => handleToggleLock(u)}
                        title={isLocked ? "فك القفل" : "قفل"}
                        className="p-1.5 text-muted-foreground hover:text-orange-400 transition-colors"
                      >
                        {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                      </button>
                      {/* Toggle role */}
                      <button
                        onClick={() => handleRoleChange(u)}
                        title="تبديل الدور"
                        className="p-1.5 text-muted-foreground hover:text-yellow-400 transition-colors"
                      >
                        <Crown size={14} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(u)}
                        title="حذف"
                        className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">صفحة {page} من {totalPages}</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg disabled:opacity-30 hover:border-primary/40 transition-colors"
              >السابق</button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg disabled:opacity-30 hover:border-primary/40 transition-colors"
              >التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* Reveal Password Modal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRevealed(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Eye size={18} className="text-primary" />
                  كلمة مرور: {revealed.user.name}
                </h2>
                <button onClick={() => setRevealed(null)}><X size={18} className="text-muted-foreground" /></button>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-400/5 border border-yellow-400/30 rounded-lg p-3 text-xs text-yellow-400 flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>تم تسجيل هذه العملية في سجل التدقيق. IP: 127.0.0.1 — الوقت: {new Date(revealed.at).toLocaleString("ar-EG")}</span>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">البريد الإلكتروني</label>
                  <p className="text-sm font-mono text-foreground bg-background rounded-lg px-3 py-2 border border-border" dir="ltr">{revealed.user.email}</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">كلمة المرور</label>
                  <div className="relative">
                    <input
                      readOnly
                      value={revealed.password}
                      dir="ltr"
                      className="w-full bg-background border border-primary/40 rounded-lg px-3 pr-10 py-2 text-sm font-mono text-primary focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(revealed.password)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(revealed.password)}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-mono hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Copy size={14} /> نسخ كلمة المرور
                  </button>
                  <button
                    onClick={() => setRevealed(null)}
                    className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono hover:border-primary/40"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Reset Modal */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmReset(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="font-bold text-lg flex items-center gap-2 mb-3">
                <KeyRound size={18} className="text-yellow-400" />
                تأكيد إعادة تعيين كلمة المرور
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                سيتم توليد كلمة مرور جديدة عشوائية للمستخدم <span className="text-foreground font-mono">{confirmReset.name}</span> ({confirmReset.email}).
                كلمة المرور القديمة لن تعمل بعد الآن.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReset(confirmReset)}
                  className="flex-1 bg-yellow-400 text-black py-2.5 rounded-lg text-sm font-mono hover:bg-yellow-400/90"
                >
                  نعم، أعد التعيين
                </button>
                <button
                  onClick={() => setConfirmReset(null)}
                  className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-red-400/40 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="font-bold text-lg flex items-center gap-2 mb-3 text-red-400">
                <Trash2 size={18} />
                حذف مستخدم نهائياً
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                سيتم حذف <span className="text-foreground font-mono">{confirmDelete.name}</span> ({confirmDelete.email}) وكل بياناته نهائياً. لا يمكن التراجع.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 bg-red-400 text-white py-2.5 rounded-lg text-sm font-mono hover:bg-red-400/90"
                >
                  نعم، احذف نهائياً
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login History Modal */}
      <AnimatePresence>
        {showLoginHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLoginHistory(null)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <History size={18} className="text-blue-400" />
                  سجل الدخول — {showLoginHistory.name}
                </h2>
                <button onClick={() => setShowLoginHistory(null)}><X size={18} className="text-muted-foreground" /></button>
              </div>
              <div className="overflow-y-auto space-y-1.5 flex-1">
                {historyLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary" size={20} /></div>
                ) : loginHistory.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">لا يوجد سجل دخول</div>
                ) : (
                  loginHistory.map((a) => (
                    <div key={a.id} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${a.success ? "bg-green-400" : "bg-red-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono">{new Date(a.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.success ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                            {a.success ? "نجح" : "فشل"}
                          </span>
                          {a.reason && <span className="text-[10px] text-muted-foreground font-mono">{a.reason}</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5" dir="ltr">{a.ip} — {a.userAgent?.slice(0, 60)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-mono border ${
              toast.type === "success"
                ? "bg-green-400/10 text-green-400 border-green-400/30"
                : "bg-red-400/10 text-red-400 border-red-400/30"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
