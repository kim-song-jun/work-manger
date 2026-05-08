import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Button, Card, Sheet, Skeleton } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { fetchTrips, type Trip, type TripStatus } from "@entities/trip";
import { TripRequestForm } from "@features/trip-request";

const STATUS_COLOR: Record<TripStatus, string> = {
  PENDING: "var(--warn, #FFB020)",
  APPROVED: "var(--ok, #21C07B)",
  REJECTED: "var(--danger, #FF5A5F)",
  CANCELLED: "var(--grey-500)",
};

export function TripPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const q = useQuery({ queryKey: ["trips"], queryFn: () => fetchTrips() });
  const trips: Trip[] = q.data ?? [];

  return (
    <>
      <SubHeader title={t("trip.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={() => setOpen(true)}
          aria-label={t("trip.new")}
        >
          {t("trip.new")}
        </Button>

        <div
          className="text-[12px] font-bold mt-4 mb-2"
          style={{ color: "var(--grey-500)" }}
        >
          {t("trip.my_requests")}
        </div>

        {q.isLoading && (
          <Card padding={16}>
            <Skeleton height={14} width="60%" />
            <div className="mt-2">
              <Skeleton height={14} width="40%" />
            </div>
          </Card>
        )}

        {!q.isLoading && trips.length === 0 && (
          <Card padding={20}>
            <div
              className="text-[14px] text-center"
              style={{ color: "var(--grey-600)" }}
            >
              {t("trip.empty")}
            </div>
          </Card>
        )}

        {trips.map((trip) => (
          <Card key={trip.id} padding={14} style={{ marginBottom: 8 }}>
            <div className="flex items-center justify-between">
              <span
                className="text-[12px] font-bold"
                style={{ color: "var(--grey-700)" }}
              >
                {t(
                  trip.kind === "BUSINESS_TRIP"
                    ? "trip.kind_business"
                    : "trip.kind_field",
                )}
              </span>
              <span
                className="text-[12px] font-bold"
                style={{ color: STATUS_COLOR[trip.status] }}
              >
                {t(`trip.status.${trip.status.toLowerCase()}`)}
              </span>
            </div>
            <div
              className="text-[14px] font-bold mt-1"
              style={{ color: "var(--grey-900)" }}
            >
              {trip.location_label}
            </div>
            <div
              className="text-[12px] mt-1"
              style={{ color: "var(--grey-500)" }}
            >
              {trip.start_date} ~ {trip.end_date}
            </div>
            {trip.purpose && (
              <div
                className="text-[13px] mt-2"
                style={{ color: "var(--grey-700)" }}
              >
                {trip.purpose}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={t("trip.title")}>
        <TripRequestForm onDone={() => setOpen(false)} />
      </Sheet>
    </>
  );
}
