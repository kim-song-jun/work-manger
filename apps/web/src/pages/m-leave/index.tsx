import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, KPIStat, PageHeader, Skeleton } from "@shared/ui";
import { fetchBalance } from "@entities/leave";

export function LeavePage() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ["leave-balance"], queryFn: () => fetchBalance() });

  return (
    <>
      <PageHeader title={t("leave.title")} />
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 24px" }}>
        {q.isLoading && (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} padding={16}>
                <Skeleton height={14} width="50%" />
                <div className="mt-2">
                  <Skeleton height={28} width="60%" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!q.isLoading && q.data && (
          <div className="grid grid-cols-2 gap-2">
            <Card padding={16}>
              <KPIStat
                label={t("leave.balance")}
                value={q.data.remaining}
                unit={t("leave.days_unit")}
                size="lg"
              />
            </Card>
            <Card padding={16}>
              <KPIStat label={t("leave.used")} value={q.data.used} unit={t("leave.days_unit")} />
            </Card>
            <Card padding={16}>
              <KPIStat
                label={t("leave.accrued")}
                value={q.data.accrued}
                unit={t("leave.days_unit")}
              />
            </Card>
            <Card padding={16}>
              <KPIStat
                label={t("leave.expiring")}
                value={q.data.expiring}
                unit={t("leave.days_unit")}
                color="var(--warn)"
              />
            </Card>
          </div>
        )}

        {!q.isLoading && !q.data && (
          <Card padding={20}>
            <div
              className="text-[14px] text-center"
              style={{ color: "var(--grey-600)" }}
            >
              {t("leave.none_yet")}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
