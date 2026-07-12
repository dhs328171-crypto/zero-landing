import { useState, useEffect } from "react";

interface TypingEffectProps {
  words: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}

export function TypingEffect({
  words,
  className = "",
  speed = 80,
  deleteSpeed = 40,
  pauseTime = 1800,
}: TypingEffectProps) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];

    if (isPaused) {
      const t = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(t);
    }

    if (isDeleting) {
      if (displayed.length === 0) {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
        return;
      }
      const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), deleteSpeed);
      return () => clearTimeout(t);
    }

    if (displayed === current) {
      setIsPaused(true);
      return;
    }

    const t = setTimeout(
      () => setDisplayed(current.slice(0, displayed.length + 1)),
      speed
    );
    return () => clearTimeout(t);
  }, [displayed, isDeleting, isPaused, wordIndex, words, speed, deleteSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
}
