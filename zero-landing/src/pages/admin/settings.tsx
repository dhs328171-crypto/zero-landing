import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { User, Lock, Bell, Globe, Palette, Shield, Eye, EyeOff } from "lucide-react";
import { Field, SettingsCard } from "@/components/admin/SettingsField";

export default function AdminSettings() {
  const [saved, setSaved] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [profile, setProfile] = useState({ name: "ZERO", title: "مطور ويب متكامل", bio: "بناء مواقع احترافية بأعلى المعايير. صفر مساومة، صفر رداءة.", whatsapp: "https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9", channel: "https://whatsapp.com/channel/0029Vaxa4398V0tmGkGYkp2y", email: "zero@dev.com" });
  const [security, setSecurity] = useState({ currentPass: "", newPass: "", confirmPass: "" });
  const [notifs, setNotifs] = useState({ newMessage: true, projectUpdate: true, weeklyReport: false });
  const [appearance, setAppearance] = useState({ accentColor: "#00D9FF", primaryFont: "Tajawal" });

  const saveSection = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  };

  const sections = [
    { id: "profile", icon: User, label: "الملف الشخصي" },
    { id: "security", icon: Lock, label: "الأمان" },
    { id: "notifications", icon: Bell, label: "الإشعارات" },
    { id: "appearance", icon: Palette, label: "المظهر" },
    { id: "seo", icon: Globe, label: "SEO والبيانات" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">// إعدادات لوحة التحكم والموقع</p>
        </div>

        {/* Profile */}
        <SettingsCard id="profile" icon={User} label="الملف الشخصي" saved={saved} onSave={saveSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="الاسم المعروض" value={profile.name} onChange={(v) => setProfile((p) => ({ ...p, name: v }))} />
            <Field label="المسمى الوظيفي" value={profile.title} onChange={(v) => setProfile((p) => ({ ...p, title: v }))} />
            <Field label="البريد الإلكتروني" value={profile.email} onChange={(v) => setProfile((p) => ({ ...p, email: v }))} type="email" />
            <Field label="رابط واتساب" value={profile.whatsapp} onChange={(v) => setProfile((p) => ({ ...p, whatsapp: v }))} />
            <Field label="رابط القناة" value={profile.channel} onChange={(v) => setProfile((p) => ({ ...p, channel: v }))} />
          </div>
          <div className="mt-4">
            <label className="text-xs text-muted-foreground mb-1 block">النبذة الشخصية</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </SettingsCard>

        {/* Security */}
        <SettingsCard id="security" icon={Lock} label="الأمان وكلمة المرور" saved={saved} onSave={saveSection}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs font-mono text-primary">
              <Shield size={14} />
              بيانات الدخول الحالية: z*****@gmail.com / •••••••••• أو z*****_admin / ••••••••••
            </div>
            {[
              { label: "كلمة المرور الحالية", field: "currentPass" },
              { label: "كلمة المرور الجديدة", field: "newPass" },
              { label: "تأكيد كلمة المرور", field: "confirmPass" },
            ].map(({ label, field }) => (
              <div key={field} className="relative">
                <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={(security as Record<string, string>)[field]}
                    onChange={(e) => setSecurity((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 pr-3 pl-10 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                    dir="ltr"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard id="notifications" icon={Bell} label="الإشعارات" saved={saved} onSave={saveSection}>
          <div className="space-y-4">
            {[
              { key: "newMessage", label: "رسالة جديدة من عميل", desc: "إشعار عند وصول استفسار جديد" },
              { key: "projectUpdate", label: "تحديث المشاريع", desc: "إشعار عند تغيير حالة مشروع" },
              { key: "weeklyReport", label: "تقرير أسبوعي", desc: "ملخص أداء المشاريع كل أسبوع" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={`w-11 h-6 rounded-full transition-all relative ${notifs[key as keyof typeof notifs] ? "bg-primary" : "bg-border"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifs[key as keyof typeof notifs] ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </SettingsCard>

        {/* Appearance */}
        <SettingsCard id="appearance" icon={Palette} label="المظهر والألوان" saved={saved} onSave={saveSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">لون الإبراز (Accent)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearance.accentColor}
                  onChange={(e) => setAppearance((p) => ({ ...p, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="font-mono text-sm text-foreground">{appearance.accentColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">الخط الرئيسي</label>
              <select
                value={appearance.primaryFont}
                onChange={(e) => setAppearance((p) => ({ ...p, primaryFont: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                {["Tajawal", "Cairo", "Almarai", "Noto Kufi Arabic"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg border border-border bg-background/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: appearance.accentColor }} />
            <div>
              <p className="text-sm font-medium">معاينة اللون</p>
              <p className="text-xs font-mono" style={{ color: appearance.accentColor }}>{appearance.accentColor} — لون ZERO الكهربائي</p>
            </div>
          </div>
        </SettingsCard>

        {/* SEO */}
        <SettingsCard id="seo" icon={Globe} label="SEO وبيانات الموقع" saved={saved} onSave={saveSection}>
          <div className="space-y-4">
            <Field label="عنوان الصفحة الرئيسية" value="ZERO — مطور مواقع ويب احترافي" onChange={() => {}} />
            <Field label="وصف الموقع (Meta Description)" value="ZERO — بناء مواقع ويب احترافية بأعلى معايير الجودة والأداء. صفر مساومة." onChange={() => {}} />
            <Field label="الكلمات المفتاحية" value="مطور مواقع، React، Next.js، تطوير ويب" onChange={() => {}} />
          </div>
        </SettingsCard>
      </div>
    </AdminLayout>
  );
}