import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const lines = [
  { text: "// مرحباً بك في ZERO", color: "text-muted-foreground", delay: 0 },
  { text: "const developer = {", color: "text-foreground", delay: 0.4 },
  { text: '  name: "ZERO",', color: "text-yellow-400", delay: 0.7 },
  { text: '  role: "Full Stack Dev",', color: "text-yellow-400", delay: 1.0 },
  { text: "  experience: 5+,", color: "text-orange-400", delay: 1.3 },
  { text: "  projects: 50+,", color: "text-orange-400", delay: 1.6 },
  { text: '  quality: "100%",', color: "text-green-400", delay: 1.9 },
  { text: "};", color: "text-foreground", delay: 2.2 },
  { text: "", color: "", delay: 2.4 },
  { text: "developer.build(yourDream);", color: "text-primary", delay: 2.6 },
  { text: "// ✓ project launched successfully", color: "text-green-400", delay: 3.0 },
];

export function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = lines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative">
      {/* Terminal window chrome */}
      <div className="bg-[#0d1117] border border-border rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="font-mono text-xs text-muted-foreground mr-3">zero.dev — terminal</span>
        </div>

        {/* Code content */}
        <div className="p-6 font-mono text-sm min-h-[280px]" dir="ltr">
          {lines.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`leading-7 ${line.color}`}
            >
              {line.text === "" ? <span>&nbsp;</span> : (
                <span>
                  <span className="text-muted-foreground/40 select-none ml-4 text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {" "}
                  {line.text}
                </span>
              )}
            </motion.div>
          ))}

          {/* Blinking cursor */}
          {visibleLines < lines.length && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 mt-1" />
          )}
          {visibleLines >= lines.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50"
            >
              <span className="text-primary text-xs">✓</span>
              <span className="text-green-400 text-xs">build completed in 0.42s</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl -z-10" />
    </div>
  );
}
