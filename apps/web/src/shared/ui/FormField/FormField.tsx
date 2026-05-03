import type { ReactNode } from "react";

type Props = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
};

export function FormField({ label, hint, error, required, children }: Props) {
  return (
    <div className="mb-4">
      {label && (
        <label className="flex items-center gap-1 mb-1.5 text-[13px] font-semibold text-ink-600">
          {label}
          {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <div className="mt-1.5 text-[13px]" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : hint ? (
        <div className="mt-1.5 text-[13px] text-ink-500">{hint}</div>
      ) : null}
    </div>
  );
}
