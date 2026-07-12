import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save, CheckCircle, GripVertical } from "lucide-react";

interface Skill {
  id: number; name: string; level: number; category: string; color: string; icon: string; visible: boolean;
}

const cats = ["Frontend", "Backend", "Mobile", "Database", "DevOps", "Design", "أخرى"];
const colorOptions = [
  { label: "Cyan", value: "bg-primary/20 text-primary border-primary/30" },
  { label: "Purple", value: "bg-purple-400/20 text-purple-400 border-purple-400/30" },
  { label: "Green", value: "bg-green-400/20 text-green-400 border-green-400/30" },
  { label: "Blue", value: "bg-blue-400/20 text-blue-400 border-blue-400/30" },
  { label: "Orange", value: "bg-orange-400/20 text-orange-400 border-orange-400/30" },
  { label: "Yellow", value: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30" },
];

const initialSkills: Skill[] = [
  { id: 1, name: "React", level: 98, category: "Frontend", color: colorOptions[0].value, icon: "⚛️", visible: true },
  { id: 2, name: "Next.js", level: 95, category: "Frontend", color: colorOptions[0].value, icon: "▲", visible: true },
  { id: 3, name: "TypeScript", level: 92, category: "Frontend", color: colorOptions[3].value, icon: "𝙏𝙎", visible: true },
  { id: 4, name: "Node.js", level: 90, category: "Backend", color: colorOptions[2].value, icon: "🟢", visible: true },
  { id: 5, name: "PostgreSQL", level: 85, category: "Database", color: colorOptions[3].value, icon: "🐘", visible: true },
  { id: 6, name: "React Native", level: 80, category: "Mobile", color: colorOptions[0].value, icon: "📱", visible: true },
  { id: 7, name: "Docker", level: 78, category: "DevOps", color: colorOptions[3].value, icon: "🐳", visible: true },
  { id: 8, name: "Figma", level: 85, category: "Design", color: colorOptions[1].value, icon: "🎨", visible: true },
  { id: 9, name: "Tailwind CSS", level: 97, category: "Frontend", color: colorOptions[0].value, icon: "🌀", visible: true },
  { id: 10, name: "MongoDB", level: 80, category: "Database", color: colorOptions[2].value, icon: "🍃", visible: true },
];

const emptySkill: Omit<Skill, "id"> = { name: "", level: 80, category: "Frontend", color: colorOptions[0].value, icon: "", visible: true };

function LevelBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${level}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-primary rounded-full" />
      </div>
      <span className="text-xs font-mono text-primary w-8 text-left">{level}%</span>
    </div>
  );
}

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [catFilter, setCatFilter] = useState("الكل");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState<Omit<Skill, "id">>(emptySkill);
  const [saved, setSaved] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = catFilter === "الكل" ? skills : skills.filter((s) => s.category === catFilter);

  const openAdd = () => { setEditing(null); setForm(emptySkill); setShowModal(true); };
  const openEdit = (s: Skill) => { setEditing(s); setForm({ name: s.name, level: s.level, category: s.category, color: s.color, icon: s.icon, visible: s.visible }); setShowModal(true); };

  const save = () => {
    if (editing) {
      setSkills((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      setSkills((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = (id: number) => { setSkills((prev) => prev.filter((s) => s.id !== id)); setDeleteId(null); };
  const toggleVisible = (id: number) => setSkills((prev) => prev.map((s) => s.id === id ? { ...s, visible: !s.visible } : s));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">إدارة المهارات</h1>
            <p className="text-sm text-muted-foreground font-mono">// skills.manage()</p>
          </div>
          <div className="flex gap-3">
            {saved && <span className="flex items-center gap-1.5 text-sm text-green-400 font-mono"><CheckCircle size={14} />تم الحفظ!</span>}
            <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-mono hover:bg-primary/90 glow-cyan transition-all">
              <Plus size={16} /> إضافة مهارة
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "إجمالي المهارات", v: skills.length, c: "text-primary" },
            { l: "مرئية", v: skills.filter((s) => s.visible).length, c: "text-green-400" },
            { l: "متوسط المستوى", v: Math.round(skills.reduce((s, sk) => s + sk.level, 0) / skills.length) + "%", c: "text-yellow-400" },
            { l: "التصنيفات", v: cats.length, c: "text-purple-400" },
          ].map((s) => (
            <div key={s.l} className="bg-card border border-border rounded-xl p-4">
              <p className={`text-2xl font-bold font-mono ${s.c}`}>{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {["الكل", ...cats].map((c) => (
            <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${catFilter === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>{c}</button>
          ))}
        </div>

        {/* Skills list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((skill, i) => (
              <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-card border rounded-xl px-4 py-3 transition-all ${skill.visible ? "border-border" : "border-border/40 opacity-60"}`}>
                <div className="flex items-center gap-3">
                  <GripVertical size={14} className="text-muted-foreground/30 flex-shrink-0 cursor-grab" />
                  <span className="text-xl flex-shrink-0">{skill.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold">{skill.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${skill.color}`}>{skill.category}</span>
                      {!skill.visible && <span className="text-[10px] font-mono text-muted-foreground">(مخفي)</span>}
                    </div>
                    <LevelBar level={skill.level} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleVisible(skill.id)} className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${skill.visible ? "border-green-400/30 text-green-400" : "border-border text-muted-foreground"}`}>
                      {skill.visible ? "مرئي" : "مخفي"}
                    </button>
                    <button onClick={() => openEdit(skill)} className="text-muted-foreground hover:text-primary p-1.5 rounded-lg border border-border hover:border-primary/40 transition-all"><Edit2 size={12} /></button>
                    <button onClick={() => setDeleteId(skill.id)} className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg border border-border hover:border-red-400/40 transition-all"><Trash2 size={12} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold">{editing ? "تعديل مهارة" : "إضافة مهارة جديدة"}</h2>
                  <button onClick={() => setShowModal(false)}><X size={18} className="text-muted-foreground" /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">اسم المهارة *</label>
                      <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">الأيقونة (Emoji)</label>
                      <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="⚛️" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">التصنيف</label>
                    <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                      {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">مستوى الكفاءة: {form.level}%</label>
                    <input type="range" min={10} max={100} step={5} value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: Number(e.target.value) }))} className="w-full accent-primary" />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>10%</span><span>100%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">اللون</label>
                    <div className="flex gap-2 flex-wrap">
                      {colorOptions.map((co) => (
                        <button key={co.value} onClick={() => setForm((p) => ({ ...p, color: co.value }))}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${co.value} ${form.color === co.value ? "ring-2 ring-offset-2 ring-offset-card ring-primary/50" : ""}`}>
                          {co.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.visible} onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} className="accent-primary" />
                    مرئي في الموقع
                  </label>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={save} className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-mono hover:bg-primary/90 transition-all">
                    <Save size={14} /> حفظ
                  </button>
                  <button onClick={() => setShowModal(false)} className="border border-border text-muted-foreground px-5 py-2.5 rounded-xl text-sm font-mono hover:border-primary/40 transition-all">إلغاء</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirm */}
        <AnimatePresence>
          {deleteId && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/70 backdrop-blur flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-card border border-red-400/20 rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl">
                <Trash2 size={28} className="text-red-400 mx-auto mb-3" />
                <h3 className="font-bold mb-1">حذف المهارة؟</h3>
                <p className="text-xs text-muted-foreground mb-4">سيتم حذف هذه المهارة من الموقع.</p>
                <div className="flex gap-3">
                  <button onClick={() => remove(deleteId)} className="flex-1 bg-red-400 text-background py-2 rounded-xl text-sm font-mono">حذف</button>
                  <button onClick={() => setDeleteId(null)} className="flex-1 border border-border text-muted-foreground py-2 rounded-xl text-sm font-mono">إلغاء</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
