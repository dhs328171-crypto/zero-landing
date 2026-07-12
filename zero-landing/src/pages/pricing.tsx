import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Star, Crown, HelpCircle, DollarSign } from "lucide-react";
import { useT, useI18n } from "@/contexts/i18n-context";
import { useCurrency, CURRENCIES, CURRENCY_ORDER, type CurrencyCode } from "@/contexts/currency-context";

type BillingType = "project" | "monthly";

// All prices stored in USD (the primary currency).
interface Plan {
  id: "basic" | "pro" | "premium";
  nameKey: string;
  icon: React.ReactNode;
  priceProjectUSD: number;
  priceMonthlyUSD: number;
  color: string;
  badgeKey: string | null;
  descKey: string;
  features: { textKey: string; included: boolean }[];
  ctaKey: string;
  ctaStyle: string;
}

const plans: Plan[] = [
  {
    id: "basic",
    nameKey: "pricing.basic",
    icon: <Zap size={20} />,
    priceProjectUSD: 400,
    priceMonthlyUSD: 220,
    color: "border-border",
    badgeKey: null,
    descKey: "pricing.basicDesc",
    features: [
      { textKey: "pf.landing5", included: true },
      { textKey: "pf.responsive", included: true },
      { textKey: "pf.contactForm", included: true },
      { textKey: "pf.seoBasic", included: true },
      { textKey: "pf.domainSetup", included: true },
      { textKey: "pf.support14", included: true },
      { textKey: "pf.dashboard", included: false },
      { textKey: "pf.ecommerce", included: false },
      { textKey: "pf.customApi", included: false },
      { textKey: "pf.analytics", included: false },
    ],
    ctaKey: "pricing.ctaStart",
    ctaStyle: "border border-border text-foreground hover:border-primary/50 hover:text-primary",
  },
  {
    id: "pro",
    nameKey: "pricing.pro",
    icon: <Star size={20} />,
    priceProjectUSD: 950,
    priceMonthlyUSD: 480,
    color: "border-primary",
    badgeKey: "pricing.badgePopular",
    descKey: "pricing.proDesc",
    features: [
      { textKey: "pf.fullSite10", included: true },
      { textKey: "pf.uiux", included: true },
      { textKey: "pf.dashboardFull", included: true },
      { textKey: "pf.ecommerce", included: true },
      { textKey: "pf.payment", included: true },
      { textKey: "pf.seoAdvanced", included: true },
      { textKey: "pf.support30", included: true },
      { textKey: "pf.customApi", included: true },
      { textKey: "pf.users", included: false },
      { textKey: "pf.mobile", included: false },
    ],
    ctaKey: "pricing.ctaStart",
    ctaStyle: "bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan",
  },
  {
    id: "premium",
    nameKey: "pricing.premium",
    icon: <Crown size={20} />,
    priceProjectUSD: 1900,
    priceMonthlyUSD: 950,
    color: "border-yellow-500/50",
    badgeKey: "pricing.badgeFull",
    descKey: "pricing.premiumDesc",
    features: [
      { textKey: "pf.customPlatform", included: true },
      { textKey: "pf.designSystem", included: true },
      { textKey: "pf.dashboardAdvanced", included: true },
      { textKey: "pf.usersPerms", included: true },
      { textKey: "pf.apiDocumented", included: true },
      { textKey: "pf.mobile", included: true },
      { textKey: "pf.realtimeReports", included: true },
      { textKey: "pf.support60", included: true },
      { textKey: "pf.hostingSecurity", included: true },
      { textKey: "pf.prioritySupport", included: true },
    ],
    ctaKey: "pricing.ctaContact",
    ctaStyle: "border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10",
  },
];

const faqs = [
  { qKey: "pf.faq1q", aKey: "pf.faq1a" },
  { qKey: "pf.faq2q", aKey: "pf.faq2a" },
  { qKey: "pf.faq3q", aKey: "pf.faq3a" },
  { qKey: "pf.faq4q", aKey: "pf.faq4a" },
  { qKey: "pf.faq5q", aKey: "pf.faq5a" },
];

export default function Pricing() {
  const [billing, setBilling] = useState<BillingType>("project");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = useT();
  const { lang } = useI18n();
  const { currency, setCurrency, format, formatIn, info } = useCurrency();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// pricing.plans()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("pricing.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary glow-cyan-text">
                {t("pricing.title").split(" ").slice(-1)}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">{t("pricing.subtitle")}</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full p-1 mb-4">
              <button
                onClick={() => setBilling("project")}
                className={`px-5 py-2 rounded-full text-sm font-mono transition-all ${billing === "project" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {t("pricing.perProject")}
              </button>
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-mono transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {t("pricing.perMonth")}
              </button>
            </div>

            {/* Currency switcher (inline) */}
            <div className="inline-flex items-center gap-2 ml-2 bg-card border border-border rounded-full p-1">
              <DollarSign size={14} className="text-primary ml-2" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-mono text-foreground focus:outline-none cursor-pointer pr-2"
              >
                {CURRENCY_ORDER.map((code) => (
                  <option key={code} value={code} className="bg-card">
                    {code} — {CURRENCIES[code].symbol}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const usd = billing === "project" ? plan.priceProjectUSD : plan.priceMonthlyUSD;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-card border-2 rounded-2xl p-7 flex flex-col ${plan.color} ${plan.id === "pro" ? "shadow-xl shadow-primary/10" : ""}`}
                >
                  {plan.badgeKey && (
                    <div className={`absolute -top-3 right-6 text-xs font-mono px-3 py-1 rounded-full ${plan.id === "pro" ? "bg-primary text-primary-foreground" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                      {t(plan.badgeKey)}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${plan.id === "pro" ? "bg-primary/20 text-primary" : plan.id === "premium" ? "bg-yellow-500/10 text-yellow-400" : "bg-border/50 text-muted-foreground"}`}>
                      {plan.icon}
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{t(plan.nameKey)}</h2>
                    <p className="text-sm text-muted-foreground">{t(plan.descKey)}</p>
                  </div>

                  <div className="mb-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${billing}-${currency}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="flex items-baseline gap-1 flex-wrap"
                      >
                        <span className="text-4xl font-bold font-mono text-foreground">
                          {format(usd)}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          / {billing === "project" ? t("pricing.perProject") : t("pricing.perMonth")}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                    {/* USD reference for non-USD currencies */}
                    {currency !== "USD" && (
                      <p className="text-xs text-muted-foreground/60 font-mono mt-1">
                        ≈ {formatIn(usd, "USD")} USD
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2.5 text-sm">
                        {f.included ? (
                          <Check size={14} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <X size={14} className="text-muted-foreground/30 flex-shrink-0" />
                        )}
                        <span className={f.included ? "text-foreground" : "text-muted-foreground/40 line-through"}>
                          {t(f.textKey)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-mono text-sm text-center transition-all ${plan.ctaStyle}`}
                  >
                    {t(plan.ctaKey)}
                  </a>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground font-mono mt-8">
            * {t("pricing.note")}
          </p>
        </div>
      </section>

      {/* Custom quote */}
      <section className="py-16 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">{t("pricing.customQuote")}</h2>
          <p className="text-muted-foreground mb-6 text-sm">{t("pricing.customQuoteDesc")}</p>
          <a href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all">
            {t("pricing.getCustomQuote")} ←
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-3 block">// faq.answers()</span>
            <h2 className="text-3xl font-bold">
              {t("pricing.faqTitle").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary glow-cyan-text">
                {t("pricing.faqTitle").split(" ").slice(-1)}
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-background/30 transition-colors"
                >
                  <span className="font-medium text-sm">{t(faq.qKey)}</span>
                  <HelpCircle size={16} className={`flex-shrink-0 transition-colors ${openFaq === i ? "text-primary" : "text-muted-foreground"}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                        {t(faq.aKey)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
