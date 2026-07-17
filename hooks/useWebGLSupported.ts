"use client";

import { useEffect, useState } from "react";

export function useWebGLSupported() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setSupported(Boolean(context));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
