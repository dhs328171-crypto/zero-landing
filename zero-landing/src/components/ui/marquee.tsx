import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}

export function Marquee({ children, speed = 30, reverse = false, className = "" }: MarqueeProps) {
  return (
    <div className={`overflow-hidden flex ${className}`}>
      <div
        className="flex gap-8 items-center whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite ${reverse ? "reverse" : "normal"}`,
        }}
      >
        {children}
        {children}
        {children}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
