import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Icon } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";

const FAQ_KEYS: { q: string; a: string }[] = [
  { q: "mobile.help.faq_q1", a: "mobile.help.faq_a1" },
  { q: "mobile.help.faq_q2", a: "mobile.help.faq_a2" },
  { q: "mobile.help.faq_q3", a: "mobile.help.faq_a3" },
];

export function HelpPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <SubHeader title={t("mobile.help.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        {FAQ_KEYS.map((it, i) => {
          const isOpen = open === i;
          return (
            <Card key={it.q} padding={0} style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-2 text-left"
                style={{
                  padding: 16,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span
                  className="flex-1 text-[14px] font-bold"
                  style={{ color: "var(--grey-900)" }}
                >
                  {t(it.q)}
                </span>
                <Icon.chevD
                  width={16}
                  height={16}
                  style={{
                    color: "var(--grey-500)",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform var(--motion-fast) var(--ease-standard)",
                  }}
                />
              </button>
              {isOpen && (
                <div
                  className="text-[13px]"
                  style={{
                    padding: "0 16px 16px",
                    color: "var(--grey-700)",
                    lineHeight: 1.6,
                  }}
                >
                  {t(it.a)}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
