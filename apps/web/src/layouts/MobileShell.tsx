import { Outlet } from "react-router-dom";
import { TabBar } from "@/components";

type Props = {
  showTabBar?: boolean;
};

export function MobileShell({ showTabBar = true }: Props) {
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
          boxShadow: "var(--shadow-3)",
        }}
      >
        <main className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </main>
        {showTabBar && <TabBar />}
      </div>
    </div>
  );
}
