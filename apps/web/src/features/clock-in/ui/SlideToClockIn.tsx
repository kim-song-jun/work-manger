import { useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { Icon } from "@shared/ui";

type Props = {
  onCommit: () => void;
  disabled?: boolean;
  labelIn: string;
  labelOut: string;
  active: boolean; // true = clocked in (slide to clock out shows)
};

export function SlideToClockIn({ onCommit, disabled, labelIn, labelOut, active }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pctRef = useRef(0);
  const pointerStartedAtRef = useRef(0);
  const [pct, setPct] = useState(0);
  const [committing, setCommitting] = useState(false);

  // reset on disabled change
  useEffect(() => {
    if (disabled) {
      pctRef.current = 0;
      setPct(0);
    }
  }, [disabled]);

  function resetPct(): void {
    pctRef.current = 0;
    setPct(0);
  }

  function commit(): void {
    setCommitting(true);
    setTimeout(() => {
      try {
        onCommit();
      } finally {
        setCommitting(false);
        resetPct();
      }
    }, 50);
  }

  function startDrag(
    startClientX: number,
    moveEvent: "pointermove" | "mousemove",
    upEvent: "pointerup" | "mouseup",
  ): void {
    if (disabled || committing) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const knobSize = 56;
    const max = rect.width - knobSize - 8;
    const startX = startClientX;
    const startPct = pct;

    function updateFromClientX(clientX: number) {
      const dx = clientX - startX;
      const next = Math.max(0, Math.min(1, startPct + dx / max));
      pctRef.current = next;
      setPct(next);
    }
    function move(ev: PointerEvent | MouseEvent) {
      updateFromClientX(ev.clientX);
    }
    function up(ev: PointerEvent | MouseEvent) {
      document.removeEventListener(moveEvent, move);
      document.removeEventListener(upEvent, up);
      updateFromClientX(ev.clientX);
      if (pctRef.current > 0.88) commit();
      else resetPct();
    }
    document.addEventListener(moveEvent, move);
    document.addEventListener(upEvent, up);
  }

  function onDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.preventDefault();
    pointerStartedAtRef.current = Date.now();
    startDrag(e.clientX, "pointermove", "pointerup");
  }

  function onMouseDown(e: ReactMouseEvent<HTMLDivElement>) {
    if (Date.now() - pointerStartedAtRef.current < 500) return;
    e.preventDefault();
    startDrag(e.clientX, "mousemove", "mouseup");
  }

  // Keyboard fallback: Enter/Space completes the slide programmatically.
  // Without this, screen-reader / keyboard-only users have no way to
  // confirm clock-in/out (pointer drag is mouse/touch-only).
  function onKeyDown(e: ReactKeyboardEvent<HTMLDivElement>): void {
    if (disabled || committing) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    setPct(1);
    pctRef.current = 1;
    commit();
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
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onDown}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
