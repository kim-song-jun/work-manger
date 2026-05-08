import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, Icon, Sheet } from "@shared/ui";

type Loc = "office" | "home" | "outside";

export function LocPickerPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [pick, setPick] = useState<Loc>("office");

  const opts: { k: Loc; label_key: string; icon: typeof Icon.building; color: string }[] = [
    { k: "office", label_key: "mobile.loc_picker.office", icon: Icon.building, color: "var(--success, #00B894)" },
    { k: "home", label_key: "mobile.loc_picker.home", icon: Icon.house, color: "var(--brand)" },
    { k: "outside", label_key: "mobile.loc_picker.outside", icon: Icon.map, color: "var(--warn, #E59700)" },
  ];

  return (
    <Sheet open onClose={() => nav(-1)} title={t("mobile.loc_picker.title")}>
      <div className="text-[13px] mb-4" style={{ color: "var(--grey-500)" }}>
        {t("mobile.loc_picker.sub")}
      </div>
      {opts.map((o) => {
        const Ic = o.icon;
        const active = pick === o.k;
        return (
          <button
            key={o.k}
            type="button"
            onClick={() => setPick(o.k)}
            className="w-full flex items-center gap-3 text-left"
            style={{
              padding: 16,
              marginBottom: 8,
              background: active ? "var(--brand-soft)" : "var(--white)",
              border: `1.5px solid ${active ? "var(--brand)" : "var(--grey-200)"}`,
              borderRadius: "var(--r-md)",
              cursor: "pointer",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-sm)",
                background: o.color + "22",
                color: o.color,
              }}
            >
              <Ic width={20} height={20} />
            </div>
            <span className="flex-1 text-[14px] font-bold" style={{ color: "var(--grey-900)" }}>
              {t(o.label_key)}
            </span>
            {active && (
              <span
                className="flex items-center justify-center"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: "var(--brand)",
                  color: "#fff",
                }}
              >
                <Icon.check width={14} height={14} />
              </span>
            )}
          </button>
        );
      })}
      <Button
        type="button"
        fullWidth
        size="lg"
        onClick={() => nav(-1)}
        style={{ marginTop: 8 }}
      >
        {t("mobile.loc_picker.confirm")}
      </Button>
    </Sheet>
  );
}
