import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save, GripVertical, ToggleLeft, ToggleRight, Search, Loader2 } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, qs, type Paginated } from "@/lib/api";
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string; // JSON string
  price: string | null;
  active: boolean;
  order: number;
}

const emptyService = {
  title: "", description: "", icon: "⚡", features: [] as string[], price: "", active: true, order: 0,
};

export default function AdminServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ ...emptyService });
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({ page: 1, limit: 100, q: search, all: true });
      const res = await apiGet<Paginated<Service>>(`/services${query}`);
      setServices(res.items);
      setTotal(res.total);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyService, order: services.length + 1 });
    setIsAdding(true);
  };
  const openEdit = (s: Service) => {
    setEditing(s);
    let feats: string[] = [];
    try { feats = JSON.parse(s.features || "[]"); } catch {}
    setForm({
      title: s.title, description: s.description, icon: s.icon,
      features: feats, price: s.price || "", active: s.active, order: s.order,
    });
    setIsAdding(true);
  };

  const save = async () => {
    if (!form.title) {
      toast.error("عنوان الخدمة مطلوب");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        icon: form.icon,
        features: form.features,
        price: form.price || null,
        active: form.active,
        order: form.order,
      };
      if (editing) {
        await apiPut(`/services/${editing.id}`, payload);
        toast.success("تم تحديث الخدمة");
      } else {
        await apiPost(`/services`, payload);
        toast.success("تم إضافة الخدمة");
      }
      setIsAdding(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      await apiPut(`/services/${s.id}`, { active: !s.active });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };
  const deleteService = async (id: string) => {
    try {
      await apiDelete(`/services/${id}`);
      toast.success("تم حذف الخدمة");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm((p) => ({ ...p, features: [...p.features, featureInput.trim()] }));
    setFeatureInput("");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إدارة الخدمات</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              // services.manage() — {services.filter((s) => s.active).length}/{total} نشطة
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-mono hover:bg-primary/90 glow-cyan transition-all"
          >
            <Plus size={16} /> خدمة جديدة
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الخدمات..."
            className="w-full bg-card border border-border rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 size={20} className="animate-spin mr-2" /> جاري التحميل...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm bg-card border border-dashed border-border rounded-xl">
            لا توجد خدمات
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence>
              {services.map((s, i) => {
                let feats: string[] = [];
                try { feats = JSON.parse(s.features || "[]"); } catch {}
                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-card border rounded-xl p-5 group transition-all ${
                      s.active ? "border-border hover:border-primary/40" : "border-border/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                          <h3 className="font-semibold">{s.title}</h3>
                          <span className={`text-xs font-mono ${s.active ? "text-green-400" : "text-muted-foreground"}`}>
                            {s.active ? "● نشط" : "○ معطل"}
                          </span>
                        </div>
                      </div>
                      <GripVertical size={16} className="text-muted-foreground/30 cursor-grab" />
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.description}</p>

                    {feats.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {feats.map((f, fi) => (
                          <span key={fi} className="text-[10px] font-mono bg-primary/5 border border-primary/10 text-primary/70 rounded px-1.5 py-0.5">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {s.price && (
                      <p className="text-xs text-yellow-400 font-mono mb-3">{s.price}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteService(s.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <button onClick={() => toggleActive(s)} className={`transition-colors ${s.active ? "text-green-400" : "text-muted-foreground"}`}>
                        {s.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsAdding(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg">{editing ? "تعديل الخدمة" : "إضافة خدمة"}</h2>
                  <button onClick={() => setIsAdding(false)}>
                    <X size={18} className="text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">الإيموجي / الأيقونة</label>
                      <input
                        value={form.icon}
                        onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-lg focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">عنوان الخدمة</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        placeholder="تطوير المواقع"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الوصف</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">المميزات</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.features.map((f, fi) => (
                        <span key={fi} className="flex items-center gap-1 text-xs bg-primary/10 border border-primary/20 text-primary rounded-full px-2 py-0.5">
                          {f}
                          <button
                            onClick={() => setForm((p) => ({ ...p, features: p.features.filter((_, i) => i !== fi) }))}
                            className="text-primary/50 hover:text-primary"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                        placeholder="أضف ميزة..."
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                      <button onClick={addFeature} className="bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm hover:bg-primary/90">+</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">السعر (اختياري)</label>
                      <input
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                        placeholder="مثال: من 500 ر.س"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">الترتيب</label>
                      <input
                        type="number"
                        value={form.order}
                        onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                      className="accent-primary"
                    />
                    خدمة نشطة
                  </label>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-mono text-sm hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {editing ? "حفظ" : "إضافة"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
