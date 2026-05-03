import React from "react";
import ReactDOM from "react-dom/client";
import { App, Providers } from "@app/index";
import { applyStoredTweaks } from "@widgets/tweaks-panel";
import "@shared/styles/tokens.css";
import "@shared/styles/index.css";
import "@shared/i18n";

applyStoredTweaks();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
);
