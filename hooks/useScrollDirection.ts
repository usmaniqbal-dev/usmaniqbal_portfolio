"use client";

import { useEffect, useState } from "react";

export function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    function handleScroll() {
      const nextY = window.scrollY;
      setScrolled(nextY > 80);
      setHidden(nextY > lastY && nextY > 160);
      lastY = Math.max(0, nextY);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { hidden, scrolled };
}
