import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Globe, MapPin, Edit3, Save, X, Camera, Shield, Calendar, Award } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const { dir } = useI18n();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    country: user?.country || "",
    website: user?.website || "",
    bio: user?.bio || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;

  const joinedDate = new Date(user.joinedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
              <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 border-2 border-primary/40 flex items-center justify-center text-3xl font-bold text-primary">
                    {user.name.charAt(0)}
                  </div>
                  <button className="absolute -bottom-1 -left-1 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center hover:border-primary/50 transition-colors">
                    <Camera size={12} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                    {user.role === "admin" && (
                      <span className="text-[10px] font-mono bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                    {user.verified && (
                      <Shield size={14} className="text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={11} />{joinedDate}</span>
                    <span className="flex items-center gap-1"><Award size={11} />عضو {user.role === "admin" ? "أدمن" : "نشط"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs glow-cyan">
                        <Save size={12} className="ml-1" />
                        حفظ
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="font-mono text-xs">
                        <X size={12} className="ml-1" />
                        إلغاء
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="border-primary/50 text-primary font-mono text-xs">
                      <Edit3 size={12} className="ml-1" />
                      تعديل
                    </Button>
                  )}
                </div>
              </div>

              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-xs text-green-400 font-mono flex items-center gap-1.5"
                >
                  ✓ تم حفظ التغييرات بنجاح
                </motion.div>
              )}
            </div>

            {/* Profile Form */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <User size={16} className="text-primary" />
                المعلومات الشخصية
              </h2>

              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <User size={11} className="text-primary" /> الاسم الكامل
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={!editing}
                      className="bg-background border-border focus:border-primary disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Mail size={11} className="text-primary" /> البريد الإلكتروني
                    </label>
                    <Input
                      value={user.email}
                      disabled
                      className="bg-background border-border opacity-60 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Phone size={11} className="text-primary" /> رقم الهاتف
                    </label>
                    <Input
                      placeholder="+966 5X XXX XXXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      disabled={!editing}
                      className="bg-background border-border focus:border-primary disabled:opacity-60 font-mono text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <MapPin size={11} className="text-primary" /> الدولة
                    </label>
                    <Input
                      placeholder="المملكة العربية السعودية"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      disabled={!editing}
                      className="bg-background border-border focus:border-primary disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Globe size={11} className="text-primary" /> الموقع الإلكتروني
                  </label>
                  <Input
                    placeholder="https://yoursite.com"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    disabled={!editing}
                    className="bg-background border-border focus:border-primary disabled:opacity-60 font-mono text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">نبذة عنك</label>
                  <textarea
                    placeholder="اكتب نبذة قصيرة عن نفسك..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    disabled={!editing}
                    rows={3}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-60 resize-none transition-colors"
                  />
                </div>
              </div>

              {editing && (
                <div className="mt-5 pt-5 border-t border-border flex gap-3">
                  <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan font-mono">
                    <Save size={14} className="ml-2" />
                    حفظ التغييرات
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="font-mono">
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
