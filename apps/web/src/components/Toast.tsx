import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; tone?: "default" | "success" | "danger" };
type Ctx = { show: (msg: string, tone?: Toast["tone"]) => void };

const ToastCtx = createContext<Ctx>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const show = useCallback((message: string, tone?: Toast["tone"]) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-[100] flex flex-col items-center gap-2"
        style={{ bottom: 24 }}
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="wm-anim-fade px-4 py-3 text-[14px] shadow-3"
            style={{
              background:
                t.tone === "danger"
                  ? "var(--danger)"
                  : t.tone === "success"
                    ? "var(--success)"
                    : "var(--grey-900)",
              color: "#fff",
              borderRadius: "var(--r-md)",
              maxWidth: 320,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
