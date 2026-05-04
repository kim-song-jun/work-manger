import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, FormField, TextField, useToast } from "@shared/ui";
import { postOvertimeRequest, type OvertimeRequestBody } from "@entities/overtime";
import { overtimeSchema, type OvertimeFormValues } from "../model/schema";

type Props = {
  defaultDate?: string;
  onSubmitted?: () => void;
};

function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function OvertimeForm({ defaultDate, onSubmitted }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OvertimeFormValues>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: {
      work_date: defaultDate ?? todayISO(),
      requested_minutes: 60,
      reason: "",
    },
  });

  const m = useMutation({
    mutationFn: (body: OvertimeRequestBody) => postOvertimeRequest(body),
    onSuccess: () => {
      toast.show(t("mobile.overtime.submitted"), "success");
      onSubmitted?.();
    },
    onError: () => toast.show(t("mobile.overtime.failed"), "danger"),
  });

  return (
    <form
      onSubmit={handleSubmit((v) => m.mutate(v))}
      aria-label={t("mobile.overtime.title")}
    >
      <FormField
        label={t("mobile.overtime.work_date")}
        error={errors.work_date && t(`mobile.overtime.${errors.work_date.message}`)}
        required
      >
        <TextField type="date" {...register("work_date")} />
      </FormField>

      <FormField
        label={t("mobile.overtime.minutes")}
        hint={t("mobile.overtime.minutes_hint")}
        error={
          errors.requested_minutes &&
          t(`mobile.overtime.${errors.requested_minutes.message}`)
        }
        required
      >
        <TextField
          type="number"
          inputMode="numeric"
          min={1}
          max={720}
          {...register("requested_minutes", { valueAsNumber: true })}
        />
      </FormField>

      <FormField
        label={t("mobile.overtime.reason")}
        error={errors.reason && t(`mobile.overtime.${errors.reason.message}`)}
        required
      >
        <textarea
          {...register("reason")}
          placeholder={t("mobile.overtime.reason_placeholder")}
          className="block w-full rounded-md bg-ink-100 px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          style={{ minHeight: 96, resize: "none" }}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={isSubmitting || m.isPending}
      >
        {t("mobile.overtime.submit")}
      </Button>
    </form>
  );
}
