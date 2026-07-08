"use client";

import { useEffect, useState } from "react";

type DesktopOnlyProps = {
  children: React.ReactNode;
  minWidth?: number;
};

export function DesktopOnly({ children, minWidth = 1024 }: DesktopOnlyProps) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);

    const sync = () => {
      setMatches(mediaQuery.matches);
    };

    sync();
    mediaQuery.addEventListener("change", sync);

    return () => {
      mediaQuery.removeEventListener("change", sync);
    };
  }, [minWidth]);

  if (!matches) {
    return null;
  }

  return <>{children}</>;
}
