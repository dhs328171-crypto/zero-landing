import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const boundElements = useRef<Element[]>([]);

  useEffect(() => {
    // Detect touch device — skip custom cursor
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    const bindHover = () => {
      const els = document.querySelectorAll("a, button, [data-hover]");
      els.forEach((el) => {
        if (boundElements.current.includes(el)) return;
        const onEnter = () => setHovering(true);
        const onLeave = () => setHovering(false);
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        boundElements.current.push(el);
      });
    };
    bindHover();
    const obs = new MutationObserver(bindHover);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      obs.disconnect();
      boundElements.current = [];
    };
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setTrail((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.12,
        y: prev.y + (pos.y - prev.y) * 0.12,
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pos]);

  return (
    <>
      {/* Trail */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-primary/40"
        style={{
          x: trail.x - (hovering ? 20 : 14),
          y: trail.y - (hovering ? 20 : 14),
          width: hovering ? 40 : 28,
          height: hovering ? 40 : 28,
          transition: "width 0.2s, height 0.2s",
        }}
      />
      {/* Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] w-2 h-2 rounded-full bg-primary"
        style={{
          transform: `translate(${pos.x - 4}px, ${pos.y - 4}px)`,
          scale: clicking ? "0.5" : "1",
          transition: "scale 0.1s",
        }}
      />
    </>
  );
}