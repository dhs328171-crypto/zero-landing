import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Mail, Clock, MapPin, Send, CheckCircle,
  AlertCircle, ChevronDown, Loader2,
} from "lucide-react";
import { useT } from "@/contexts/i18n-context";
import { apiPost } from "@/lib/api";

type Field = "name" | "email" | "subject" | "message";

interface Form { name: string; email: string; subject: string; message: string; }
interface Errors { [k: string]: string; }

export default function Contact() {
  const t = useT();
  const [form, setForm] = useState<Form>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [step, setStep] = useState<"form" | "success" | "error">("form");
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState<Set<Field>>(new Set());

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = t("common.required");
    if (!form.email.trim()) e.email = t("common.required");
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t("contact.formError");
    if (!form.message.trim()) e.message = t("common.required");
    else if (form.message.length < 10) e.message = t("contact.formError");
    return e;
  };

  const touch = (field: Field) => setTouched((prev) => new Set(prev).add(field));

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    setTouched(new Set(["name", "email", "subject", "message"] as Field[]));
    if (Object.keys(e).length > 0) return;
    setSending(true);
    try {
      await apiPost("/messages", {
        name: form.name,
        email: form.email,
        subject: form.subject || t("common.message"),
        message: form.message,
      });
      setStep("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setStep("error");
    } finally {
      setSending(false);
    }
  };

  const update = (f: Field, v: string) => {
    setForm((p) => ({ ...p, [f]: v }));
    if (touched.has(f)) {
      const e = validate();
      setErrors((prev) => ({ ...prev, [f]: e[f] ?? "" }));
    }
  };

  const inputClass = (field: Field) =>
    `w-full bg-background border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
      errors[field] && touched.has(field) ? "border-red-400 focus:border-red-400" : "border-border focus:border-primary"
    }`;

  const quickBadges = [
    {
      icon: <MessageCircle size={16} className="text-green-400" />,
      label: t("contact.whatsapp"),
      val: t("contact.whatsappDesc"),
      href: "https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9",
      color: "border-green-400/30 bg-green-400/5",
    },
    {
      icon: <Mail size={16} className="text-primary" />,
      label: t("contact.email"),
      val: "zero@dev.com",
      href: "mailto:zero@dev.com",
      color: "border-primary/30 bg-primary/5",
    },
    {
      icon: <Clock size={16} className="text-yellow-400" />,
      label: t("contact.hours"),
      val: t("contact.hoursValue"),
      href: "#",
      color: "border-yellow-400/30 bg-yellow-400/5",
    },
    {
      icon: <MapPin size={16} className="text-purple-400" />,
      label: t("contact.location"),
      val: t("contact.locationValue"),
      href: "#",
      color: "border-purple-400/30 bg-purple-400/5",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-mono text-primary text-xs tracking-widest uppercase mb-4 block">// contact.init()</span>
            <h1 className="text-5xl font-bold mb-4">
              {t("contact.title").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="text-primary glow-cyan-text">{t("contact.title").split(" ").slice(-1)}</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">{t("contact.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      {/* Quick contact badges */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-4">
          {quickBadges.map((b, i) => (
            <motion.a
              key={i}
              href={b.href}
              target={b.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 border ${b.color} rounded-xl px-4 py-3 hover:scale-105 transition-all min-w-[180px]`}
            >
              <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center">
                {b.icon}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{b.label}</p>
                <p className="text-sm font-semibold text-foreground">{b.val}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Form + side panel */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-8">
                <AnimatePresence mode="wait">
                  {step === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">{t("common.confirm")}</h3>
                      <p className="text-muted-foreground text-sm mb-6">{t("contact.formSuccess")}</p>
                      <button
                        onClick={() => setStep("form")}
                        className="text-primary hover:underline text-sm font-mono cursor-pointer"
                      >
                        ← {t("common.back")}
                      </button>
                    </motion.div>
                  ) : step === "error" ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <AlertCircle size={56} className="text-red-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">{t("contact.formError")}</h3>
                      <button
                        onClick={() => setStep("form")}
                        className="text-primary hover:underline text-sm font-mono cursor-pointer mt-4"
                      >
                        ← {t("common.back")}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{t("contact.formName")}</label>
                          <input
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            onBlur={() => touch("name")}
                            placeholder={t("contact.formNamePlaceholder")}
                            className={inputClass("name")}
                          />
                          {errors.name && touched.has("name") && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">{t("contact.formEmail")}</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            onBlur={() => touch("email")}
                            placeholder={t("contact.formEmailPlaceholder")}
                            className={inputClass("email")}
                            dir="ltr"
                          />
                          {errors.email && touched.has("email") && (
                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> {errors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">{t("contact.formSubject")}</label>
                        <input
                          value={form.subject}
                          onChange={(e) => update("subject", e.target.value)}
                          onBlur={() => touch("subject")}
                          placeholder={t("contact.formSubjectPlaceholder")}
                          className={inputClass("subject")}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">{t("contact.formMessage")}</label>
                        <textarea
                          value={form.message}
                          onChange={(e) => update("message", e.target.value)}
                          onBlur={() => touch("message")}
                          placeholder={t("contact.formMessagePlaceholder")}
                          rows={6}
                          className={`${inputClass("message")} resize-none`}
                        />
                        {errors.message && touched.has("message") && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} /> {errors.message}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={sending}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-mono text-sm hover:bg-primary/90 glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {sending ? (
                          <><Loader2 size={15} className="animate-spin" /> {t("contact.formSubmitting")}</>
                        ) : (
                          <><Send size={15} /> {t("contact.formSubmit")}</>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-5">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MessageCircle size={16} className="text-primary" /> {t("contact.directTitle")}
                </h3>
                <div className="space-y-4">
                  <a
                    href="https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-green-400/40 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                      <MessageCircle size={16} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("contact.whatsapp")}</p>
                      <p className="text-xs text-muted-foreground">{t("contact.whatsappDesc")}</p>
                    </div>
                  </a>

                  <a
                    href="mailto:zero@dev.com"
                    className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-primary/40 transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Mail size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("contact.email")}</p>
                      <p className="text-xs text-muted-foreground">{t("contact.emailDesc")}</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
                      <Clock size={16} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("contact.hours")}</p>
                      <p className="text-xs text-muted-foreground">{t("contact.hoursValue")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-purple-400/10 border border-purple-400/30 flex items-center justify-center">
                      <MapPin size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t("contact.location")}</p>
                      <p className="text-xs text-muted-foreground">{t("contact.locationValue")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 text-center">
                <p className="text-xs font-mono text-primary mb-2">// response.time()</p>
                <p className="text-2xl font-bold mb-1">{t("contact.responseTimeValue")}</p>
                <p className="text-xs text-muted-foreground">{t("contact.responseTime")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
