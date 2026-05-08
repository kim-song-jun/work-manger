import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Avatar, Card, Skeleton } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { fetchInbox } from "@entities/inbox";
import { InboxQuickActions } from "@features/inbox-decide";

export function ApprovalDetailPage() {
  const { t } = useTranslation();
  const { id = "" } = useParams<{ id: string }>();
  const q = useQuery({ queryKey: ["inbox"], queryFn: () => fetchInbox() });
  const item = q.data?.items.find((x) => x.id === id);

  return (
    <>
      <SubHeader title={t("mobile.inbox.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--grey-50)", padding: "12px 20px 24px" }}
      >
        {q.isLoading && <Skeleton height={120} />}
        {!q.isLoading && !item && (
          <Card padding={20}>
            <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
              {t("mobile.inbox.empty")}
            </div>
          </Card>
        )}
        {item && (
          <>
            <Card padding={20}>
              <div className="flex items-center gap-3">
                <Avatar name={item.requester?.name ?? item.requester_name ?? "?"} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold" style={{ color: "var(--grey-900)" }}>
                    {item.requester?.name ?? item.requester_name ?? "—"}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
                    {item.requester?.team ?? ""}
                  </div>
                </div>
              </div>
              <div
                className="text-[20px] font-bold mt-4"
                style={{ color: "var(--grey-900)", lineHeight: 1.3 }}
              >
                {item.title ?? item.target_type ?? ""}
              </div>
              {item.reason && (
                <div
                  className="text-[13px] mt-3"
                  style={{
                    background: "var(--grey-50)",
                    padding: 14,
                    borderRadius: "var(--r-md)",
                    color: "var(--grey-800)",
                  }}
                >
                  {item.reason}
                </div>
              )}
              {/* F-MANAGER-08: `item.role` not returned by BE; use status check only */}
              {item.status === "PENDING" && (
                <InboxQuickActions itemId={item.id} size="md" />
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
