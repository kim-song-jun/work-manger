import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, FormField, TextField, useToast } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TripPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(todayISO());
  const [place, setPlace] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onSubmit() {
    setSubmitting(true);
    // Backend stub: simulate success without an actual endpoint.
    window.setTimeout(() => {
      toast.show(t("mobile.trip.submitted"), "success");
      setSubmitting(false);
    }, 300);
  }

  return (
    <>
      <SubHeader title={t("mobile.trip.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <Card padding={16}>
          <div
            className="text-[12px] mb-3"
            style={{ color: "var(--grey-500)" }}
          >
            {t("mobile.trip.coming_soon")}
          </div>
          <FormField label={t("mobile.trip.starts_on")} required>
            <TextField type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </FormField>
          <FormField label={t("mobile.trip.ends_on")} required>
            <TextField type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </FormField>
          <FormField label={t("mobile.trip.place")} required>
            <TextField value={place} onChange={(e) => setPlace(e.target.value)} />
          </FormField>
          <FormField label={t("mobile.trip.purpose")}>
            <TextField value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </FormField>
          <Button
            type="button"
            fullWidth
            size="lg"
            onClick={onSubmit}
            disabled={!place || submitting}
          >
            {t("mobile.trip.submit")}
          </Button>
        </Card>
      </div>
    </>
  );
}
