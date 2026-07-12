import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Calculator, Code, ShoppingCart, Smartphone, BarChart3, Palette,
  Database, CheckCircle, AlertCircle, MessageCircle, Zap, Clock,
  Shield, Info, DollarSign,
} from "lucide-react";
import { useT, useI18n } from "@/contexts/i18n-context";
import { useCurrency, CURRENCIES, CURRENCY_ORDER, type CurrencyCode } from "@/contexts/currency-context";

interface ProjectType {
  id: string;
  icon: React.ReactNode;
  labelKey: string;
  basePriceUSD: number;
  baseTime: number;
  color: string;
}

const projectTypes: ProjectType[] = [
  { id: "landing",    icon: <Palette size={22} />,        labelKey: "calculator.types.landing",    basePriceUSD: 400,  baseTime: 7,  color: "border-purple-400/40 bg-purple-400/5" },
  { id: "webapp",     icon: <Code size={22} />,           labelKey: "calculator.types.webapp",     basePriceUSD: 900,  baseTime: 21, color: "border-primary/40 bg-primary/5" },
  { id: "ecommerce",  icon: <ShoppingCart size={22} />,   labelKey: "calculator.types.ecommerce",  basePriceUSD: 1200, baseTime: 25, color: "border-green-400/40 bg-green-400/5" },
  { id: "mobile",     icon: <Smartphone size={22} />,     labelKey: "calculator.types.mobile",     basePriceUSD: 1600, baseTime: 35, color: "border-blue-400/40 bg-blue-400/5" },
  { id: "dashboard",  icon: <BarChart3 size={22} />,      labelKey: "calculator.types.dashboard",  basePriceUSD: 800,  baseTime: 18, color: "border-yellow-400/40 bg-yellow-400/5" },
  { id: "saas",       icon: <Database size={22} />,       labelKey: "calculator.types.saas",       basePriceUSD: 2200, baseTime: 45, color: "border-orange-400/40 bg-orange-400/5" },
];

interface Feature {
  id: string;
  labelKey: string;
  priceUSD: number;
  time: number;
  popular?: boolean;
}

const featuresList: Feature[] = [
  { id: "auth",          labelKey: "calculator.features.auth",          priceUSD: 150, time: 3 },
  { id: "payment",       labelKey: "calculator.features.payment",       priceUSD: 220, time: 4, popular: true },
  { id: "admin",         labelKey: "calculator.features.admin",         priceUSD: 320, time: 6, popular: true },
  { id: "multilang",     labelKey: "calculator.features.multilang",     priceUSD: 160, time: 3 },
  { id: "notifications", labelKey: "calculator.features.notifications", priceUSD: 110, time: 2 },
  { id: "analytics",     labelKey: "calculator.features.analytics",     priceUSD: 220, time: 4 },
  { id: "map",           labelKey: "calculator.features.map",           priceUSD: 130, time: 2 },
  { id: "chat",          labelKey: "calculator.features.chat",          priceUSD: 240, time: 5 },
  { id: "seo",           labelKey: "calculator.features.seo",           priceUSD: 130, time: 2, popular: true },
  { id: "api",           labelKey: "calculator.features.api",           priceUSD: 280, time: 5 },
  { id: "mobile_app",    labelKey: "calculator.features.mobile_app",    priceUSD: 1100, time: 20 },
  { id: "ai",            labelKey: "calculator.features.ai",            priceUSD: 550, time: 8 },
  { id: "hosting",       labelKey: "calculator.features.hosting",       priceUSD: 80,  time: 1 },
  { id: "maintenance",   labelKey: "calculator.features.maintenance",   priceUSD: 330, time: 0 },
];

interface TimelineOption {
  id: string;
  labelKey: string;
  multiplier: number;
  icon: string;
}

const timelines: TimelineOption[] = [
  { id: "urgent",   labelKey: "calculator.timeline.urgent",   multiplier: 1.5, icon: "⚡" },
  { id: "normal",   labelKey: "calculator.timeline.normal",   multiplier: 1,   icon: "✅" },
  { id: "flexible", labelKey: "calculator.timeline.flexible", multiplier: 0.9, icon: "🕐" },
];

export default function ProjectCalculator() {
  const t = useT();
  const { lang } = useI18n();
  const { currency, setCurrency, format, formatIn, info } = useCurrency();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("normal");
  const [showCurrencyPanel, setShowCurrencyPanel] = useState(false);

  const toggleFeature = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const selectedTypeObj = projectTypes.find((p) => p.id === selectedType);
  const selectedTimelineObj = timelines.find((tl) => tl.id === timeline)!;
  const selectedFeaturesObjs = featuresList.filter((f) => selectedFeatures.includes(f.id));

  const basePriceUSD = selectedTypeObj?.basePriceUSD ?? 0;
  const featuresPriceUSD = selectedFeaturesObjs.reduce((s, f) => s + f.priceUSD, 0);
  const rawPriceUSD = (basePriceUSD + featuresPriceUSD) * selectedTimelineObj.multiplier;
  const totalPriceUSD = Math.round(rawPriceUSD / 10) * 10;

  const baseDays = selectedTypeObj?.baseTime ?? 0;
  const featureDays = selectedFeaturesObjs.reduce((s, f) => s + f.time, 0);
  const totalDays = Math.round((baseDays + featureDays) * (timeline === "urgent" ? 0.6 : timeline === "flexible" ? 1.5 : 1));

  const progress = selectedType ? (selectedFeatures.length > 0 ? (timeline !== "normal" ? 100 : 66) : 33) : 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-15" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// project.estimate()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("calculator.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary glow-cyan-text">
                {t("calculator.title").split(" ").slice(-1)}
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">{t("calculator.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 max-w-5xl">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mb-2">
            <span>{t("calculator.progress")}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Project Type */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-mono text-sm text-primary font-bold">1</div>
                <div>
                  <h2 className="font-bold">{t("calculator.step1")}</h2>
                  <p className="text-xs text-muted-foreground">{t("calculator.step1Desc")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {projectTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedType(type.id === selectedType ? null : type.id)}
                    className={`border rounded-xl p-3 text-right transition-all ${
                      selectedType === type.id
                        ? `${type.color} border-primary glow-cyan`
                        : "border-border hover:border-primary/30 bg-background/30"
                    }`}
                  >
                    <div className={`mb-2 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`}>{type.icon}</div>
                    <p className="text-xs font-medium">{t(type.labelKey)}</p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      {t("calculator.from")} {format(type.basePriceUSD)}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Step 2: Features */}
            <AnimatePresence>
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-mono text-sm text-primary font-bold">2</div>
                    <div>
                      <h2 className="font-bold">{t("calculator.step2")}</h2>
                      <p className="text-xs text-muted-foreground">{t("calculator.step2Desc")}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {featuresList.map((feature) => {
                      const isSelected = selectedFeatures.includes(feature.id);
                      return (
                        <button
                          key={feature.id}
                          onClick={() => toggleFeature(feature.id)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-right transition-all text-sm ${
                            isSelected
                              ? "bg-primary/10 border-primary/40 text-primary"
                              : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                              {isSelected && <CheckCircle size={10} className="text-primary-foreground" />}
                            </div>
                            <span className="text-xs">{t(feature.labelKey)}</span>
                            {feature.popular && (
                              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1 py-0.5 rounded font-mono">
                                {t("calculator.popular")}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs opacity-60 flex-shrink-0 mr-1">+{format(feature.priceUSD)}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Timeline */}
            <AnimatePresence>
              {selectedType && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                  className="bg-card border border-border rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-mono text-sm text-primary font-bold">3</div>
                    <div>
                      <h2 className="font-bold">{t("calculator.step3")}</h2>
                      <p className="text-xs text-muted-foreground">{t("calculator.step3Desc")}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {timelines.map((tl) => (
                      <button
                        key={tl.id}
                        onClick={() => setTimeline(tl.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                          timeline === tl.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30 text-muted-foreground"
                        }`}
                      >
                        <span className="text-xl">{tl.icon}</span>
                        <span className="text-sm font-medium">{t(tl.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
              <Info size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{t("calculator.disclaimer")}</p>
            </div>
          </div>

          {/* Estimate Sidebar */}
          <div className="space-y-5">
            <div className="sticky top-24 space-y-4">
              {/* Currency converter */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <button
                  onClick={() => setShowCurrencyPanel((s) => !s)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-primary" />
                    <span className="text-sm font-bold">{t("calculator.currencyConverter")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded">
                      {info.symbol} {currency}
                    </span>
                  </div>
                </button>
                <AnimatePresence>
                  {showCurrencyPanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-[10px] text-muted-foreground font-mono mt-3 mb-2">{t("calculator.showIn")}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CURRENCY_ORDER.map((code) => {
                          const c = CURRENCIES[code];
                          const isActive = currency === code;
                          return (
                            <button
                              key={code}
                              onClick={() => setCurrency(code)}
                              className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs transition-all ${
                                isActive
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              <span className="font-mono">{c.symbol}</span>
                              <span className="font-mono">{c.code}</span>
                            </button>
                          );
                        })}
                      </div>
                      {totalPriceUSD > 0 && (
                        <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                            {t("calculator.estimatedCost")} — {lang === "ar" ? "كل العملات" : "All currencies"}
                          </p>
                          {CURRENCY_ORDER.slice(0, 4).map((code) => (
                            <div key={code} className="flex items-center justify-between text-xs">
                              <span className="font-mono text-muted-foreground">{code}</span>
                              <span className={`font-mono ${code === "USD" ? "text-primary font-bold" : "text-foreground"}`}>
                                {formatIn(totalPriceUSD, code)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Estimate */}
              <div className={`bg-card border rounded-2xl p-6 ${selectedType ? "border-primary/30" : "border-border"}`}>
                <div className="flex items-center gap-2 mb-5">
                  <Calculator size={18} className="text-primary" />
                  <h3 className="font-bold">{t("calculator.estimate")}</h3>
                </div>

                {!selectedType ? (
                  <div className="text-center py-8">
                    <AlertCircle size={32} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">{t("calculator.selectProject")}</p>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Price breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t(selectedTypeObj!.labelKey)}</span>
                        <span className="font-mono">{format(basePriceUSD)}</span>
                      </div>
                      {selectedFeaturesObjs.map((f) => (
                        <div key={f.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">+ {t(f.labelKey)}</span>
                          <span className="font-mono text-green-400">+{format(f.priceUSD)}</span>
                        </div>
                      ))}
                      {timeline === "urgent" && (
                        <div className="flex justify-between text-xs text-orange-400">
                          <span>{t("calculator.urgentFee")} (+50%)</span>
                          <span className="font-mono">+{format(Math.round((basePriceUSD + featuresPriceUSD) * 0.5))}</span>
                        </div>
                      )}
                      {timeline === "flexible" && (
                        <div className="flex justify-between text-xs text-green-400">
                          <span>{t("calculator.flexibleDiscount")} (-10%)</span>
                          <span className="font-mono">-{format(Math.round((basePriceUSD + featuresPriceUSD) * 0.1))}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">{t("calculator.estimatedCost")}</span>
                      </div>
                      <div className="font-mono text-3xl font-bold text-primary glow-cyan-text">
                        {format(totalPriceUSD)}
                      </div>
                      {/* USD reference */}
                      {currency !== "USD" && (
                        <p className="text-xs text-muted-foreground/70 font-mono mt-1">
                          ≈ {formatIn(totalPriceUSD, "USD")} USD
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60 font-mono mt-1">{t("calculator.priceAdjustable")}</p>
                    </div>

                    <div className="bg-background border border-border rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-primary" />
                        <span className="text-xs font-medium">{t("calculator.estimatedDuration")}</span>
                      </div>
                      <p className="font-mono text-2xl font-bold text-foreground">
                        {totalDays} <span className="text-sm text-muted-foreground">{t("calculator.workingDays")}</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      {[
                        { icon: <CheckCircle size={12} className="text-green-400" />, text: t("calculator.freeConsultation") },
                        { icon: <Shield size={12} className="text-blue-400" />, text: t("calculator.satisfactionGuarantee") },
                        { icon: <Zap size={12} className="text-yellow-400" />, text: t("calculator.dailyUpdates") },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          {item.icon}
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>

                    <Link href="/contact">
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageCircle size={16} /> {t("calculator.bookConsultation")}
                      </motion.div>
                    </Link>

                    <a
                      href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
                      target="_blank" rel="noopener noreferrer"
                      className="w-full border border-green-400/40 text-green-400 py-2.5 rounded-xl font-mono text-sm hover:bg-green-400/10 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={14} /> {t("calculator.whatsappDirect")}
                    </a>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
