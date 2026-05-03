import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, SegmentedControl, Sheet } from "@/components";
const STORAGE_KEY = "wm:tweaks";
const defaults = { theme: "light", brand: "blue", fontSize: "md", lang: "ko" };
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return defaults;
        return { ...defaults, ...JSON.parse(raw) };
    }
    catch {
        return defaults;
    }
}
function applyTweaks(tw) {
    const body = document.body;
    body.classList.remove("theme-dark", "theme-mint", "theme-violet", "theme-coral", "font-sm", "font-md", "font-lg");
    if (tw.theme === "dark")
        body.classList.add("theme-dark");
    if (tw.brand === "mint")
        body.classList.add("theme-mint");
    if (tw.brand === "violet")
        body.classList.add("theme-violet");
    if (tw.brand === "coral")
        body.classList.add("theme-coral");
    body.classList.add(`font-${tw.fontSize}`);
}
export function applyStoredTweaks() {
    applyTweaks(load());
}
export function TweaksFab() {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [tw, setTw] = useState(() => load());
    useEffect(() => {
        applyTweaks(tw);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tw));
        if (i18n.language !== tw.lang) {
            i18n.changeLanguage(tw.lang);
            localStorage.setItem("wm:lang", tw.lang);
        }
    }, [tw, i18n]);
    return (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", "aria-label": t("home.open_tweaks"), onClick: () => setOpen(true), className: "absolute z-40 flex items-center justify-center", style: {
                    right: 16,
                    bottom: 80,
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--grey-900)",
                    color: "#fff",
                    border: "none",
                    boxShadow: "var(--shadow-3)",
                    cursor: "pointer",
                }, children: _jsx(Icon.settings, { width: 20, height: 20 }) }), _jsx(Sheet, { open: open, onClose: () => setOpen(false), title: t("tweaks.title"), children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[13px] font-semibold mb-2 text-ink-700", children: t("tweaks.theme") }), _jsx(SegmentedControl, { value: tw.theme, onChange: (v) => setTw({ ...tw, theme: v }), options: [
                                        { value: "light", label: t("tweaks.theme_light") },
                                        { value: "dark", label: t("tweaks.theme_dark") },
                                    ] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[13px] font-semibold mb-2 text-ink-700", children: t("tweaks.brand") }), _jsx("div", { className: "flex gap-2", children: [
                                        ["blue", "#3182F6"],
                                        ["mint", "#00B894"],
                                        ["violet", "#7C5CFF"],
                                        ["coral", "#FF5A5F"],
                                    ].map(([k, color]) => (_jsx("button", { type: "button", onClick: () => setTw({ ...tw, brand: k }), "aria-label": k, style: {
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            background: color,
                                            border: tw.brand === k ? "3px solid var(--grey-900)" : "3px solid transparent",
                                            cursor: "pointer",
                                        } }, k))) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[13px] font-semibold mb-2 text-ink-700", children: t("tweaks.font_size") }), _jsx(SegmentedControl, { value: tw.fontSize, onChange: (v) => setTw({ ...tw, fontSize: v }), options: [
                                        { value: "sm", label: t("tweaks.font_sm") },
                                        { value: "md", label: t("tweaks.font_md") },
                                        { value: "lg", label: t("tweaks.font_lg") },
                                    ] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-[13px] font-semibold mb-2 text-ink-700", children: t("tweaks.language") }), _jsx(SegmentedControl, { value: tw.lang, onChange: (v) => setTw({ ...tw, lang: v }), options: [
                                        { value: "ko", label: "한국어" },
                                        { value: "en", label: "English" },
                                    ] })] }), _jsx("button", { type: "button", onClick: () => setTw(defaults), className: "self-start text-[13px] font-semibold mt-2", style: { color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }, children: t("tweaks.reset") })] }) })] }));
}
