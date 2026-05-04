import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useViewport } from "../model/useViewport";

export function WebShell() {
  const bp = useViewport();
  const [drawer, setDrawer] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        background: "var(--grey-50)",
        overflow: "hidden",
      }}
    >
      {bp !== "sm" && <Sidebar bp={bp} />}

      {bp === "sm" && drawer && (
        <div
          role="dialog"
          aria-label="navigation drawer"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.4)",
          }}
          onClick={() => setDrawer(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ height: "100%", width: 248 }}>
            <Sidebar bp="lg" onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <TopBar bp={bp} onMenu={() => setDrawer(true)} />
        <main
          id="main"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: bp === "sm" ? 16 : 24,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
