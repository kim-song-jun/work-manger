import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { Button, FormField, TextField } from "@shared/ui";

import {
  employeeEditSchema,
  normalizeEmployeeEdit,
  ROLES,
  type EmployeeEditOutput,
  type EmployeeEditValues,
} from "../model/schema";

type Props = {
  defaultValues: EmployeeEditValues;
  onSubmit: (values: EmployeeEditOutput) => Promise<void> | void;
  submitting?: boolean;
};

export function EmployeeEditForm({ defaultValues, onSubmit, submitting }: Props) {
  const { t } = useTranslation();
  // Inputs are controlled — null becomes "" so TextField stays mounted-controlled.
  const initial: EmployeeEditValues = {
    role: defaultValues.role,
    position: defaultValues.position ?? "",
    department: defaultValues.department ?? "",
    active: defaultValues.active,
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EmployeeEditValues>({
    defaultValues: initial,
    resolver: zodResolver(employeeEditSchema),
    mode: "onChange",
  });

  const errMsg = (k?: string) => (k ? t(`admin.${k}` as const) : undefined);

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(normalizeEmployeeEdit(v)))}
      style={{ maxWidth: 480 }}
      aria-label="employee-edit-form"
    >
      <FormField
        label={t("admin.emp_field_role")}
        error={errMsg(errors.role?.message as string | undefined)}
        required
      >
        <select
          aria-label={t("admin.emp_field_role")}
          {...register("role")}
          className="block w-full h-12 rounded-md bg-ink-100 px-4 text-[15px] text-ink-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`admin.role_${r.toLowerCase()}` as const)}
            </option>
          ))}
        </select>
      </FormField>

      <FormField error={errMsg(errors.position?.message as string | undefined)}>
        <TextField
          label={t("admin.emp_field_position")}
          {...register("position")}
        />
      </FormField>

      <FormField error={errMsg(errors.department?.message as string | undefined)}>
        <TextField
          label={t("admin.emp_field_department")}
          {...register("department")}
        />
      </FormField>

      <Controller
        control={control}
        name="active"
        render={({ field }) => (
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              aria-label={t("admin.emp_field_active")}
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <span className="text-[14px] text-ink-700">
              {t("admin.emp_field_active")}
            </span>
          </label>
        )}
      />

      <Button type="submit" disabled={submitting}>
        {submitting ? "…" : t("admin.emp_save")}
      </Button>
    </form>
  );
}
