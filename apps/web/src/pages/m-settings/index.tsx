import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Icon, ListRow } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";

type Toggles = { clock: boolean; leave: boolean; overtime: boolean };

const STORAGE = "wm:notif";

function loadToggles(): Toggles {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return { clock: true, leave: true, overtime: true, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { clock: true, leave: true, overtime: true };
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? "var(--brand)" : "var(--grey-300)",
        border: "none",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: 10,
          background: "white",
          transition: "left var(--motion-fast) var(--ease-standard)",
        }}
      />
    </button>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [toggles, setToggles] = useState<Toggles>(loadToggles);

  function update(k: keyof Toggles) {
    const next = { ...toggles, [k]: !toggles[k] };
    setToggles(next);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const items: { key: keyof Toggles; label_key: string }[] = [
    { key: "clock", label_key: "mobile.settings.notif_clock" },
    { key: "leave", label_key: "mobile.settings.notif_leave" },
    { key: "overtime", label_key: "mobile.settings.notif_overtime" },
  ];

  return (
    <>
      <SubHeader title={t("mobile.settings.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <div className="text-[12px] font-bold mb-2" style={{ color: "var(--grey-500)" }}>
          {t("mobile.settings.notifications_section")}
        </div>
        <Card padding={0}>
          {items.map((row, i) => (
            <ListRow
              key={row.key}
              divider={i < items.length - 1}
              title={t(row.label_key)}
              trailing={
                <Toggle on={toggles[row.key]} onClick={() => update(row.key)} />
              }
            />
          ))}
        </Card>

        <div className="text-[12px] font-bold mt-5 mb-2" style={{ color: "var(--grey-500)" }}>
          {t("mobile.settings.appearance_section")}
        </div>
        <Card padding={0}>
          <ListRow
            title={t("my.customize")}
            leading={
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--r-md)",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                }}
              >
                <Icon.edit width={20} height={20} />
              </div>
            }
            onClick={() => nav("/m/customize")}
            divider={false}
          />
        </Card>
      </div>
    </>
  );
}
