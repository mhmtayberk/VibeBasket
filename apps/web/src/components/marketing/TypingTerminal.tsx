"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type TypingTerminalLine = {
  text: string;
  className?: string;
};

type TypingTerminalProps = {
  lines: TypingTerminalLine[];
  className?: string;
  lineClassName?: string;
  trigger?: "mount" | "visible";
};

export function TypingTerminal({
  lines,
  className,
  lineClassName = "font-mono text-[11px] leading-6 text-muted-foreground",
  trigger = "mount",
}: TypingTerminalProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"idle" | "active" | "reduced">(
    trigger === "mount" ? "active" : "idle",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setState("reduced");
      return;
    }

    if (trigger === "mount") {
      setState("active");
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }

        setState("active");
        observer.disconnect();
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [trigger]);

  return (
    <div ref={ref} data-typing-state={state} className={className}>
      {lines.map((line, index) => {
        const durationMs = Math.max(700, Math.min(2600, line.text.length * 28));
        const delayMs = index * 520;

        return (
          <p key={`${line.text}-${index}`} className={line.className ?? lineClassName}>
            <span className="sr-only">{line.text}</span>
            <span
              aria-hidden="true"
              className="vb-typing-line"
              style={
                {
                  "--vb-typing-chars": line.text.length,
                  "--vb-typing-duration": `${durationMs}ms`,
                  "--vb-typing-delay": `${delayMs}ms`,
                } as CSSProperties
              }
            >
              {line.text}
            </span>
          </p>
        );
      })}
    </div>
  );
}
