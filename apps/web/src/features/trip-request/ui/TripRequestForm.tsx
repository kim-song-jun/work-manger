import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Button,
  FormField,
  SegmentedControl,
  TextField,
  useToast,
} from "@shared/ui";
import { createTrip, type TripKind } from "@entities/trip";

import { tripRequestSchema, type TripRequestValues } from "../model/schema";

type Props = {
  onDone?: () => void;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TripRequestForm({ onDone }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const today = todayISO();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TripRequestValues>({
    resolver: zodResolver(tripRequestSchema),
    defaultValues: {
      kind: "BUSINESS_TRIP",
      start_date: today,
      end_date: today,
      location_label: "",
      purpose: "",
    },
  });

  const m = useMutation({
    mutationFn: (v: TripRequestValues) =>
      createTrip({
        kind: v.kind as TripKind,
        start_date: v.start_date,
        end_date: v.end_date,
        location_label: v.location_label,
        purpose: v.purpose,
      }),
    onSuccess: () => {
      toast.show(t("trip.submitted"), "success");
      qc.invalidateQueries({ queryKey: ["trips"] });
      onDone?.();
    },
    onError: () => toast.show(t("trip.failed"), "danger"),
  });

  function resolveError(key?: string): string | undefined {
    if (!key) return undefined;
    return t(key, { defaultValue: key });
  }

  return (
    <form
      onSubmit={handleSubmit((v) => m.mutate(v))}
      aria-label={t("trip.title")}
    >
      <FormField label={t("trip.kind")} required>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onChange={(v) => field.onChange(v as TripKind)}
              options={[
                { value: "BUSINESS_TRIP", label: t("trip.kind_business") },
                { value: "FIELD_WORK", label: t("trip.kind_field") },
              ]}
            />
          )}
        />
      </FormField>

      <FormField
        label={t("trip.starts_on")}
        required
        error={resolveError(errors.start_date?.message)}
      >
        <TextField type="date" {...register("start_date")} />
      </FormField>

      <FormField
        label={t("trip.ends_on")}
        required
        error={resolveError(errors.end_date?.message)}
      >
        <TextField type="date" {...register("end_date")} />
      </FormField>

      <FormField
        label={t("trip.place")}
        required
        error={resolveError(errors.location_label?.message)}
      >
        <TextField {...register("location_label")} />
      </FormField>

      <FormField
        label={t("trip.purpose")}
        error={resolveError(errors.purpose?.message)}
      >
        <TextField {...register("purpose")} />
      </FormField>

      <Button type="submit" fullWidth size="lg" disabled={isSubmitting || m.isPending}>
        {t("trip.submit")}
      </Button>
    </form>
  );
}
