import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, SegmentedControl, Sheet } from "@shared/ui";
import {
  applyTweaks,
  defaultTweaks,
  loadTweaks,
  STORAGE_KEY,
  type Tweaks,
} from "../model/applyStoredTweaks";

export function TweaksFab() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tw, setTw] = useState<Tweaks>(() => loadTweaks());

  useEffect(() => {
    applyTweaks(tw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tw));
    if (i18n.language !== tw.lang) {
      i18n.changeLanguage(tw.lang);
      localStorage.setItem("wm:lang", tw.lang);
    }
  }, [tw, i18n]);

  return (
    <>
      <button
        type="button"
        aria-label={t("home.open_tweaks")}
        onClick={() => setOpen(true)}
        className="absolute z-40 flex items-center justify-center"
        style={{
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
        }}
      >
        <Icon.settings width={20} height={20} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={t("tweaks.title")}>
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-[13px] font-semibold mb-2 text-ink-700">
              {t("tweaks.theme")}
            </div>
            <SegmentedControl
              value={tw.theme}
              onChange={(v) => setTw({ ...tw, theme: v })}
              options={[
                { value: "light", label: t("tweaks.theme_light") },
                { value: "dark", label: t("tweaks.theme_dark") },
              ]}
            />
          </div>
          <div>
            <div className="text-[13px] font-semibold mb-2 text-ink-700">
              {t("tweaks.brand")}
            </div>
            <div className="flex gap-2">
              {(
                [
                  ["blue", "#3182F6"],
                  ["mint", "#00B894"],
                  ["violet", "#7C5CFF"],
                  ["coral", "#FF5A5F"],
                ] as const
              ).map(([k, color]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTw({ ...tw, brand: k })}
                  aria-label={k}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: color,
                    border: tw.brand === k ? "3px solid var(--grey-900)" : "3px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[13px] font-semibold mb-2 text-ink-700">
              {t("tweaks.font_size")}
            </div>
            <SegmentedControl
              value={tw.fontSize}
              onChange={(v) => setTw({ ...tw, fontSize: v })}
              options={[
                { value: "sm", label: t("tweaks.font_sm") },
                { value: "md", label: t("tweaks.font_md") },
                { value: "lg", label: t("tweaks.font_lg") },
              ]}
            />
          </div>
          <div>
            <div className="text-[13px] font-semibold mb-2 text-ink-700">
              {t("tweaks.language")}
            </div>
            <SegmentedControl
              value={tw.lang}
              onChange={(v) => setTw({ ...tw, lang: v })}
              options={[
                { value: "ko", label: "한국어" },
                { value: "en", label: "English" },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={() => setTw(defaultTweaks)}
            className="self-start text-[13px] font-semibold mt-2"
            style={{ color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}
          >
            {t("tweaks.reset")}
          </button>
        </div>
      </Sheet>
    </>
  );
}
