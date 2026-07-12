import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MessageSquare, Search, Star, Trash2, Eye, X, Reply, CheckCheck, Loader2 } from "lucide-react";
import { apiGet, apiPut, apiDelete, qs, type Paginated } from "@/lib/api";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  starred: boolean;
  createdAt: string;
}

function fmtDate(s: string) {
  try { return new Date(s).toISOString().slice(0, 10); } catch { return s; }
}

export default function AdminMessages() {
  const [items, setItems] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred">("all");
  const [selected, setSelected] = useState<Message | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = qs({
        page: 1,
        limit: 100,
        q: search,
        filter,
      });
      const res = await apiGet<Paginated<Message> & { unreadCount: number }>(`/messages${query}`);
      setItems(res.items);
      setTotal(res.total);
      setUnreadCount(res.unreadCount ?? 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(() => load(), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  const markRead = async (m: Message) => {
    if (m.read) return;
    try {
      await apiPut(`/messages/${m.id}/read`, { read: true });
      setItems((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleStar = async (m: Message) => {
    try {
      await apiPut(`/messages/${m.id}/star`, { starred: !m.starred });
      setItems((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, starred: !x.starred } : x))
      );
      if (selected?.id === m.id) {
        setSelected({ ...m, starred: !m.starred });
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteMsg = async (id: string) => {
    try {
      await apiDelete(`/messages/${id}`);
      toast.success("تم حذف الرسالة");
      setItems((prev) => prev.filter((m) => m.id !== id));
      setSelected(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const open = (m: Message) => {
    setSelected(m);
    markRead(m);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              الرسائل الواردة
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-mono px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">// {total} رسالة إجمالاً</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في الرسائل..."
                className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-2">
              {[
                { key: "all", label: "الكل" },
                { key: "unread", label: "غير مقروء" },
                { key: "starred", label: "مميز" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as typeof filter)}
                  className={`flex-1 text-xs py-1.5 rounded-lg border font-mono transition-all ${
                    filter === key
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin mr-2" /> جاري التحميل...
                </div>
              ) : items.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">لا توجد رسائل</div>
              ) : (
                <AnimatePresence>
                  {items.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => open(m)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selected?.id === m.id
                          ? "border-primary/50 bg-primary/5"
                          : !m.read
                          ? "border-primary/20 bg-card"
                          : "border-border bg-card/50"
                      } hover:border-primary/40`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {!m.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-0.5" />}
                          <span className="text-sm font-medium text-foreground truncate">{m.name}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStar(m); }}
                          className={m.starred ? "text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400"}
                        >
                          <Star size={13} fill={m.starred ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-xs text-foreground/80 truncate">{m.subject}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-mono text-muted-foreground/70">{m.email}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{fmtDate(m.createdAt)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Message detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex-1 bg-card border border-border rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{selected.subject}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-sm text-muted-foreground">{selected.name}</span>
                      <a href={`mailto:${selected.email}`} className="text-xs font-mono text-primary/80 hover:underline" dir="ltr">
                        {selected.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleStar(selected)}
                      className={selected.starred ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}
                    >
                      <Star size={16} fill={selected.starred ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => deleteMsg(selected.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                    <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
                    <CheckCheck size={13} className={selected.read ? "text-green-400" : "text-muted-foreground/40"} />
                    {selected.read ? "تم القراءة" : "جديد"} · {fmtDate(selected.createdAt)}
                  </div>
                  <div className="bg-background/50 rounded-xl p-5 text-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                    {selected.message}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-mono hover:bg-primary/90 glow-cyan transition-all"
                    >
                      <Reply size={15} /> رد على الرسالة
                    </a>
                    <button
                      onClick={() => deleteMsg(selected.id)}
                      className="flex items-center gap-2 border border-red-400/30 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 size={15} /> حذف
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 bg-card/30 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground"
              >
                <MessageSquare size={40} className="mb-3 opacity-30" />
                <p className="text-sm">اختر رسالة للعرض</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}
