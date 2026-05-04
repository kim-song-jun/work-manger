import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, SegmentedControl } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { useTweaksStore, applyTweaksToBody } from "@shared/lib/store/useTweaksStore";

const BRAND_SWATCH: { v: "blue" | "mint" | "violet" | "coral"; color: string }[] = [
  { v: "blue", color: "#3182F6" },
  { v: "mint", color: "#00B894" },
  { v: "violet", color: "#7C5CFF" },
  { v: "coral", color: "#FF5A5F" },
];

export function CustomizePage() {
  const { t, i18n } = useTranslation();
  const tw = useTweaksStore();

  useEffect(() => {
    applyTweaksToBody({ theme: tw.theme, brand: tw.brand, font: tw.font });
    if (i18n.language !== tw.lang) {
      i18n.changeLanguage(tw.lang);
      try {
        localStorage.setItem("wm:lang", tw.lang);
      } catch {
        /* ignore */
      }
    }
  }, [tw.theme, tw.brand, tw.font, tw.lang, i18n]);

  return (
    <>
      <SubHeader title={t("mobile.customize.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <Card padding={16}>
          <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--grey-700)" }}>
            {t("mobile.customize.theme")}
          </div>
          <SegmentedControl
            value={tw.theme}
            onChange={(v) => tw.set("theme", v)}
            options={[
              { value: "light", label: t("mobile.customize.theme_light") },
              { value: "dark", label: t("mobile.customize.theme_dark") },
            ]}
          />
        </Card>

        <Card padding={16} style={{ marginTop: 12 }}>
          <div className="text-[13px] font-semibold mb-3" style={{ color: "var(--grey-700)" }}>
            {t("mobile.customize.brand")}
          </div>
          <div className="flex gap-2">
            {BRAND_SWATCH.map((b) => (
              <button
                key={b.v}
                type="button"
                aria-label={b.v}
                aria-pressed={tw.brand === b.v}
                onClick={() => tw.set("brand", b.v)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  background: b.color,
                  border: tw.brand === b.v ? "3px solid var(--grey-900)" : "3px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </Card>

        <Card padding={16} style={{ marginTop: 12 }}>
          <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--grey-700)" }}>
            {t("mobile.customize.font_size")}
          </div>
          <SegmentedControl
            value={tw.font}
            onChange={(v) => tw.set("font", v)}
            options={[
              { value: "sm", label: t("mobile.customize.font_sm") },
              { value: "md", label: t("mobile.customize.font_md") },
              { value: "lg", label: t("mobile.customize.font_lg") },
            ]}
          />
        </Card>

        <Card padding={16} style={{ marginTop: 12 }}>
          <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--grey-700)" }}>
            {t("mobile.customize.language")}
          </div>
          <SegmentedControl
            value={tw.lang}
            onChange={(v) => tw.set("lang", v)}
            options={[
              { value: "ko", label: t("common.lang_ko") },
              { value: "en", label: t("common.lang_en") },
            ]}
          />
        </Card>

        <button
          type="button"
          onClick={() => tw.reset()}
          className="text-[13px] font-bold mt-4"
          style={{
            background: "transparent",
            color: "var(--brand)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t("mobile.customize.reset")}
        </button>
      </div>
    </>
  );
}
