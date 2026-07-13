import { motion } from "framer-motion";
import { Handshake, Globe, Award, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useI18n, useT } from "@/contexts/i18n-context";

const partners = [
  { name: "AWS", desc: "Amazon Web Services — استضافة وبنية تحتية سحابية", category: "سحابي", tier: "platinum", color: "from-orange-500/20 to-yellow-500/20", border: "border-orange-500/30" },
  { name: "Vercel", desc: "منصة نشر Next.js وتطبيقات الويب", category: "نشر", tier: "gold", color: "from-gray-500/20 to-slate-500/20", border: "border-gray-500/30" },
  { name: "Supabase", desc: "قاعدة بيانات PostgreSQL مدارة مع Auth و Storage", category: "قاعدة بيانات", tier: "gold", color: "from-green-500/20 to-emerald-500/20", border: "border-green-500/30" },
  { name: "Stripe", desc: "معالجة المدفوعات الإلكترونية الآمنة", category: "مدفوعات", tier: "silver", color: "from-violet-500/20 to-purple-500/20", border: "border-violet-500/30" },
  { name: "Cloudflare", desc: "CDN وحماية وأداء عالمي", category: "شبكة", tier: "silver", color: "from-orange-400/20 to-red-400/20", border: "border-orange-400/30" },
  { name: "Firebase", desc: "منصة Google للتطبيقات في الوقت الفعلي", category: "سحابي", tier: "silver", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30" },
  { name: "Docker", desc: "حاويات التطبيقات والنشر المتسق", category: "DevOps", tier: "bronze", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
  { name: "GitHub", desc: "إدارة الكود والتعاون في التطوير", category: "تطوير", tier: "bronze", color: "from-gray-600/20 to-gray-400/20", border: "border-gray-500/30" },
  { name: "Figma", desc: "تصميم واجهات المستخدم التفاعلية", category: "تصميم", tier: "bronze", color: "from-pink-500/20 to-purple-500/20", border: "border-pink-500/30" },
];

const tiers = [
  { name: "Platinum", icon: "💎", color: "text-cyan-300", count: 1 },
  { name: "Gold", icon: "🥇", color: "text-yellow-400", count: 2 },
  { name: "Silver", icon: "🥈", color: "text-gray-300", count: 3 },
  { name: "Bronze", icon: "🥉", color: "text-orange-400", count: 3 },
];

export default function Partners() {
  const { dir } = useI18n();
  const t = useT();

  const benefits = [
    { icon: Globe, title: t("partners.b1Title"), desc: t("partners.b1Desc") },
    { icon: Award, title: t("partners.b2Title"), desc: t("partners.b2Desc") },
    { icon: TrendingUp, title: t("partners.b3Title"), desc: t("partners.b3Desc") },
    { icon: Handshake, title: t("partners.b4Title"), desc: t("partners.b4Desc") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="container mx-auto max-w-4xl relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-xs text-primary mb-3">()PARTNERS.ECOSYSTEM //</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("partners.title").split(" ").slice(0, -1).join(" ")} <span className="text-primary">{t("partners.title").split(" ").slice(-1)}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t("partners.subtitle")}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-all"
                >
                  <b.icon size={24} className="text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="py-6 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-xl font-bold mb-6 font-mono text-center">
              <span className="text-primary">// </span>{t("partners.tiersTitle")}
            </h2>
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {tiers.map((tier) => (
                <div key={tier.name} className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 text-sm">
                  <span>{tier.icon}</span>
                  <span className={`font-mono font-medium ${tier.color}`}>{tier.name}</span>
                  <span className="text-xs text-muted-foreground">({tier.count})</span>
                </div>
              ))}
            </div>

            {/* Partners Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-gradient-to-br ${p.color} border ${p.border} rounded-xl p-5 hover:scale-[1.02] transition-all group relative overflow-hidden`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground font-mono">{p.name}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground bg-background/50 border border-border px-2 py-0.5 rounded-full capitalize">{p.tier}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
                  <span className="text-[10px] font-mono text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">{p.category}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 cyber-grid opacity-5" />
              <div className="relative z-10">
                <Handshake size={36} className="text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3">{t("partners.ctaTitle")}</h3>
                <p className="text-muted-foreground mb-6">{t("partners.ctaDesc")}</p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan" asChild>
                  <a href="/contact">{t("partners.ctaButton")}</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}