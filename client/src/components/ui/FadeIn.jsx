"use client";

import { useEffect, useRef, useState } from "react";

export default function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up", // 'up' | 'down' | 'left' | 'right' | 'none'
  duration = 600,
  threshold = 0.12,
  once = true,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(node);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  const getTransformState = () => {
    if (isVisible) return "opacity-100 translate-x-0 translate-y-0 scale-100";
    switch (direction) {
      case "up":
        return "opacity-0 translate-y-10 scale-[0.98]";
      case "down":
        return "opacity-0 -translate-y-10 scale-[0.98]";
      case "left":
        return "opacity-0 translate-x-10 scale-[0.98]";
      case "right":
        return "opacity-0 -translate-x-10 scale-[0.98]";
      case "none":
      default:
        return "opacity-0 scale-[0.97]";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${getTransformState()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
