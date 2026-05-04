import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  height?: number | string;
};

const FOCUSABLE_SEL =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, onClose, title, children, height }: Props) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Focus trap + Escape + restore focus on close. Implements WAI-ARIA dialog
  // pattern. Cycle Tab inside the sheet so keyboard users can't accidentally
  // tab back into the obscured background.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;

    // Move focus into the sheet on open.
    queueMicrotask(() => {
      const sheet = sheetRef.current;
      if (!sheet) return;
      const focusables = sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SEL);
      const first = focusables[0] ?? sheet;
      first.focus({ preventScroll: true });
    });

    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const sheet = sheetRef.current;
      if (!sheet) return;
      const items = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE_SEL));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Restore focus to the trigger element when the sheet closes.
      const prev = previouslyFocused.current;
      if (prev && typeof prev.focus === "function") {
        prev.focus({ preventScroll: true });
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className="wm-anim-sheet w-full"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          borderTopLeftRadius: "var(--r-lg)",
          borderTopRightRadius: "var(--r-lg)",
          padding: "10px 20px 20px",
          height,
          maxHeight: "85%",
          overflow: "auto",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "var(--grey-300)",
            margin: "0 auto 14px",
          }}
        />
        {title && (
          <div className="text-[16px] font-semibold mb-3" style={{ color: "var(--grey-900)" }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
