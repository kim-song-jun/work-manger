import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { fetchInbox } from "@entities/inbox";
import { QuickDecide } from "@features/inbox-decide";

export function InboxQuickPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["inbox"], queryFn: () => fetchInbox() });
  // BE /v1/inbox returns approval tasks the caller is the approver of —
  // filter to PENDING for the quick-decide flow.
  const items = (q.data?.items ?? []).filter((i) => i.status === "PENDING" || i.role === "approve");
  const [idx, setIdx] = useState(0);
  const item = items[idx];

  return (
    <>
      <SubHeader
        title={t("mobile.inbox.quick_title")}
        action={
          item ? (
            <span className="text-[13px] font-bold num-tab" style={{ color: "var(--grey-500)" }}>
              {idx + 1} / {items.length}
            </span>
          ) : undefined
        }
      />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "20px", background: "var(--grey-100)" }}
      >
        {!item && (
          <Card padding={20}>
            <div className="text-[14px] text-center" style={{ color: "var(--grey-600)" }}>
              {t("mobile.inbox.empty")}
            </div>
          </Card>
        )}
        {item && (
          <QuickDecide
            item={item}
            onDone={() => {
              if (idx + 1 < items.length) setIdx(idx + 1);
              else nav("/m/inbox", { replace: true });
            }}
          />
        )}
      </div>
    </>
  );
}
