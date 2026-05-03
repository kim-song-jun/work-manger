import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  height?: number | string;
};

export function Sheet({ open, onClose, title, children, height }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
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
