import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { apiGet, apiPut, apiDelete } from "@/lib/api";
import { Search, Edit2, Trash2, Star, X, Save, KeyRound, RefreshCw, Loader2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  company?: string | null;
  bio?: string | null;
  website?: string | null;
  joinedAt: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  role: "admin" | "user";
  verified: boolean;
  projects?: number; // placeholder, derived from messages count if needed
  rating?: number;
  status: "نشط" | "مكتمل" | "محتمل";
  testimonial?: string;
  joinDate?: string;
  contact?: string;
}

interface UsersResp {
  items: Client[];
  total: number;
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Client | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `?q=${encodeURIComponent(search)}` : "";
      const data = await apiGet<UsersResp>(`/admin/users${q}&limit=100`);
      // Map users → clients (the admin clients page is now backed by real user data)
      const mapped: Client[] = data.items.map(u => ({
        ...u,
        company: u.country || "",
        contact: u.phone || u.email,
        projects: u.lastLoginAt ? 1 : 0,
        rating: 5,
        status: u.lastLoginAt ? "نشط" : "محتمل",
        testimonial: u.bio || "",
        joinDate: u.joinedAt.slice(0, 10),
      }));
      setClients(mapped);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadClients, 300);
    return () => clearTimeout(t);
  }, [loadClients]);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await apiPut(`/admin/users/${editing.id}`, {
        name: editing.name,
        email: editing.email,
        phone: editing.contact,
        country: editing.company,
        bio: editing.testimonial,
      });
      showToast("تم حفظ التعديلات");
      setEditing(null);
      loadClients();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("حذف هذا العميل نهائياً؟")) return;
    try {
      await apiDelete(`/admin/users/${id}`);
      showToast("تم حذف العميل");
      loadClients();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const statusStyles: Record<string, string> = {
    "نشط": "bg-green-400/10 text-green-400 border-green-400/30",
    "مكتمل": "bg-primary/10 text-primary border-primary/30",
    "محتمل": "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">إدارة العملاء</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">// {clients.length} عميل مسجل</p>
          </div>
          <button
            onClick={loadClients}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono bg-card border border-border rounded-lg hover:border-primary/40"
          >
            <RefreshCw size={12} /> تحديث
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "العملاء النشطون", value: clients.filter(c => c.status === "نشط").length, color: "text-green-400" },
            { label: "إجمالي العملاء", value: clients.length, color: "text-primary" },
            { label: "عملاء محتملون", value: clients.filter(c => c.status === "محتمل").length, color: "text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold font-mono ${s.color}`}>
                {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-border text-xs font-mono text-muted-foreground">
            <span>العميل</span>
            <span>التواصل</span>
            <span>الموقع</span>
            <span>الحالة</span>
            <span>آخر دخول</span>
            <span></span>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
          ) : clients.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">لا يوجد عملاء</div>
          ) : (
            <AnimatePresence>
              {clients.map((c, i) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-border/50 hover:bg-background/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground truncate">{c.name}</p>
                      {c.role === "admin" && <KeyRound size={11} className="text-yellow-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">{c.email}</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">{c.contact || "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.country || "—"}</p>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border w-fit ${statusStyles[c.status] || statusStyles["محتمل"]}`}>{c.status}</span>
                  <p className="text-xs text-muted-foreground font-mono">
                    {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString("ar-EG") : "لم يسجل"}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditing({ ...c })} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteClient(c.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setEditing(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg">تعديل بيانات العميل</h2>
                  <button onClick={() => setEditing(null)}><X size={18} className="text-muted-foreground" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الاسم</label>
                    <input
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">البريد الإلكتروني</label>
                    <input
                      value={editing.email}
                      onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                      dir="ltr"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">التواصل (هاتف)</label>
                    <input
                      value={editing.contact || ""}
                      onChange={(e) => setEditing({ ...editing, contact: e.target.value })}
                      dir="ltr"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">الدولة / الشركة</label>
                    <input
                      value={editing.company || ""}
                      onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">نبذة / تقييم نصي</label>
                    <textarea
                      value={editing.testimonial || ""}
                      onChange={(e) => setEditing({ ...editing, testimonial: e.target.value })}
                      rows={3}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  <button
                    onClick={saveEdit}
                    className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-mono hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Save size={15} /> حفظ التغييرات
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-mono border ${
                toast.type === "success" ? "bg-green-400/10 text-green-400 border-green-400/30"
                  : "bg-red-400/10 text-red-400 border-red-400/30"
              }`}
            >{toast.msg}</motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
