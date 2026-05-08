import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Button,
  Card,
  FormField,
  SegmentedControl,
  TextField,
  useToast,
} from "@shared/ui";
import { applyLeave, fetchBalance, leaveDays } from "@entities/leave";
import type { LeaveKind } from "@entities/leave";

import { leaveApplySchema, type LeaveApplyValues } from "../model/schema";

type Props = {
  /** F-EMPLOYEE-006: receives the submitted kind so the success page can display it */
  onDone?: (kind: string) => void;
  defaultDate?: string;
  defaultEndDate?: string;
};

export function LeaveApplyForm({ onDone, defaultDate, defaultEndDate }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const today = defaultDate ?? new Date().toISOString().slice(0, 10);
  const balanceQ = useQuery({
    queryKey: ["leave", "balance"],
    queryFn: () => fetchBalance(),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeaveApplyValues>({
    resolver: zodResolver(leaveApplySchema),
    defaultValues: {
      start_date: today,
      end_date: defaultEndDate ?? today,
      kind: "FULL",
      reason: "",
    },
  });

  // B5 wiring — when the calendar (page-local state) emits new picked
  // dates via defaultDate/defaultEndDate, sync them into RHF so the
  // submitted body reflects the user's calendar selection.
  useEffect(() => {
    if (defaultDate) setValue("start_date", defaultDate, { shouldValidate: true });
  }, [defaultDate, setValue]);
  useEffect(() => {
    if (defaultEndDate) setValue("end_date", defaultEndDate, { shouldValidate: true });
  }, [defaultEndDate, setValue]);

  const values = watch();
  const days = leaveDays({
    kind: values.kind as LeaveKind,
    start_date: values.start_date,
    end_date: values.end_date,
  });
  const remaining = balanceQ.data?.remaining ?? 0;
  const after = Math.max(0, remaining - days);
  const overBalance = balanceQ.data ? days > remaining : false;

  const m = useMutation({
    mutationFn: (v: LeaveApplyValues) =>
      applyLeave({
        start_date: v.start_date,
        end_date: v.end_date,
        kind: v.kind as LeaveKind,
        reason: v.reason,
      }),
    onSuccess: (_data, vars) => {
      toast.show(t("leave_apply.submitted"), "success");
      qc.invalidateQueries({ queryKey: ["leave", "balance"] });
      qc.invalidateQueries({ queryKey: ["inbox"] });
      // F-EMPLOYEE-006: pass submitted kind to onDone for success-page display
      onDone?.(vars.kind);
    },
    onError: () => toast.show(t("leave_apply.failed"), "danger"),
  });

  function onSubmit(v: LeaveApplyValues) {
    if (overBalance) {
      setError("end_date", { message: "mobile.leave_apply.over_balance" });
      return;
    }
    m.mutate(v);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label={t("leave_apply.title")}>
      <FormField label={t("mobile.leave_apply.kind")} required>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <SegmentedControl
              value={field.value}
              onChange={(v) => field.onChange(v as LeaveKind)}
              options={[
                { value: "FULL", label: t("mobile.leave_apply.kind_full") },
                { value: "AM_HALF", label: t("mobile.leave_apply.kind_am_half") },
                { value: "PM_HALF", label: t("mobile.leave_apply.kind_pm_half") },
              ]}
            />
          )}
        />
      </FormField>

      <FormField label={t("leave_apply.from")} required error={errors.start_date?.message}>
        <TextField type="date" {...register("start_date")} />
      </FormField>

      <FormField
        label={t("leave_apply.to")}
        required
        error={
          errors.end_date?.message
            ? t(errors.end_date.message, { defaultValue: errors.end_date.message })
            : undefined
        }
      >
        <TextField type="date" {...register("end_date")} />
      </FormField>

      <FormField label={t("leave_apply.reason")} error={errors.reason?.message}>
        <textarea
          {...register("reason")}
          placeholder={t("mobile.leave_apply.reason_placeholder")}
          className="block w-full rounded-md bg-ink-100 px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          style={{ minHeight: 80, resize: "none" }}
        />
      </FormField>

      <Card padding={14} style={{ background: "var(--brand-soft)", marginBottom: 16 }}>
        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color: "var(--grey-700)" }}>
            {t("mobile.leave_apply.days_used_one", { n: days })}
          </span>
          <b
            className="text-[14px] num-tab"
            style={{ color: overBalance ? "var(--danger)" : "var(--grey-900)" }}
          >
            {t("mobile.leave_apply.after_balance")} {after}
            {t("leave.days_unit")}
          </b>
        </div>
        {overBalance && (
          <div className="text-[12px] mt-2" style={{ color: "var(--danger)" }}>
            {t("mobile.leave_apply.over_balance")}
          </div>
        )}
      </Card>

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={isSubmitting || m.isPending || overBalance}
      >
        {t("mobile.leave_apply.submit")}
      </Button>
    </form>
  );
}
