import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";

import { App, Providers } from "@app/index";
import { applyStoredTweaks } from "@widgets/tweaks-panel";

import "@shared/styles/tokens.css";
import "@shared/styles/index.css";
import "@shared/i18n";

// ── Sentry (FE) ─────────────────────────────────────────────────────────────
// VITE_SENTRY_DSN 미설정 시 init 을 건너뜀 → 로컬 / CI / e2e 에 무영향.
// stg / prod 빌드는 .env.production 또는 컨테이너 env 로 주입.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}

applyStoredTweaks();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
