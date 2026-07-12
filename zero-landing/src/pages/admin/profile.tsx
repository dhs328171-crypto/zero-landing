import { useState } from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, CheckCircle, Camera, Briefcase, Star, MessageSquare, Award, Globe, Edit2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function AdminProfile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [editBio, setEditBio] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name ?? "ZERO",
    username: user?.email ?? "zeru50549@gmail.com",
    title: "مطور Full Stack & Software Architect",
    bio: "بناء مواقع وتطبيقات رقمية تتفوق على التوقعات. أؤمن أن الكود الجيد ليس فقط كوداً يعمل — بل كود يُبهر ويُلهم ويصمد أمام الزمن. 5+ سنوات من الخبرة، 52+ مشروع ناجح.",
    location: "المملكة العربية السعودية",
    website: "https://zero.dev",
    whatsapp: "https://chat.whatsapp.com/LkJJ5CIyE0mFdFIupB33J9",
    email: "zero@dev.com",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = [
    { icon: <Briefcase size={16} className="text-primary" />, label: "المشاريع", value: "52+" },
    { icon: <Star size={16} className="text-yellow-400" />, label: "التقييم", value: "4.9★" },
    { icon: <MessageSquare size={16} className="text-green-400" />, label: "العملاء", value: "30+" },
    { icon: <Award size={16} className="text-purple-400" />, label: "سنوات خبرة", value: "5+" },
  ];

  const skills = [
    { name: "React / Next.js", level: 97 },
    { name: "TypeScript", level: 93 },
    { name: "Node.js", level: 90 },
    { name: "UI/UX Design", level: 88 },
    { name: "PostgreSQL / MongoDB", level: 85 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">ملفي الشخصي</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">// profile.view() — {user?.role}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: avatar + stats */}
          <div className="space-y-5">
            {/* Avatar card */}
            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img src="/zero-logo.png" alt="ZERO" className="w-full h-full rounded-2xl object-cover border-2 border-primary/40 drop-shadow-[0_0_12px_rgba(0,217,255,0.3)]" />
                <button className="absolute -bottom-2 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-all">
                  <Camera size={14} />
                </button>
              </div>
              <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
              <p className="text-xs text-primary font-mono mb-3">{profile.title}</p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Globe size={11} className="text-primary" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-mono">متاح للمشاريع</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="font-bold font-mono text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Skills preview */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <span className="font-mono text-primary text-xs">// skills</span>
              </h3>
              <div className="space-y-3">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="font-mono text-primary">{s.level}%</span>
                    </div>
                    <div className="h-1 bg-background rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.level}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: edit form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-5 flex items-center gap-2">
                <Edit2 size={15} className="text-primary" /> المعلومات الأساسية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "الاسم الظاهر", field: "name" },
                  { label: "المسمى الوظيفي", field: "title" },
                  { label: "الموقع الجغرافي", field: "location" },
                  { label: "الموقع الإلكتروني", field: "website" },
                  { label: "واتساب", field: "whatsapp" },
                  { label: "البريد الإلكتروني", field: "email" },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                    <input
                      value={(profile as Record<string, string>)[field]}
                      onChange={(e) => setProfile((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">النبذة الشخصية</h2>
                <button onClick={() => setEditBio(!editBio)} className="text-xs text-primary hover:underline font-mono">
                  {editBio ? "معاينة" : "تعديل"}
                </button>
              </div>
              {editBio ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none leading-relaxed"
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              )}
            </div>

            {/* Account info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold mb-4">معلومات الحساب</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">اسم المستخدم</p>
                  <p className="font-mono text-foreground">{profile.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الصلاحية</p>
                  <span className="text-xs font-mono bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">تاريخ الإنشاء</p>
                  <p className="font-mono text-foreground text-xs">2019-01-01</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">آخر دخول</p>
                  <p className="font-mono text-foreground text-xs">اليوم - 8:00 ص</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: saved ? 1 : 0 }}
                className="flex items-center gap-2 text-green-400 text-sm font-mono"
              >
                <CheckCircle size={15} /> تم حفظ التغييرات بنجاح!
              </motion.div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-mono hover:bg-primary/90 glow-cyan transition-all"
              >
                <Save size={15} /> حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
