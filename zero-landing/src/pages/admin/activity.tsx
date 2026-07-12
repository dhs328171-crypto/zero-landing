import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CheckCircle, MessageSquare, Briefcase, Users, Settings, LogIn, AlertCircle, Star, Clock } from "lucide-react";

type ActivityType = "project" | "message" | "client" | "settings" | "auth" | "review" | "alert";

interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  desc: string;
  time: string;
  date: string;
  user: string;
}

const iconMap: Record<ActivityType, { icon: React.ElementType; color: string; bg: string }> = {
  project: { icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
  message: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-400/10" },
  client: { icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
  settings: { icon: Settings, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  auth: { icon: LogIn, color: "text-purple-400", bg: "bg-purple-400/10" },
  review: { icon: Star, color: "text-orange-400", bg: "bg-orange-400/10" },
  alert: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
};

const activities: Activity[] = [
  { id: 1, type: "project", title: "تسليم مشروع المتجر الإلكتروني", desc: "تم تسليم متجر أحمد السعيد بعد الاختبارات الكاملة وموافقة العميل", time: "10:30 ص", date: "اليوم", user: "zero_admin" },
  { id: 2, type: "message", title: "رسالة جديدة من سارة القحطاني", desc: "استفسار عن تطوير متجر ملابس إلكتروني مع تكامل Shopify", time: "9:15 ص", date: "اليوم", user: "سارة القحطاني" },
  { id: 3, type: "auth", title: "تسجيل دخول ناجح", desc: "تسجيل دخول من المتصفح — Chrome / Windows", time: "8:00 ص", date: "اليوم", user: "zero_admin" },
  { id: 4, type: "client", title: "عميل جديد: شركة TechPro", desc: "إضافة عميل جديد وبدء مشروع SaaS بقيمة 12,000 ر.س", time: "3:00 م", date: "أمس", user: "zero_admin" },
  { id: 5, type: "review", title: "تقييم جديد 5 نجوم", desc: "أحمد السعيد أضاف تقييماً: متجر رائع وسرعة مذهلة!", time: "11:45 ص", date: "أمس", user: "أحمد السعيد" },
  { id: 6, type: "project", title: "تحديث حالة: منصة SaaS", desc: "تم الانتهاء من بناء API المصادقة والبدء في واجهة المستخدم", time: "2:00 م", date: "أمس", user: "zero_admin" },
  { id: 7, type: "settings", title: "تحديث إعدادات الموقع", desc: "تم تحديث Meta tags وإضافة Schema markup لتحسين SEO", time: "10:00 ص", date: "أمس", user: "zero_admin" },
  { id: 8, type: "alert", title: "تنبيه: انتهاء موعد مشروع", desc: "يجب تسليم مشروع لوحة التحكم العقارية خلال 3 أيام", time: "8:00 ص", date: "أمس", user: "النظام" },
  { id: 9, type: "message", title: "رد على استفسار د. محمد", desc: "تم الرد على استفسار تعديل ميزة الحجز في التطبيق", time: "5:00 م", date: "27 أبريل", user: "zero_admin" },
  { id: 10, type: "client", title: "تحديث بيانات عميل", desc: "تحديث معلومات التواصل لشركة مجموعة الرياض", time: "11:00 ص", date: "27 أبريل", user: "zero_admin" },
  { id: 11, type: "project", title: "مشروع جديد: موقع مطعم", desc: "بدء مشروع جديد لمطعم سعودي مع نظام طلب أونلاين", time: "9:30 ص", date: "26 أبريل", user: "zero_admin" },
  { id: 12, type: "auth", title: "تغيير كلمة المرور", desc: "تم تغيير كلمة مرور لوحة التحكم بنجاح", time: "7:00 م", date: "25 أبريل", user: "zero_admin" },
];

const grouped = activities.reduce((acc, a) => {
  if (!acc[a.date]) acc[a.date] = [];
  acc[a.date].push(a);
  return acc;
}, {} as Record<string, Activity[]>);

export default function AdminActivity() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">سجل الأنشطة</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">// activity.log() — {activities.length} حدث مسجّل</p>
          </div>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground">
            <Clock size={13} className="text-primary" />
            آخر تحديث: الآن
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { type: "project", label: "مشاريع", count: activities.filter((a) => a.type === "project").length },
            { type: "message", label: "رسائل", count: activities.filter((a) => a.type === "message").length },
            { type: "client", label: "عملاء", count: activities.filter((a) => a.type === "client").length },
            { type: "alert", label: "تنبيهات", count: activities.filter((a) => a.type === "alert").length },
          ].map((s) => {
            const cfg = iconMap[s.type as ActivityType];
            return (
              <div key={s.type} className={`bg-card border border-border rounded-xl p-4 flex items-center gap-3`}>
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                  <cfg.icon size={16} className={cfg.color} />
                </div>
                <div>
                  <p className={`text-xl font-bold font-mono ${cfg.color}`}>{s.count}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{date}</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-mono">{items.length} أحداث</span>
              </div>

              <div className="space-y-3 pr-4 border-r border-border/50">
                {items.map((a, i) => {
                  const cfg = iconMap[a.type];
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="relative flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all"
                    >
                      <div className="absolute -right-6 top-4 w-3 h-3 rounded-full bg-card border-2 border-border" />
                      <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <cfg.icon size={16} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-foreground leading-snug">{a.title}</h3>
                          <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{a.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[8px] font-bold">
                            {a.user[0]}
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{a.user}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
