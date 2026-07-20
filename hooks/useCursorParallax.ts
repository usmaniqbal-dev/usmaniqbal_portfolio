"use client";

import { useEffect, useRef } from "react";

export function useCursorParallax(enabled = true) {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function updatePointer(event: PointerEvent) {
      if (event.pointerType === "touch") {
        return;
      }

      target.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    window.addEventListener("pointermove", updatePointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePointer);
    };
  }, [enabled]);

  return target;
}
