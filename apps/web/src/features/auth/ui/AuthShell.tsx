import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main
      data-testid="auth-shell"
      className="min-h-screen w-full flex justify-center"
      style={{ background: "var(--grey-200)" }}
    >
      <section
        className="flex min-h-screen w-full flex-col"
        style={{
          maxWidth: 480,
          background: "var(--grey-50)",
          padding: "40px 24px 28px",
        }}
      >
        <div
          data-testid="auth-logo"
          aria-hidden="true"
          className="mb-8 flex items-center justify-center"
          style={{
            width: 52,
            height: 52,
            borderRadius: "var(--r-md)",
            background: "var(--brand)",
            color: "var(--white)",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 0,
            boxShadow: "0 12px 32px rgba(49,130,246,0.24)",
          }}
        >
          W
        </div>
        <h1
          className="mb-3 whitespace-pre-line text-[30px] font-bold leading-[1.18]"
          style={{ color: "var(--grey-900)" }}
        >
          {title}
        </h1>
        <p className="mb-8 text-[16px] leading-6" style={{ color: "var(--grey-600)" }}>
          {subtitle}
        </p>
        <div className="flex-1">{children}</div>
        {footer ? (
          <div className="mt-8 text-center text-[12px]" style={{ color: "var(--grey-500)" }}>
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}
