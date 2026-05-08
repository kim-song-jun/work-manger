import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button, FormField, TextField } from "@shared/ui";

const schema = z.object({ reason: z.string().max(500).optional() });
export type RejectReasonValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (v: RejectReasonValues) => void;
  pending?: boolean;
};

export function InboxRejectReasonForm({ onSubmit, pending }: Props) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<RejectReasonValues>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });
  return (
    <form
      aria-label={t("inbox.reject")}
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <FormField label={t("inbox.reject_reason_label")} error={errors.reason?.message}>
        <TextField
          type="text"
          placeholder={t("inbox.reject_reason_placeholder")}
          {...register("reason")}
        />
      </FormField>
      <Button type="submit" variant="secondary" disabled={pending}>
        {t("inbox.submit_reject")}
      </Button>
    </form>
  );
}
