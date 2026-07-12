import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, ArrowRight, Mail, Lock, User, CheckCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useT, useI18n } from "@/contexts/i18n-context";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const t = useT();
  const { dir } = useI18n();

  const perks = [
    t("lg.w1"), t("lg.w2"), t("lg.w3"), t("lg.w4"), t("lg.w5"), t("lg.w6"),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError(t("auth.passwordMismatch")); return; }
    if (!agreed) { setError(t("auth.mustAgree")); return; }
    setLoading(true);
    try {
      const result = await register(name, email, password);
      setLoading(false);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error || t("auth.registerError"));
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || t("auth.registerError"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir={dir}>
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

      {/* Top-left: language switcher */}
      <div className="absolute top-6 left-6 z-20">
        <LanguageSwitcher compact />
      </div>

      <Link href="/">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 right-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        >
          <span className="text-sm font-mono">{t("nav.home")}</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.div>
      </Link>

      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: Perks */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col gap-6"
        >
          <div>
            <img src="/zero-logo.png" alt="ZERO" className="h-14 w-auto mb-4 drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]" />
            <h2 className="text-3xl font-bold text-foreground mb-2">{t("auth.registerHero")}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("auth.registerHeroDesc")}
            </p>
          </div>
          <div className="space-y-3">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-sm text-foreground/80"
              >
                <CheckCircle size={16} className="text-primary flex-shrink-0" />
                {perk}
              </motion.div>
            ))}
          </div>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="font-mono text-xs text-primary">// {t("auth.perksNote")}</p>
          </div>
        </motion.div>

        {/* Right: Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">{t("auth.registerTitle")}</h1>
              <p className="text-sm text-muted-foreground font-mono">// ZERO.AUTH.REGISTER</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User size={13} className="text-primary" />
                  {t("auth.fullName")}
                </label>
                <Input
                  placeholder={t("auth.namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail size={13} className="text-primary" />
                  {t("common.email")}
                </label>
                <Input
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border focus:border-primary font-mono"
                  required
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock size={13} className="text-primary" />
                    {t("common.password")}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-border focus:border-primary pr-3 pl-9 font-mono text-sm"
                      required
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t("auth.confirmPassword")}</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`bg-background border-border focus:border-primary font-mono text-sm ${confirm && password !== confirm ? "border-red-400/50" : confirm && password === confirm ? "border-green-400/50" : ""}`}
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password strength */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= i * 2
                            ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-yellow-400" : i <= 3 ? "bg-blue-400" : "bg-green-400"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {password.length < 6 ? t("auth.weak") : password.length < 10 ? t("auth.fair") : password.length < 14 ? t("auth.good") : t("auth.strong")}
                  </p>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${agreed ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}
                >
                  {agreed && <CheckCircle size={10} className="text-primary-foreground" />}
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {t("auth.iAgreeTo")}{" "}
                  <Link href="/terms"><span className="text-primary hover:underline">{t("lg.terms")}</span></Link>
                  {" "}{t("auth.and")}{" "}
                  <Link href="/privacy"><span className="text-primary hover:underline">{t("lg.privacy")}</span></Link>
                </span>
              </label>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
                >
                  <Terminal size={13} />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full inline-block"
                    />
                    {t("auth.creating")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={15} />
                    {t("auth.createAccount")}
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              {t("auth.haveAccount")}{" "}
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer font-medium">{t("nav.login")}</span>
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
