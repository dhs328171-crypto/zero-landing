import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TrendingUp, Users, Eye, Clock, Globe, Smartphone, Monitor, ArrowUpRight, ArrowDownRight } from "lucide-react";

const monthlyData = [
  { month: "يناير", visits: 420, projects: 4, revenue: 8500 },
  { month: "فبراير", visits: 380, projects: 3, revenue: 6200 },
  { month: "مارس", visits: 610, projects: 6, revenue: 12800 },
  { month: "أبريل", visits: 890, projects: 8, revenue: 18500 },
  { month: "مايو", visits: 750, projects: 7, revenue: 15200 },
  { month: "يونيو", visits: 960, projects: 9, revenue: 21000 },
  { month: "يوليو", visits: 830, projects: 7, revenue: 17800 },
  { month: "أغسطس", visits: 1100, projects: 11, revenue: 24500 },
  { month: "سبتمبر", visits: 980, projects: 9, revenue: 20100 },
  { month: "أكتوبر", visits: 870, projects: 8, revenue: 18200 },
  { month: "نوفمبر", visits: 1050, projects: 10, revenue: 22800 },
  { month: "ديسمبر", visits: 1280, projects: 13, revenue: 29500 },
];

const maxVisits = Math.max(...monthlyData.map((d) => d.visits));
const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

const kpis = [
  { label: "إجمالي الزيارات", value: "9,120", change: "+24%", up: true, icon: Eye, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { label: "زوار جدد", value: "6,840", change: "+18%", up: true, icon: Users, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { label: "متوسط وقت الزيارة", value: "3:42", change: "+12%", up: true, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  { label: "معدل الارتداد", value: "28%", change: "-5%", up: false, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
];

const topPages = [
  { page: "الصفحة الرئيسية", visits: 4200, pct: 46 },
  { page: "أعمالي", visits: 2100, pct: 23 },
  { page: "الأسعار", visits: 1450, pct: 16 },
  { page: "من أنا", visits: 820, pct: 9 },
  { page: "الدعم", visits: 550, pct: 6 },
];

const devices = [
  { name: "موبايل", pct: 58, icon: <Smartphone size={16} className="text-primary" /> },
  { name: "سطح المكتب", pct: 35, icon: <Monitor size={16} className="text-green-400" /> },
  { name: "تابلت", pct: 7, icon: <Globe size={16} className="text-yellow-400" /> },
];

const sources = [
  { name: "واتساب", visits: 3840, color: "bg-green-400" },
  { name: "بحث مباشر", visits: 2560, color: "bg-primary" },
  { name: "إنستغرام", visits: 1620, color: "bg-purple-400" },
  { name: "تويتر", visits: 840, color: "bg-blue-400" },
  { name: "غيرها", visits: 260, color: "bg-muted-foreground/30" },
];
const maxSource = Math.max(...sources.map((s) => s.visits));

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">التحليلات والإحصائيات</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">// analytics.overview() — 2026</p>
        </div>

        {/* KPIs */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {kpis.map((k) => (
            <motion.div
              key={k.label}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className={`bg-card border rounded-xl p-5 ${k.border}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${k.bg} flex items-center justify-center`}>
                  <k.icon size={18} className={k.color} />
                </div>
                <span className={`flex items-center gap-1 text-xs font-mono ${k.up ? "text-green-400" : "text-red-400"}`}>
                  {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {k.change}
                </span>
              </div>
              <div className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visits Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">الزيارات الشهرية</h2>
              <span className="font-mono text-xs text-muted-foreground">2026</span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <motion.div
                      className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer relative"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                      style={{ height: `${(d.visits / maxVisits) * 140}px`, originY: 1 } as React.CSSProperties}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-1.5 py-0.5 text-xs font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {d.visits.toLocaleString()}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[9px] text-muted-foreground hidden lg:block">{d.month.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h2 className="font-semibold mb-5">الأجهزة</h2>
            <div className="space-y-5">
              {devices.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      {d.icon}
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-mono text-primary">{d.pct}%</span>
                  </div>
                  <div className="h-2 bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border">
              <h3 className="text-sm font-medium mb-4">المصادر</h3>
              <div className="space-y-3">
                {sources.map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-mono text-foreground">{s.visits.toLocaleString()}</span>
                      </div>
                      <div className="h-1 bg-background rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.visits / maxSource) * 100}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${s.color}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h2 className="font-semibold mb-5">أكثر الصفحات زيارةً</h2>
            <div className="space-y-4">
              {topPages.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary/50">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-foreground">{p.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{p.visits.toLocaleString()}</span>
                      <span className="text-xs text-primary">{p.pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-background rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Revenue chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <h2 className="font-semibold mb-5">الإيرادات الشهرية (ر.س)</h2>
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <motion.div
                    className="w-full bg-green-400/20 hover:bg-green-400/40 rounded-t transition-colors cursor-pointer relative"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                    style={{ height: `${(d.revenue / maxRevenue) * 140}px`, originY: 1 } as React.CSSProperties}
                  >
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-1.5 py-0.5 text-xs font-mono text-green-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.revenue.toLocaleString()} ر.س
                    </div>
                  </motion.div>
                  <span className="text-[9px] text-muted-foreground hidden lg:block">{d.month.slice(0, 3)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
              <div>
                <p className="text-xs text-muted-foreground">إجمالي 2026</p>
                <p className="font-bold font-mono text-green-400">215,100 ر.س</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">أعلى شهر</p>
                <p className="font-bold font-mono text-green-400">ديسمبر (29,500)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
