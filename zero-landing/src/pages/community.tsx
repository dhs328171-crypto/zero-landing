import { motion } from "framer-motion";
import { Users, MessageCircle, Zap, TrendingUp, Award, Star, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useI18n, useT } from "@/contexts/i18n-context";

const stats = [
  { labelKey: "community.membersCount", value: "2,400+", icon: Users },
  { labelKey: "community.topicsCount", value: "500+", icon: MessageCircle },
  { labelKey: "community.repliesCount", value: "52+", icon: Zap },
  { labelKey: "community.onlineCount", value: "98%", icon: TrendingUp },
];

const channels = [
  { name: "القناة الرسمية", desc: "أخبار وتحديثات ZERO الحصرية • نصائح تقنية يومية", members: "1,200+", href: "https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y", color: "border-primary/30 bg-primary/5", icon: "📢" },
  { name: "جروب المطورين", desc: "مجتمع تفاعلي • تبادل الخبرات • فرص عمل • نقاشات تقنية", members: "580+", href: "https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9", color: "border-green-400/30 bg-green-400/5", icon: "💬" },
];

const topics = [
  { title: "Frontend 2025: ما الأفضل؟", replies: 34, views: 1240, hot: true },
  { title: "كيف تتقن TypeScript في شهر واحد", replies: 28, views: 980, hot: true },
  { title: "تجربتي مع Next.js 15 App Router", replies: 19, views: 750, hot: false },
  { title: "نصائح للحصول على أول عميل", replies: 45, views: 2100, hot: true },
  { title: "مقارنة بين Supabase و Firebase", replies: 22, views: 830, hot: false },
  { title: "ما هي أدواتك المفضلة للإنتاجية؟", replies: 61, views: 1890, hot: false },
];

const members = [
  { name: "أحمد المطور", role: "Full Stack Dev", badge: "⭐ Top Contributor", color: "from-blue-500/20 to-cyan-500/20" },
  { name: "سارة UX", role: "UI/UX Designer", badge: "🎨 Design Lead", color: "from-pink-500/20 to-rose-500/20" },
  { name: "خالد DevOps", role: "DevOps Engineer", badge: "🚀 Helper", color: "from-green-500/20 to-emerald-500/20" },
  { name: "نورة Backend", role: "Backend Dev", badge: "💡 Mentor", color: "from-purple-500/20 to-violet-500/20" },
];

export default function Community() {
  const { dir } = useI18n();
  const t = useT();
  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-primary mb-3">()COMMUNITY.NETWORK //</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("community.title")} <span className="text-primary">ZERO</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                {t("community.subtitle")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <s.icon size={18} className="text-primary mx-auto mb-2" />
                    <div className="text-xl font-bold text-primary font-mono">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t(s.labelKey as any)}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Channels */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-xl font-bold mb-6 font-mono"><span className="text-primary">// </span>{t("community.joinNow")}</h2>
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              {channels.map((c, i) => (
                <motion.a
                  key={i}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`block bg-card border ${c.color} rounded-xl p-6 hover:scale-[1.02] transition-all group`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{c.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-foreground">{c.name}</h3>
                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{c.desc}</p>
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-primary" />
                        <span className="text-xs font-mono text-muted-foreground">{c.members} {t("community.member")}</span>
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Active topics */}
            <h2 className="text-xl font-bold mb-4 font-mono"><span className="text-primary">// </span>{t("community.topicsTitle")}</h2>
            <div className="space-y-2 mb-10">
              {topics.map((topic, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {topic.hot && <span className="text-xs bg-red-400/10 text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded font-mono">🔥 {t("community.trending")}</span>}
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">{topic.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span>{topic.replies} {t("community.replies")}</span>
                    <span>{topic.views.toLocaleString()} {t("community.views")}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Top members */}
            <h2 className="text-xl font-bold mb-4 font-mono"><span className="text-primary">// </span>{t("community.membersTitle")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {members.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-gradient-to-br ${m.color} border border-border rounded-xl p-4 text-center`}
                >
                  <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award size={16} className="text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{m.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{m.role}</p>
                  <span className="text-[10px] font-mono text-muted-foreground">{m.badge}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-card border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 cyber-grid opacity-5" />
              <div className="relative z-10">
                <Star size={32} className="text-primary mx-auto mb-3" />
                <h3 className="text-2xl font-bold mb-2">{t("community.ctaTitle")}</h3>
                <p className="text-muted-foreground text-sm mb-5">{t("community.ctaDesc")}</p>
                <div className="flex gap-3 justify-center">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan" asChild>
                    <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank">{t("community.joinGroup")}</a>
                  </Button>
                  <Button variant="outline" className="border-primary/50 text-primary" asChild>
                    <a href="https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y" target="_blank">{t("community.joinChannel")}</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}