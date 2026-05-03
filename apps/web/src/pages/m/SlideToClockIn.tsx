import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Icon } from "@/components";

type Props = {
  onCommit: () => void;
  disabled?: boolean;
  labelIn: string;
  labelOut: string;
  active: boolean; // true = clocked in (slide to clock out shows)
};

export function SlideToClockIn({ onCommit, disabled, labelIn, labelOut, active }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [pct, setPct] = useState(0);
  const [committing, setCommitting] = useState(false);

  // reset on disabled change
  useEffect(() => {
    if (disabled) setPct(0);
  }, [disabled]);

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || committing) return;
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const knobSize = 56;
    const max = rect.width - knobSize - 8;
    const startX = e.clientX;
    const startPct = pct;

    function move(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const next = Math.max(0, Math.min(1, startPct + dx / max));
      setPct(next);
    }
    function up() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      setPct((v) => {
        if (v > 0.88) {
          setCommitting(true);
          // give UI a tick before firing
          setTimeout(() => {
            try {
              onCommit();
            } finally {
              setCommitting(false);
            }
          }, 50);
        }
        return 0;
      });
    }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  const trackBg = active ? "var(--success-soft)" : "var(--brand-soft)";
  const knobBg = active ? "var(--success)" : "var(--brand)";
  const trackText = active ? "var(--success)" : "var(--brand)";

  // knob position: 4 + pct * (trackWidth - knobSize - 8). We use percent style.
  const knobLeftPct = pct * 100;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={active ? labelOut : labelIn}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
      aria-disabled={disabled || committing}
      style={{
        height: 64,
        borderRadius: 32,
        background: disabled ? "var(--grey-100)" : trackBg,
        position: "relative",
        padding: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <span
        style={{
          color: disabled ? "var(--grey-500)" : trackText,
          fontWeight: 700,
          opacity: 0.7,
          fontSize: 14,
          pointerEvents: "none",
        }}
      >
        {(active ? labelOut : labelIn) + "  →"}
      </span>
      <div
        onPointerDown={onDown}
        style={{
          position: "absolute",
          top: 4,
          // left = 4px + knobLeftPct% * (track width - knobSize - 8); CSS calc
          left: `calc(4px + (100% - 56px - 8px) * ${knobLeftPct / 100})`,
          width: 56,
          height: 56,
          borderRadius: 999,
          background: knobBg,
          color: "var(--white)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-2)",
          cursor: disabled ? "not-allowed" : "grab",
          touchAction: "none",
          transition: pct === 0 ? "left var(--motion-standard) var(--ease-standard)" : undefined,
        }}
      >
        <Icon.chevR width={24} height={24} />
      </div>
    </div>
  );
}
