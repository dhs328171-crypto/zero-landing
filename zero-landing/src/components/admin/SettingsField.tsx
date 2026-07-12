import { motion } from "framer-motion";
import { Save, CheckCircle } from "lucide-react";

export function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
      />
    </div>
  );
}

export function SettingsCard({
  id, icon: Icon, label, children, saved, onSave
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  saved: string | null;
  onSave: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Icon size={16} className="text-primary" />
        <h2 className="font-semibold text-sm">{label}</h2>
      </div>
      <div className="p-5">
        {children}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: saved === id ? 1 : 0, x: saved === id ? 0 : -10 }}
            className="flex items-center gap-1.5 text-green-400 text-xs font-mono"
          >
            <CheckCircle size={13} />
            تم الحفظ بنجاح!
          </motion.div>
          <button
            onClick={() => onSave(id)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-mono hover:bg-primary/90 transition-all"
          >
            <Save size={13} />
            حفظ التغييرات
          </button>
        </div>
      </div>
    </motion.div>
  );
}
