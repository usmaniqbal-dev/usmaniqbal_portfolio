"use client";

import { useEffect, useRef } from "react";

export function useCursorParallax(enabled = true) {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function updatePointer(event: PointerEvent) {
      target.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    }

    function updateDeviceTilt(event: DeviceOrientationEvent) {
      if (!event.gamma && !event.beta) {
        return;
      }

      target.current.x = Math.max(-1, Math.min(1, (event.gamma || 0) / 35));
      target.current.y = Math.max(-1, Math.min(1, ((event.beta || 45) - 45) / 35));
    }

    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("deviceorientation", updateDeviceTilt, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("deviceorientation", updateDeviceTilt);
    };
  }, [enabled]);

  return target;
}
