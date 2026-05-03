import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@shared/ui";
import { OnbProgress } from "./OnbProgress";

type Props = {
  step?: number;
  total?: number;
  children: ReactNode;
  back?: boolean;
};

export function OnbShell({ step, total = 6, children, back = true }: Props) {
  const nav = useNavigate();
  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ background: "var(--grey-200)" }}
    >
      <div
        className="relative flex flex-col w-full"
        style={{
          maxWidth: 480,
          minHeight: "100vh",
          background: "var(--grey-50)",
        }}
      >
        {step !== undefined && <OnbProgress step={step} total={total} />}
        {back && (
          <div className="px-5 pt-3">
            <button
              type="button"
              onClick={() => nav(-1)}
              aria-label="back"
              style={{
                background: "transparent",
                border: "none",
                padding: 6,
                cursor: "pointer",
                color: "var(--grey-700)",
              }}
            >
              <Icon.chevL width={22} height={22} />
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col" style={{ padding: "8px 24px 24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
