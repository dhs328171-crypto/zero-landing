import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, MoreHorizontal, Calendar, Tag, GripVertical } from "lucide-react";

type Priority = "عالية" | "متوسطة" | "منخفضة";
type Status = "pending" | "inprogress" | "review" | "done";

interface Task {
  id: number;
  title: string;
  desc: string;
  priority: Priority;
  status: Status;
  tag: string;
  due: string;
}

const priorityConfig: Record<Priority, string> = {
  "عالية": "bg-red-400/10 text-red-400 border-red-400/20",
  "متوسطة": "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  "منخفضة": "bg-green-400/10 text-green-400 border-green-400/20",
};

const columns: { id: Status; label: string; color: string }[] = [
  { id: "pending", label: "قائمة الانتظار", color: "border-t-muted-foreground/30" },
  { id: "inprogress", label: "قيد التنفيذ", color: "border-t-primary" },
  { id: "review", label: "مراجعة", color: "border-t-yellow-400" },
  { id: "done", label: "مكتمل", color: "border-t-green-400" },
];

const initialTasks: Task[] = [
  { id: 1, title: "تصميم واجهة الهوم", desc: "إعادة تصميم الصفحة الرئيسية بتأثيرات جديدة", priority: "عالية", status: "pending", tag: "تصميم", due: "2026-05-10" },
  { id: 2, title: "API تسجيل الدخول", desc: "بناء نقاط API للمصادقة والتفويض", priority: "عالية", status: "inprogress", tag: "بك إند", due: "2026-05-08" },
  { id: 3, title: "لوحة إحصائيات المتجر", desc: "رسوم بيانية تفاعلية للمبيعات اليومية", priority: "متوسطة", status: "inprogress", tag: "فرونت إند", due: "2026-05-12" },
  { id: 4, title: "نظام الإشعارات", desc: "إشعارات push للتطبيق والبريد", priority: "متوسطة", status: "review", tag: "فرونت إند", due: "2026-05-06" },
  { id: 5, title: "تحسين قاعدة البيانات", desc: "إضافة indexes وتحسين الاستعلامات", priority: "منخفضة", status: "review", tag: "بك إند", due: "2026-05-15" },
  { id: 6, title: "صفحة المدونة", desc: "بناء صفحة مقالات مع CMS بسيط", priority: "منخفضة", status: "done", tag: "فرونت إند", due: "2026-04-30" },
  { id: 7, title: "تحسين SEO", desc: "Meta tags, sitemap, وSchema markup", priority: "متوسطة", status: "done", tag: "تقني", due: "2026-04-20" },
  { id: 8, title: "اختبار الأمان", desc: "فحص الثغرات وتأمين النقاط الحساسة", priority: "عالية", status: "pending", tag: "أمان", due: "2026-05-14" },
];

const tagColors: Record<string, string> = {
  "تصميم": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "بك إند": "text-green-400 bg-green-400/10 border-green-400/20",
  "فرونت إند": "text-primary bg-primary/10 border-primary/20",
  "تقني": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "أمان": "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<Status | null>(null);

  const move = (id: number, to: Status) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: to } : t));
    setDragging(null);
    setOver(null);
  };

  const getCol = (status: Status) => tasks.filter((t) => t.status === status);

  return (
    <AdminLayout>
      <div className="space-y-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة المهام (Kanban)</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">// tasks.board() — {tasks.length} مهمة</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-3">
              {columns.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${c.color.replace("border-t-", "bg-")}`} />
                  {getCol(c.id).length}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pb-6">
          {columns.map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); setOver(col.id); }}
              onDrop={() => dragging !== null && move(dragging, col.id)}
              onDragLeave={() => setOver(null)}
              className={`flex flex-col gap-3 min-h-[300px] rounded-xl border-t-2 bg-card/30 p-4 transition-all ${col.color} ${over === col.id ? "bg-primary/5 border border-dashed border-primary/30" : "border border-border"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="mr-2 text-xs font-mono text-muted-foreground">({getCol(col.id).length})</span>
                </div>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Plus size={15} />
                </button>
              </div>

              <AnimatePresence>
                {getCol(col.id).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    draggable
                    onDragStart={() => setDragging(task.id)}
                    className={`bg-card border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all group ${dragging === task.id ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${tagColors[task.tag] || "text-muted-foreground bg-muted/10 border-border"}`}>
                        <Tag size={8} className="inline mr-0.5" />{task.tag}
                      </span>
                      <div className="flex items-center gap-1">
                        <GripVertical size={12} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                        <button className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold mb-1 leading-snug">{task.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${priorityConfig[task.priority]}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <Calendar size={9} />
                        {task.due}
                      </div>
                    </div>

                    {/* Quick move buttons */}
                    <div className="flex gap-1 mt-3 pt-2 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter((c) => c.id !== task.status).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => move(task.id, c.id)}
                          className="flex-1 text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors border border-border hover:border-primary/30 rounded py-0.5 truncate"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {getCol(col.id).length === 0 && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground/30 text-xs font-mono border border-dashed border-border/50 rounded-xl py-8">
                  أفلت هنا
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
