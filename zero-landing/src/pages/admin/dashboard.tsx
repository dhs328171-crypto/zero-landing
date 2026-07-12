import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Briefcase, Users, MessageSquare, TrendingUp, Star,
  Clock, CheckCircle, AlertCircle, ArrowUpRight, Code2, Calendar,
  RefreshCw, Mail, Eye
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiGet } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";

interface DashboardStats {
  projects: number;
  posts: number;
  testimonials: number;
  messages: number;
  users: number;
  media: number;
}

interface RecentProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  tech: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface RecentMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  starred: boolean;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  "مكتمل": { label: "مكتمل", className: "bg-green-400/10 text-green-400 border border-green-400/20" },
  "جارٍ": { label: "جارٍ التطوير", className: "bg-primary/10 text-primary border border-primary/20" },
  "مراجعة": { label: "قيد المراجعة", className: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, projectsRes, messagesRes] = await Promise.allSettled([
        apiGet<DashboardStats>("/stats"),
        apiGet<{ items: RecentProject[] }>("/projects?limit=5"),
        apiGet<{ items: RecentMessage[] }>("/messages?limit=5"),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (projectsRes.status === "fulfilled") setRecentProjects(projectsRes.value.items || []);
      if (messagesRes.status === "fulfilled") setRecentMessages(messagesRes.value.items || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";
  const dateStr = now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const statCards = [
    { label: "إجمالي المشاريع", value: stats?.projects ?? "—", icon: Briefcase, change: "من قاعدة البيانات", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "المستخدمون", value: stats?.users ?? "—", icon: Users, change: "مسجّلون", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    { label: "الرسائل", value: stats?.messages ?? "—", icon: MessageSquare, change: recentMessages.filter(m => !m.read).length > 0 ? `${recentMessages.filter(m => !m.read).length} غير مقروءة` : "كلها مقروءة", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { label: "التقييمات", value: stats?.testimonials ?? "—", icon: Star, change: "تقييم", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{greeting}، {user?.name ?? "ZERO"} 👋</h1>
            <p className="text-muted-foreground text-sm font-mono">// لوحة التحكم الرئيسية — {loading ? "جاري التحميل..." : "محدّثة"}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadDashboard} className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-primary transition-colors">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-sm text-muted-foreground font-mono">
              <Calendar size={13} className="text-primary" />
              <span className="text-xs">{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        >
          {statCards.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className={`bg-card border rounded-xl p-5 ${s.border} hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon size={20} className={s.color} />
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground/40" />
              </div>
              <div className={`text-3xl font-bold font-mono mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-sm font-medium text-foreground">{s.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.change}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">أحدث المشاريع</h2>
              </div>
              <Link href="/admin/projects" className="text-xs text-primary hover:underline font-mono">
                عرض الكل ←
              </Link>
            </div>
            {recentProjects.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">لا توجد مشاريع بعد</div>
            ) : (
              <div className="divide-y divide-border">
                {recentProjects.map((p, i) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-background/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-mono text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.category} · <span className="font-mono">{p.tech}</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${p.featured ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground border border-muted"}`}>
                        {p.featured ? "مميّز" : "عادي"}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(p.createdAt).toLocaleDateString("ar-EG")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">آخر الرسائل</h2>
              </div>
              <Link href="/admin/messages" className="text-xs text-primary hover:underline font-mono">
                عرض الكل
              </Link>
            </div>
            {recentMessages.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground text-sm">لا توجد رسائل</div>
            ) : (
              <div className="divide-y divide-border">
                {recentMessages.map((m) => (
                  <div key={m.id} className="px-5 py-3 hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      {!m.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      <span className={`text-sm font-medium truncate ${m.read ? "text-muted-foreground" : "text-foreground"}`}>{m.name}</span>
                      <span className="text-[9px] text-muted-foreground font-mono flex-shrink-0">{new Date(m.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="px-5 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono mb-3">// performance.metrics()</p>
              {[
                { label: "المشاريع", value: stats?.projects ?? 0, max: 100 },
                { label: "المقالات", value: stats?.posts ?? 0, max: 50 },
                { label: "الوسائط", value: stats?.media ?? 0, max: 200 },
              ].map((m) => {
                const pct = m.max > 0 ? Math.min(100, (m.value / m.max) * 100) : 0;
                return (
                  <div key={m.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="text-primary font-mono">{m.value}</span>
                    </div>
                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="font-semibold">نشاط المشاريع — 2026</h2>
          </div>
          <div className="flex items-end gap-3 h-32">
            {[
              { month: "يناير", v: 60 }, { month: "فبراير", v: 45 },
              { month: "مارس", v: 75 }, { month: "أبريل", v: 90 },
              { month: "مايو", v: 55 }, { month: "يونيو", v: 85 },
              { month: "يوليو", v: 70 }, { month: "أغسطس", v: 95 },
              { month: "سبتمبر", v: 80 }, { month: "أكتوبر", v: 65 },
              { month: "نوفمبر", v: 88 }, { month: "ديسمبر", v: 100 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer relative group"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  style={{ height: `${d.v}%`, originY: 1 } as React.CSSProperties}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-1.5 py-0.5 text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.v}%
                  </div>
                </motion.div>
                <span className="text-[9px] text-muted-foreground hidden lg:block">{d.month.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
