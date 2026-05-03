import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./app/App";
import { ToastProvider } from "./components/Toast";
import { applyStoredTweaks } from "./pages/m/TweaksPanel";
import "./styles/tokens.css";
import "./styles/index.css";
import "./i18n";
applyStoredTweaks();
const qc = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: qc, children: _jsx(ToastProvider, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }) }) }));
