import { useEffect, useState } from "react";

/** Resolves current breakpoint based on window width.
 *
 *   xl  ≥ 1440 — full sidebar (248px)
 *   lg  1280–1439 — full sidebar
 *   md  1024–1279 — icon rail (56px)
 *   sm  < 1024 — drawer (no sidebar; trigger in topbar)
 */
export type Breakpoint = "sm" | "md" | "lg" | "xl";

function resolve(width: number): Breakpoint {
  if (width >= 1440) return "xl";
  if (width >= 1280) return "lg";
  if (width >= 1024) return "md";
  return "sm";
}

export function useViewport(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window === "undefined" ? "lg" : resolve(window.innerWidth),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onResize() {
      setBp(resolve(window.innerWidth));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return bp;
}
