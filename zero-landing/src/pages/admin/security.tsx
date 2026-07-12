import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import {
  ShieldCheck, ShieldAlert, ShieldX, Activity, Ban, KeyRound,
  History, RefreshCw, Loader2, Lock, Unlock, AlertTriangle,
  TrendingUp, TrendingDown, Clock, UserX, Eye
} from "lucide-react";

interface Overview {
  totalUsers: number;
  lockedUsers: number;
  totalBannedIps: number;
  failedLogins24h: number;
  successfulLogins24h: number;
  securityEvents24h: number;
  criticalEvents7d: number;
  auditEntries7d: number;
  topFailingIps: { ip: string; count: number }[];
  loginTrend: { date: string; success: number; fail: number }[];
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

interface BannedIp {
  id: string;
  ip: string;
  reason: string;
  bannedBy: string | null;
  bannedAt: string;
  expiresAt: string | null;
}

interface AuditEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  target: string | null;
  ip: string | null;
  userAgent: string | null;
  meta: any;
  createdAt: string;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: "info" | "warn" | "critical";
  ip: string | null;
  path: string | null;
  detail: string | null;
  blocked: boolean;
  createdAt: string;
}

type Tab = "overview" | "login-attempts" | "banned-ips" | "audit-log" | "events";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  USER_VIEW_PASSWORD: { label: "عرض كلمة مرور", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  USER_RESET_PASSWORD: { label: "إعادة تعيين كلمة مرور", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  USER_CHANGE_ROLE: { label: "تغيير دور", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  USER_LOCK: { label: "قفل مستخدم", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  USER_UNLOCK: { label: "فك قفل مستخدم", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  USER_UNLOCK_MANUAL: { label: "فك قفل يدوي", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  USER_UPDATE: { label: "تحديث مستخدم", color: "text-primary bg-primary/10 border-primary/30" },
  USER_DELETE: { label: "حذف مستخدم", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  USER_CHANGE_PASSWORD: { label: "تغيير كلمة المرور", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  LINK_MASK_CREATE: { label: "إنشاء رابط مموّه", color: "text-primary bg-primary/10 border-primary/30" },
  LINK_MASK_UPDATE: { label: "تعديل رابط مموّه", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  LINK_MASK_DELETE: { label: "حذف رابط مموّه", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  IP_BAN_MANUAL: { label: "حظر IP يدوي", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  IP_UNBAN: { label: "فك حظر IP", color: "text-green-400 bg-green-400/10 border-green-400/30" },
};

export default function AdminSecurity() {
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [bannedIps, setBannedIps] = useState<BannedIp[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [banIp, setBanIp] = useState({ ip: "", reason: "", hours: "24" });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Overview>("/admin/security/overview");
      setOverview(data);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLoginAttempts = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter ? `&filter=${filter}` : "";
      const data = await apiGet<{ items: LoginAttempt[] }>(`/admin/security/login-attempts?limit=50${f}`);
      setLoginAttempts(data.items);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadBannedIps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<{ items: BannedIp[] }>(`/admin/security/banned-ips?limit=100`);
      setBannedIps(data.items);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuditLog = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter ? `&action=${encodeURIComponent(filter)}` : "";
      const data = await apiGet<{ items: AuditEntry[] }>(`/admin/security/audit-log?limit=100${f}`);
      setAuditLog(data.items);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const f = filter ? `&severity=${filter}` : "";
      const data = await apiGet<{ items: SecurityEvent[] }>(`/admin/security/events?limit=100${f}`);
      setEvents(data.items);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (tab === "overview") loadOverview();
    else if (tab === "login-attempts") loadLoginAttempts();
    else if (tab === "banned-ips") loadBannedIps();
    else if (tab === "audit-log") loadAuditLog();
    else if (tab === "events") loadEvents();
  }, [tab, loadOverview, loadLoginAttempts, loadBannedIps, loadAuditLog, loadEvents]);

  const handleBanIp = async () => {
    if (!banIp.ip) { showToast("IP مطلوب", "error"); return; }
    try {
      await apiPost("/admin/security/banned-ips", {
        ip: banIp.ip,
        reason: banIp.reason || "manual ban",
        hours: banIp.hours ? Number(banIp.hours) : undefined,
      });
      setBanIp({ ip: "", reason: "", hours: "24" });
      showToast("تم حظر الـ IP");
      loadBannedIps();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleUnban = async (ip: string) => {
    if (!confirm(`فك حظر ${ip}؟`)) return;
    try {
      await apiDelete(`/admin/security/banned-ips/${ip}`);
      showToast("تم فك الحظر");
      loadBannedIps();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const maxTrend = overview ? Math.max(1, ...overview.loginTrend.map(t => Math.max(t.success, t.fail))) : 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck size={22} className="text-primary" />
              لوحة الأمان والمراقبة
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              // مراقبة المحاولات الفاشلة، IPs المحظورة، وسجل كل إجراءات الأدمن
            </p>
          </div>
          <button
            onClick={() => {
              if (tab === "overview") loadOverview();
              else if (tab === "login-attempts") loadLoginAttempts();
              else if (tab === "banned-ips") loadBannedIps();
              else if (tab === "audit-log") loadAuditLog();
              else if (tab === "events") loadEvents();
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg hover:border-primary/40"
          >
            <RefreshCw size={12} /> تحديث
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
          {([
            { v: "overview", l: "نظرة عامة", icon: ShieldCheck },
            { v: "login-attempts", l: "محاولات الدخول", icon: KeyRound },
            { v: "banned-ips", l: "IPs محظورة", icon: Ban },
            { v: "audit-log", l: "سجل التدقيق", icon: History },
            { v: "events", l: "أحداث أمنية", icon: AlertTriangle },
          ] as const).map(t => (
            <button
              key={t.v}
              onClick={() => { setTab(t.v); setFilter(""); }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-md whitespace-nowrap transition-colors ${
                tab === t.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon size={12} /> {t.l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : tab === "overview" && overview ? (
          <OverviewTab overview={overview} maxTrend={maxTrend} />
        ) : tab === "login-attempts" ? (
          <LoginAttemptsTab
            attempts={loginAttempts}
            filter={filter}
            setFilter={setFilter}
          />
        ) : tab === "banned-ips" ? (
          <BannedIpsTab
            ips={bannedIps}
            banIp={banIp}
            setBanIp={setBanIp}
            onBan={handleBanIp}
            onUnban={handleUnban}
          />
        ) : tab === "audit-log" ? (
          <AuditLogTab entries={auditLog} filter={filter} setFilter={setFilter} />
        ) : tab === "events" ? (
          <EventsTab events={events} filter={filter} setFilter={setFilter} />
        ) : null}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-mono border ${
              toast.type === "success" ? "bg-green-400/10 text-green-400 border-green-400/30"
                : "bg-red-400/10 text-red-400 border-red-400/30"
            }`}
          >{toast.msg}</motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

// ---------- Overview ----------
function OverviewTab({ overview, maxTrend }: { overview: Overview; maxTrend: number }) {
  const cards = [
    { label: "إجمالي المستخدمين", value: overview.totalUsers, icon: KeyRound, color: "text-primary" },
    { label: "حسابات مقفلة", value: overview.lockedUsers, icon: Lock, color: "text-orange-400" },
    { label: "IPs محظورة", value: overview.totalBannedIps, icon: Ban, color: "text-red-400" },
    { label: "محاولات فاشلة (24س)", value: overview.failedLogins24h, icon: TrendingDown, color: "text-red-400" },
    { label: "دخول ناجح (24س)", value: overview.successfulLogins24h, icon: TrendingUp, color: "text-green-400" },
    { label: "أحداث أمنية (24س)", value: overview.securityEvents24h, icon: ShieldAlert, color: "text-yellow-400" },
    { label: "أحداث حرجة (7أ)", value: overview.criticalEvents7d, icon: ShieldX, color: "text-red-400" },
    { label: "مدخلات تدقيق (7أ)", value: overview.auditEntries7d, icon: History, color: "text-blue-400" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <c.icon size={16} className={c.color} />
            </div>
            <div className={`text-2xl font-bold font-mono ${c.color}`}>{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Login trend */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Activity size={14} className="text-primary" />
          اتجاه الدخول (آخر 7 أيام)
        </h3>
        <div className="flex items-end gap-2 h-40">
          {overview.loginTrend.map((t) => (
            <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: "120px" }}>
                <div
                  className="w-full bg-green-400/60 rounded-t hover:bg-green-400 transition-colors"
                  style={{ height: `${(t.success / maxTrend) * 100}%`, minHeight: t.success > 0 ? "4px" : "0" }}
                  title={`نجح: ${t.success}`}
                />
                <div
                  className="w-full bg-red-400/60 rounded-b hover:bg-red-400 transition-colors"
                  style={{ height: `${(t.fail / maxTrend) * 100}%`, minHeight: t.fail > 0 ? "4px" : "0" }}
                  title={`فشل: ${t.fail}`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{t.date.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-sm" /> نجح</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-sm" /> فشل</span>
        </div>
      </div>

      {/* Top failing IPs */}
      {overview.topFailingIps.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <ShieldAlert size={14} className="text-yellow-400" />
            أكثر IPs فشلاً (24 ساعة)
          </h3>
          <div className="space-y-2">
            {overview.topFailingIps.map((ip, i) => (
              <div key={ip.ip} className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">#{i + 1}</span>
                  <span className="text-sm font-mono text-foreground" dir="ltr">{ip.ip}</span>
                </div>
                <span className="text-sm font-mono text-red-400 font-bold">{ip.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Login Attempts ----------
function LoginAttemptsTab({ attempts, filter, setFilter }: {
  attempts: LoginAttempt[];
  filter: string;
  setFilter: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {[
          { v: "", l: "الكل" },
          { v: "failed", l: "فاشلة" },
          { v: "success", l: "ناجحة" },
        ].map(f => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md ${
              filter === f.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >{f.l}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {attempts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">لا توجد محاولات</div>
        ) : attempts.map(a => (
          <div key={a.id} className="flex items-start gap-3 px-5 py-3 border-b border-border/50 hover:bg-background/30">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.success ? "bg-green-400" : "bg-red-400"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono">{a.email || a.user?.email || "—"}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  a.success ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                }`}>{a.success ? "نجح" : "فشل"}</span>
                {a.reason && <span className="text-[10px] text-muted-foreground font-mono">{a.reason}</span>}
                {a.user && <span className="text-[10px] text-muted-foreground">({a.user.name})</span>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-mono" dir="ltr">
                <span>{a.ip}</span>
                <span>•</span>
                <span>{new Date(a.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
              {a.userAgent && <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5 truncate" dir="ltr">{a.userAgent}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Banned IPs ----------
function BannedIpsTab({ ips, banIp, setBanIp, onBan, onUnban }: {
  ips: BannedIp[];
  banIp: { ip: string; reason: string; hours: string };
  setBanIp: (v: any) => void;
  onBan: () => void;
  onUnban: (ip: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Manual ban form */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Ban size={14} className="text-red-400" /> حظر IP يدوياً
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            value={banIp.ip}
            onChange={(e) => setBanIp({ ...banIp, ip: e.target.value })}
            placeholder="IP address"
            dir="ltr"
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
          />
          <input
            value={banIp.reason}
            onChange={(e) => setBanIp({ ...banIp, reason: e.target.value })}
            placeholder="السبب"
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            value={banIp.hours}
            onChange={(e) => setBanIp({ ...banIp, hours: e.target.value })}
            placeholder="عدد ساعات (فارغ=دائم)"
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
          />
          <button
            onClick={onBan}
            className="bg-red-400 text-white rounded-lg py-2 text-sm font-mono hover:bg-red-400/90 flex items-center justify-center gap-2"
          >
            <Ban size={14} /> حظر
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-xs font-mono text-muted-foreground">
          {ips.length} IP محظور
        </div>
        {ips.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">لا يوجد IPs محظورة</div>
        ) : ips.map(b => {
          const expired = b.expiresAt && new Date(b.expiresAt).getTime() < Date.now();
          return (
            <div key={b.id} className="flex items-center gap-3 px-5 py-3 border-b border-border/50 hover:bg-background/30">
              <Ban size={14} className="text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono" dir="ltr">{b.ip}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{b.reason}</span>
                  <span>•</span>
                  <span>بواسطة: {b.bannedBy || "system"}</span>
                  <span>•</span>
                  <span>{new Date(b.bannedAt).toLocaleDateString("ar-EG")}</span>
                  {b.expiresAt && (
                    <>
                      <span>•</span>
                      <span className={expired ? "text-red-400" : "text-yellow-400"}>
                        {expired ? "منتهي" : `حتى ${new Date(b.expiresAt).toLocaleDateString("ar-EG")}`}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => onUnban(b.ip)}
                className="p-1.5 text-muted-foreground hover:text-green-400 transition-colors"
                title="فك الحظر"
              >
                <Unlock size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Audit Log ----------
function AuditLogTab({ entries, filter, setFilter }: {
  entries: AuditEntry[];
  filter: string;
  setFilter: (v: string) => void;
}) {
  const actions = Object.keys(ACTION_LABELS);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 bg-card border border-border rounded-lg p-1 w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap ${
            !filter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}>الكل</button>
        {actions.map(a => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md whitespace-nowrap ${
              filter === a ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>{ACTION_LABELS[a].label}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {entries.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">لا توجد مدخلات في السجل</div>
        ) : entries.map(e => {
          const meta = ACTION_LABELS[e.action] || { label: e.action, color: "text-muted-foreground bg-muted/10 border-border" };
          return (
            <div key={e.id} className="flex items-start gap-3 px-5 py-3 border-b border-border/50 hover:bg-background/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${meta.color}`}>{meta.label}</span>
                  <span className="text-xs font-mono text-muted-foreground">{new Date(e.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                <div className="text-xs mt-1 space-y-0.5">
                  {e.actorEmail && <p className="text-foreground font-mono">{e.actorEmail}</p>}
                  {e.target && <p className="text-muted-foreground font-mono">→ target: {e.target}</p>}
                  {e.ip && <p className="text-muted-foreground font-mono" dir="ltr">IP: {e.ip}</p>}
                  {e.meta && Object.keys(e.meta).length > 0 && (
                    <p className="text-muted-foreground/70 font-mono text-[10px]" dir="ltr">
                      {JSON.stringify(e.meta)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Security Events ----------
function EventsTab({ events, filter, setFilter }: {
  events: SecurityEvent[];
  filter: string;
  setFilter: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {[
          { v: "", l: "الكل" },
          { v: "info", l: "معلومة" },
          { v: "warn", l: "تحذير" },
          { v: "critical", l: "حرج" },
        ].map(f => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-3 py-1.5 text-xs font-mono rounded-md ${
              filter === f.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>{f.l}</button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {events.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">لا توجد أحداث أمنية</div>
        ) : events.map(e => {
          const colors = {
            info: "text-blue-400 bg-blue-400/10 border-blue-400/30",
            warn: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
            critical: "text-red-400 bg-red-400/10 border-red-400/30",
          };
          const icons = { info: Eye, warn: ShieldAlert, critical: ShieldX };
          const Icon = icons[e.severity];
          return (
            <div key={e.id} className="flex items-start gap-3 px-5 py-3 border-b border-border/50 hover:bg-background/30">
              <Icon size={14} className={`flex-shrink-0 mt-1 ${colors[e.severity].split(" ")[0]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-foreground">{e.type}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[e.severity]}`}>{e.severity}</span>
                  {e.blocked && <span className="text-[10px] text-green-400 font-mono">[blocked]</span>}
                  <span className="text-[10px] text-muted-foreground font-mono">{new Date(e.createdAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                {e.detail && <p className="text-xs text-muted-foreground mt-1 font-mono" dir="ltr">{e.detail}</p>}
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground font-mono" dir="ltr">
                  {e.ip && <span>IP: {e.ip}</span>}
                  {e.path && <span>Path: {e.path}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
