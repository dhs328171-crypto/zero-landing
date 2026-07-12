import { motion } from "framer-motion";
import { Link } from "wouter";
import { Zap, Code, Smartphone, ShoppingCart, BarChart3, ArrowLeft, Star, Users, Briefcase, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT, useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function LandingGate() {
  const t = useT();
  const { dir } = useI18n();

  const features = [
    { icon: Code, title: t("lg.f1t"), desc: t("lg.f1d") },
    { icon: Smartphone, title: t("lg.f2t"), desc: t("lg.f2d") },
    { icon: ShoppingCart, title: t("lg.f3t"), desc: t("lg.f3d") },
    { icon: BarChart3, title: t("lg.f4t"), desc: t("lg.f4d") },
  ];

  const stats = [
    { value: "52+", label: t("home.statsProjects") },
    { value: "30+", label: t("home.statsClients") },
    { value: "4.9", label: t("lg.avgRating") },
    { value: "5+", label: t("home.statsYears") },
  ];

  const testimonials = [
    { name: t("lg.t1n"), text: t("lg.t1"), rating: 5 },
    { name: t("lg.t2n"), text: t("lg.t2"), rating: 5 },
    { name: t("lg.t3n"), text: t("lg.t3"), rating: 5 },
  ];

  const whyPoints = [
    t("lg.w1"), t("lg.w2"), t("lg.w3"), t("lg.w4"), t("lg.w5"), t("lg.w6"),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      {/* Navbar for guests */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/zero-logo.png" alt="ZERO" className="h-9 w-auto drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]" />
            <span className="font-mono font-bold text-primary">ZERO</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs" asChild>
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono text-xs" asChild>
              <Link href="/register">{t("nav.register")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-10" />
          <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.img
                src="/zero-logo.png"
                alt="ZERO"
                className="h-24 md:h-32 w-auto mx-auto mb-6"
                animate={{ filter: ["drop-shadow(0 0 15px rgba(0,217,255,0.3))", "drop-shadow(0 0 35px rgba(0,217,255,0.7))", "drop-shadow(0 0 15px rgba(0,217,255,0.3))"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <p className="font-mono text-xs text-primary mb-4 tracking-widest">// SOFTWARE ARCHITECT SOLUTIONS</p>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {t("lg.heroL1")} <span className="text-primary glow-cyan-text">{t("lg.heroL1h")}</span>
                <br />{t("lg.heroL2")}
              </h1>

              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                {t("lg.heroSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono text-base px-8"
                  asChild
                >
                  <Link href="/register">
                    <Zap size={18} className="ml-2" />
                    {t("lg.ctaPrimary")}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/10 font-mono text-base px-8"
                  asChild
                >
                  <Link href="/login">
                    <ArrowLeft size={18} className="ml-2" />
                    {t("lg.ctaSecondary")}
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {stats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-card/80 border border-border rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-primary font-mono">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Preview */}
        <section className="py-20 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <p className="font-mono text-xs text-primary mb-2">()SERVICES.PREVIEW //</p>
              <h2 className="text-3xl font-bold">{t("lg.servicesTitle")}</h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-all group"
                >
                  <f.icon size={28} className="text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <p className="font-mono text-xs text-primary mb-2">()TESTIMONIALS.PREVIEW //</p>
              <h2 className="text-3xl font-bold">{t("home.testimonialsTitle")}</h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((tm, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <div className="flex mb-3">
                    {Array.from({ length: tm.rating }).map((_, j) => (
                      <Star key={j} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">"{tm.text}"</p>
                  <p className="text-sm font-semibold text-foreground">{tm.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Register */}
        <section className="py-20 px-4 bg-card/30">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
                <p className="font-mono text-xs text-primary mb-2">()WHY.REGISTER //</p>
                <h2 className="text-3xl font-bold mb-4">{t("lg.whyTitle")}</h2>
                <div className="space-y-3">
                  {whyPoints.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle size={15} className="text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{p}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}>
                <div className="bg-card border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute inset-0 cyber-grid opacity-5" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 text-center">{t("lg.registerNow")}</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono" asChild>
                        <Link href="/register">
                          <Zap size={15} className="ml-2" />
                          {t("lg.createAccount")}
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full border-border hover:border-primary/50 text-muted-foreground font-mono" asChild>
                        <Link href="/login">{t("nav.login")}</Link>
                      </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users size={11} />{t("lg.free")}</span>
                      <span className="flex items-center gap-1"><Briefcase size={11} />{t("lg.noCard")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-card border border-green-500/20 rounded-2xl p-8">
              <MessageCircle size={32} className="text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">{t("lg.contactDirect")}</h3>
              <p className="text-muted-foreground text-sm mb-5">{t("lg.contactDesc")}</p>
              <Button className="bg-green-500 hover:bg-green-600 text-white" asChild>
                <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={15} className="ml-2" />
                  {t("lg.whatsappCta")}
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6 px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
            <span>© {new Date().getFullYear()} ZERO — Software Architect Solutions</span>
            <div className="flex gap-4">
              <Link href="/terms"><span className="hover:text-primary transition-colors cursor-pointer">{t("lg.terms")}</span></Link>
              <Link href="/privacy"><span className="hover:text-primary transition-colors cursor-pointer">{t("lg.privacy")}</span></Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
