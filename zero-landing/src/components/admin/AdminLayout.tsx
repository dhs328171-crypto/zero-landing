import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, Users, MessageSquare, Settings,
  LogOut, ExternalLink, Bell, ChevronRight, Terminal, BarChart3,
  Columns, Layers, Activity, User, BookOpen, Star, HelpCircle,
  Cpu, Image, Globe, Home, ShieldCheck, Link2, KeyRound, Code2
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useT, useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const navGroups = [
  {
    label: "admin.dashboard",
    items: [
      { icon: LayoutDashboard, label: "admin.dashboard", path: "/admin" },
      { icon: BarChart3, label: "admin.analytics", path: "/admin/analytics" },
      { icon: Activity, label: "admin.activity", path: "/admin/activity" },
    ],
  },
  {
    label: "admin.content",
    items: [
      { icon: Briefcase, label: "admin.projects", path: "/admin/projects" },
      { icon: BookOpen, label: "admin.blog", path: "/admin/blog" },
      { icon: Layers, label: "admin.services", path: "/admin/services-manager" },
      { icon: Star, label: "admin.testimonials", path: "/admin/testimonials" },
      { icon: HelpCircle, label: "admin.faq", path: "/admin/faq" },
    ],
  },
  {
    label: "admin.management",
    items: [
      { icon: Columns, label: "admin.kanban", path: "/admin/kanban" },
      { icon: Users, label: "admin.clients", path: "/admin/clients" },
      { icon: KeyRound, label: "admin.users", path: "/admin/users" },
      { icon: MessageSquare, label: "admin.messages", path: "/admin/messages" },
      { icon: Link2, label: "admin.linkMask", path: "/admin/link-mask" },
    ],
  },
  {
    label: "admin.security_section",
    items: [
      { icon: ShieldCheck, label: "admin.security", path: "/admin/security" },
      { icon: Code2, label: "admin.codeEditor", path: "/admin/code-editor" },
    ],
  },
  {
    label: "admin.settings_section",
    items: [
      { icon: Cpu, label: "admin.skills", path: "/admin/skills" },
      { icon: Image, label: "admin.media", path: "/admin/media" },
      { icon: Globe, label: "admin.seo", path: "/admin/seo" },
      { icon: User, label: "admin.profile", path: "/admin/profile" },
      { icon: Settings, label: "admin.settings", path: "/admin/settings" },
    ],
  },
];

const navItems = navGroups.flatMap((g) => g.items);

export function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location, navigate] = useLocation();
  const { logout, user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const t = useT();
  const { dir } = useI18n();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const notifications = [
    { text: "رسالة جديدة من سارة", time: "منذ 5 دقائق", dot: "bg-primary" },
    { text: "موعد تسليم قريب", time: "منذ ساعة", dot: "bg-yellow-400" },
    { text: "تقييم 5 نجوم جديد", time: "منذ ساعتين", dot: "bg-green-400" },
  ];

  return (
    <div className="min-h-screen bg-background flex" dir={dir}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full bg-card border-l border-border z-40 flex flex-col overflow-hidden"
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-3 h-16 border-b border-border flex-shrink-0">
          <img src="/zero-logo.png" alt="ZERO" className="h-8 w-8 flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,217,255,0.5)] rounded" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col leading-tight overflow-hidden"
              >
                <span className="font-mono font-bold text-primary text-sm">ZERO</span>
                <span className="font-mono text-xs text-muted-foreground">Admin v3.0</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 -left-3 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors z-50"
        >
          <ChevronRight size={12} className={`transition-transform duration-300 ${sidebarOpen ? "rotate-0" : "rotate-180"}`} />
        </button>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest px-2.5 pt-2 pb-1"
                  >
                    {t(group.label)}
                  </motion.p>
                )}
              </AnimatePresence>
              {group.items.map((item) => {
                const isActive = item.path === "/admin"
                  ? location === "/admin"
                  : location.startsWith(item.path);
                return (
                  <Link href={item.path} key={item.path}>
                    <div
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <motion.div layoutId="activeNav" className="absolute inset-0 bg-primary/8 rounded-lg" />
                      )}
                      <item.icon size={16} className="flex-shrink-0 relative z-10" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-medium relative z-10 whitespace-nowrap"
                          >
                            {t(item.label)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-background/50 transition-all text-sm">
            <ExternalLink size={17} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t("admin.viewSite")}</motion.span>
              )}
            </AnimatePresence>
          </a>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all text-sm">
            <LogOut size={17} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{t("admin.logout")}</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginRight: sidebarOpen ? 240 : 68 }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-1.5 min-w-0">
            <Terminal size={13} className="text-primary flex-shrink-0" />
            <Link href="/admin">
              <span className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                <Home size={11} />
                {t("admin.dashboard")}
              </span>
            </Link>
            {(() => {
              const activeItem = navItems.find(
                (i) => i.path !== "/admin" && location.startsWith(i.path)
              );
              if (!activeItem) return null;
              const group = navGroups.find((g) => g.items.some((item) => item.path === activeItem.path));
              return (
                <>
                  <ChevronRight size={12} className="text-muted-foreground/40 flex-shrink-0" />
                  {group && (
                    <>
                      <span className="font-mono text-xs text-muted-foreground/50 hidden sm:block">{t(group.label)}</span>
                      <ChevronRight size={12} className="text-muted-foreground/40 flex-shrink-0 hidden sm:block" />
                    </>
                  )}
                  <span className="font-mono text-xs text-primary font-medium truncate">{t(activeItem.label)}</span>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-muted-foreground hover:text-primary transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-background/50"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute left-0 top-12 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <span className="text-sm font-semibold">الإشعارات</span>
                      <span className="text-xs font-mono text-primary">{notifications.length} جديد</span>
                    </div>
                    {notifications.map((n, i) => (
                      <div key={i} className="px-4 py-3 border-b border-border/50 hover:bg-background/50 transition-colors flex items-start gap-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.dot}`} />
                        <div>
                          <p className="text-sm text-foreground">{n.text}</p>
                          <p className="text-xs text-muted-foreground font-mono">{n.time}</p>
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-2 text-center">
                      <button className="text-xs text-primary hover:underline font-mono">عرض كل الإشعارات</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User badge */}
            <Link href="/admin/profile">
              <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5 cursor-pointer hover:border-primary/40 transition-colors">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/40 flex-shrink-0">
                  <img src="/zero-logo.png" alt="avatar" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-mono text-foreground hidden sm:block">{user?.name ?? user?.email}</span>
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
