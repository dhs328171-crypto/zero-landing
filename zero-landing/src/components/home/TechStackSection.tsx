import {
  SiReact, SiNodedotjs, SiTypescript, SiNextdotjs, SiTailwindcss,
  SiMongodb, SiPostgresql, SiGit, SiFirebase, SiDocker,
  SiVuedotjs, SiPython, SiGraphql, SiRedis, SiFigma
} from "react-icons/si";
import { Marquee } from "@/components/ui/marquee";
import { useT } from "@/contexts/i18n-context";

const techs = [
  { icon: <SiReact size={30} className="text-cyan-400" />, name: "React" },
  { icon: <SiNextdotjs size={30} className="text-white" />, name: "Next.js" },
  { icon: <SiTypescript size={30} className="text-blue-400" />, name: "TypeScript" },
  { icon: <SiNodedotjs size={30} className="text-green-400" />, name: "Node.js" },
  { icon: <SiTailwindcss size={30} className="text-cyan-300" />, name: "Tailwind" },
  { icon: <SiPostgresql size={30} className="text-blue-300" />, name: "PostgreSQL" },
  { icon: <SiMongodb size={30} className="text-green-500" />, name: "MongoDB" },
  { icon: <SiGit size={30} className="text-orange-400" />, name: "Git" },
  { icon: <SiFirebase size={30} className="text-yellow-400" />, name: "Firebase" },
  { icon: <SiDocker size={30} className="text-blue-500" />, name: "Docker" },
  { icon: <SiVuedotjs size={30} className="text-green-400" />, name: "Vue.js" },
  { icon: <SiPython size={30} className="text-yellow-300" />, name: "Python" },
  { icon: <SiGraphql size={30} className="text-pink-400" />, name: "GraphQL" },
  { icon: <SiRedis size={30} className="text-red-500" />, name: "Redis" },
  { icon: <SiFigma size={30} className="text-purple-400" />, name: "Figma" },
];

export function TechStackSection() {
  const t = useT();

  return (
    <section className="py-16 border-y border-border overflow-hidden">
      <div className="mb-4 text-center">
        <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">// {t("home.techStackTitle")}</span>
      </div>
      <Marquee speed={25} className="py-4">
        {techs.map((tch) => (
          <div key={tch.name} className="flex items-center gap-3 px-5 py-3 bg-card/50 border border-border rounded-xl mx-2 hover:border-primary/40 transition-colors group">
            <div className="group-hover:scale-110 transition-transform">{tch.icon}</div>
            <span className="font-mono text-sm text-muted-foreground">{tch.name}</span>
          </div>
        ))}
      </Marquee>
      <Marquee speed={20} reverse className="py-4 mt-2">
        {[...techs].reverse().map((tch) => (
          <div key={tch.name + "-r"} className="flex items-center gap-3 px-5 py-3 bg-card/30 border border-border/50 rounded-xl mx-2">
            <div>{tch.icon}</div>
            <span className="font-mono text-sm text-muted-foreground/60">{tch.name}</span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}