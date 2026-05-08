import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, Skeleton, useToast } from "@shared/ui";
import { useMe } from "@shared/lib/me";
import {
  fetchCompanySettings,
  updateCompanySettings,
  type CompanySettings,
  type CompanySettingsPatch,
} from "@entities/company-settings";

const COLOR_REGEX = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

export function AdminSettingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const me = useMe();
  const isOwner = me.data?.memberships?.[0]?.role === "OWNER";

  const q = useQuery({
    queryKey: ["admin-company-settings"],
    queryFn: fetchCompanySettings,
  });

  const [draft, setDraft] = useState<CompanySettingsPatch>({});

  useEffect(() => {
    setDraft({});
  }, [q.data]);

  const m = useMutation({
    mutationFn: (patch: CompanySettingsPatch) => updateCompanySettings(patch),
    onSuccess: (next) => {
      toast.show(t("admin.settings_saved"));
      qc.setQueryData(["admin-company-settings"], next);
      setDraft({});
    },
    onError: () => toast.show(t("admin.common_error")),
  });

  if (q.isLoading || !q.data) {
    return (
      <div>
        <h1 className="text-[24px] font-bold m-0 mb-3">{t("admin.settings_title")}</h1>
        <Card padding={20}>
          <Skeleton height={20} />
        </Card>
      </div>
    );
  }

  const cur: CompanySettings = { ...q.data, ...draft };

  function patch<K extends keyof CompanySettingsPatch>(
    key: K,
    value: CompanySettingsPatch[K],
  ) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const colorInvalid =
    typeof draft.brand_color === "string" && !COLOR_REGEX.test(draft.brand_color);
  const dirty = Object.keys(draft).length > 0;

  function onSave() {
    if (!dirty || colorInvalid) return;
    m.mutate(draft);
  }

  function onReset() {
    setDraft({});
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <h1 className="text-[24px] font-bold m-0 mb-1">{t("admin.settings_title")}</h1>
      <div className="text-[13px] mb-4" style={{ color: "var(--grey-600)" }}>
        {isOwner ? t("admin.settings_sub_owner") : t("admin.settings_sub_admin")}
      </div>

      <SettingsSection title={t("admin.settings_section_company")}>
        <Field label={t("admin.settings_company_name")} value={cur.name} />
        <Field label={t("admin.settings_company_code")} value={cur.code} />
        <Field label={t("admin.settings_fiscal_year")} value={cur.fiscal_year_start} />
        <SelectField
          label={t("admin.settings_locale")}
          value={cur.default_locale}
          options={[
            { value: "ko", label: "한국어" },
            { value: "en", label: "English" },
          ]}
          disabled={!isOwner}
          onChange={(v) => patch("default_locale", v)}
        />
        <SelectField
          label={t("admin.settings_timezone")}
          value={cur.timezone}
          options={[
            { value: "Asia/Seoul", label: "Asia/Seoul" },
            { value: "Asia/Tokyo", label: "Asia/Tokyo" },
            { value: "America/Los_Angeles", label: "America/Los_Angeles" },
            { value: "UTC", label: "UTC" },
          ]}
          disabled={!isOwner}
          onChange={(v) => patch("timezone", v)}
        />
      </SettingsSection>

      <SettingsSection title={t("admin.settings_section_brand")}>
        <ColorField
          label={t("admin.settings_brand_color")}
          value={cur.brand_color}
          invalid={colorInvalid}
          disabled={!isOwner}
          onChange={(v) => patch("brand_color", v)}
        />
        <TextField
          label={t("admin.settings_logo_url")}
          value={cur.logo_url}
          placeholder="https://..."
          disabled={!isOwner}
          onChange={(v) => patch("logo_url", v)}
        />
      </SettingsSection>

      <SettingsSection title={t("admin.settings_section_policy")}>
        <ToggleField
          label={t("admin.settings_compliance_block")}
          desc={t("admin.settings_compliance_block_desc")}
          value={cur.compliance_block_when_over}
          disabled={!isOwner}
          onChange={(v) => patch("compliance_block_when_over", v)}
        />
        <ToggleField
          label={t("admin.settings_leave_promotion")}
          desc={t("admin.settings_leave_promotion_desc")}
          value={cur.leave_promotion_enabled}
          disabled={!isOwner}
          onChange={(v) => patch("leave_promotion_enabled", v)}
        />
      </SettingsSection>

      {isOwner && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            background: "linear-gradient(to top, var(--grey-50), transparent)",
            padding: "16px 0 8px",
          }}
        >
          <button
            type="button"
            onClick={onReset}
            disabled={!dirty || m.isPending}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "1px solid var(--grey-300)",
              borderRadius: 8,
              cursor: dirty ? "pointer" : "default",
              color: "var(--grey-700)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {t("admin.settings_reset")}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || m.isPending || colorInvalid}
            style={{
              padding: "10px 20px",
              background: !dirty || colorInvalid ? "var(--grey-300)" : "var(--brand)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: !dirty || colorInvalid ? "default" : "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {m.isPending ? t("admin.settings_saving") : t("admin.settings_save")}
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card padding={20} style={{ marginBottom: 12 }}>
      <h2 className="text-[14px] font-bold mb-3" style={{ color: "var(--grey-900)" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      <span className="text-[13px] font-bold" style={{ color: "var(--grey-900)" }}>
        {value}
      </span>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 12px",
          border: "1px solid var(--grey-300)",
          borderRadius: 6,
          fontSize: 13,
          background: disabled ? "var(--grey-50)" : "#fff",
          color: "var(--grey-900)",
        }}
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  invalid,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  invalid?: boolean;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="color"
          value={value.length === 7 ? value : "#5B6CFF"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 36, border: "none", padding: 0, background: "none" }}
          aria-label={`${label} 색상 선택`}
        />
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: invalid ? "1px solid var(--danger)" : "1px solid var(--grey-300)",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "monospace",
            background: disabled ? "var(--grey-50)" : "#fff",
          }}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 12px",
          border: "1px solid var(--grey-300)",
          borderRadius: 6,
          fontSize: 13,
          background: disabled ? "var(--grey-50)" : "#fff",
          color: "var(--grey-900)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  desc,
  value,
  disabled,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2 }}
      />
      <div style={{ flex: 1 }}>
        <div className="text-[13px] font-bold" style={{ color: "var(--grey-900)" }}>
          {label}
        </div>
        {desc && (
          <div className="text-[12px]" style={{ color: "var(--grey-600)", marginTop: 2 }}>
            {desc}
          </div>
        )}
      </div>
    </label>
  );
}
