import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button, Card, Skeleton, useToast } from "@shared/ui";
import { useMe } from "@shared/lib/me";
import {
  fetchCompanySettings,
  updateCompanySettings,
  type CompanySettings,
  type CompanySettingsPatch,
} from "@entities/company-settings";

const COLOR_REGEX = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

/** Clearance padding for sticky action bar — 20px (--sp-5) is the bar height clearance. */
const STICKY_BAR_PB = "var(--sp-12)"; // 48px clearance below content for sticky bar

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

  // F-LIVE-006: isError branch — 404/5xx → ErrorState instead of infinite skeleton
  if (q.isError) {
    return (
      <div>
        <h1 className="text-[24px] font-bold m-0 mb-3">{t("admin.settings_title")}</h1>
        <Card padding={20}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--sp-3)",
              padding: "var(--sp-4)",
              color: "var(--grey-600)",
              textAlign: "center",
            }}
          >
            <span className="text-[14px]">{t("admin.settings_load_error")}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => qc.invalidateQueries({ queryKey: ["admin-company-settings"] })}
            >
              {t("admin.settings_load_error_retry")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
    // F-DESIGN-006: paddingBottom token (was 80px hardcoded)
    <div style={{ paddingBottom: STICKY_BAR_PB }}>
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

      {/* F-OWNER-05: 데이터 관리 섹션 — data export/delete SOP mailto triggers */}
      <SettingsSection title={t("admin.settings_section_data")}>
        <div>
          <div className="text-[13px] font-bold mb-1" style={{ color: "var(--grey-900)" }}>
            {t("admin.settings_data_export_title")}
          </div>
          <div className="text-[12px] mb-2" style={{ color: "var(--grey-600)" }}>
            {t("admin.settings_data_export_desc")}
          </div>
          <a
            href={`mailto:privacy@molcube.com?subject=${encodeURIComponent("데이터 내보내기 요청")}&body=${encodeURIComponent("회사명:\n담당자 이름:\n요청 내용:")}`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="secondary" size="sm">
              {t("admin.settings_data_export_btn")}
            </Button>
          </a>
        </div>
        <div>
          <div className="text-[13px] font-bold mb-1" style={{ color: "var(--grey-900)" }}>
            {t("admin.settings_data_delete_title")}
          </div>
          <div className="text-[12px] mb-2" style={{ color: "var(--grey-600)" }}>
            {t("admin.settings_data_delete_desc")}
          </div>
          <a
            href={`mailto:privacy@molcube.com?subject=${encodeURIComponent("데이터 삭제 요청")}&body=${encodeURIComponent("회사명:\n담당자 이름:\n요청 내용:")}`}
            style={{ textDecoration: "none" }}
          >
            <Button variant="secondary" size="sm">
              {t("admin.settings_data_delete_btn")}
            </Button>
          </a>
        </div>
      </SettingsSection>

      {/* F-OWNER-08: SOP 링크 카드 섹션 */}
      <SettingsSection title={t("admin.settings_section_help")}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--sp-2)",
          }}
        >
          {[
            {
              label: t("admin.settings_help_data_export_sop"),
              href: "/docs/operations/sop/sop-data-export-request.md",
            },
            {
              label: t("admin.settings_help_data_delete_sop"),
              href: "/docs/operations/sop/sop-data-deletion-request.md",
            },
            {
              label: t("admin.settings_help_emergency_pw"),
              href: "/docs/operations/sop/sop-emergency-password-reset.md",
            },
            {
              label: t("admin.settings_help_onboard"),
              href: "/docs/operations/sop/sop-onboard-new-company.md",
            },
          ].map((sop) => (
            <a
              key={sop.href}
              href={sop.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--sp-3) var(--sp-4)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--grey-200)",
                fontSize: 13,
                color: "var(--grey-900)",
                textDecoration: "none",
              }}
            >
              <span>{sop.label}</span>
              <span style={{ color: "var(--grey-400)", fontSize: 11 }}>↗</span>
            </a>
          ))}
        </div>
      </SettingsSection>

      {/* Sticky action bar — F-ADMIN-08: show hint for ADMIN, save bar for OWNER */}
      {isOwner ? (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            gap: "var(--sp-2)",
            justifyContent: "flex-end",
            background: "linear-gradient(to top, var(--grey-50), transparent)",
            padding: "var(--sp-4) 0 var(--sp-2)",
          }}
        >
          {/* F-DESIGN-009 + F-DESIGN-010: shared Button replaces raw <button> */}
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onReset}
            disabled={!dirty || m.isPending}
          >
            {t("admin.settings_reset")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={onSave}
            disabled={!dirty || m.isPending || colorInvalid}
          >
            {m.isPending ? t("admin.settings_saving") : t("admin.settings_save")}
          </Button>
        </div>
      ) : (
        /* F-ADMIN-08: ADMIN hint — shows inline when form has been modified */
        dirty && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              padding: "var(--sp-3) var(--sp-4)",
              background: "var(--grey-50)",
              borderTop: "1px solid var(--grey-200)",
              fontSize: 12,
              color: "var(--grey-600)",
              textAlign: "center",
            }}
          >
            {t("admin.settings_owner_only_hint")}
          </div>
        )
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
      {/* F-DESIGN-007: gap token — was 14 (off-grid), now var(--sp-3)=12px */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
        {children}
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    /* F-DESIGN-018: overflow protection on both label and value spans */
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--sp-2)" }}>
      <span
        className="text-[12px]"
        style={{
          color: "var(--grey-600)",
          maxWidth: "45%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-bold"
        style={{
          color: "var(--grey-900)",
          maxWidth: "50%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
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
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      {/* F-DESIGN-002: #fff → var(--white) | F-DESIGN-003: borderRadius 6 → var(--r-sm) | F-DESIGN-012: focus-visible */}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={{
          padding: "var(--sp-2) var(--sp-3)",
          border: "1px solid var(--grey-300)",
          borderRadius: "var(--r-sm)",
          fontSize: 13,
          background: disabled ? "var(--grey-50)" : "var(--white)",
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
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }}>
        <input
          type="color"
          // F-DESIGN-001: #5B6CFF → var(--brand)
          value={value.length === 7 ? value : "var(--brand)"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 36, height: 36, border: "none", padding: 0, background: "none" }}
          aria-label={`${label} 색상 선택`}
        />
        {/* F-DESIGN-002: #fff → var(--white) | F-DESIGN-003: borderRadius 6 → var(--r-sm) | F-DESIGN-012: focus-visible */}
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          style={{
            flex: 1,
            padding: "var(--sp-2) var(--sp-3)",
            border: invalid ? "1px solid var(--danger)" : "1px solid var(--grey-300)",
            borderRadius: "var(--r-sm)",
            fontSize: 13,
            fontFamily: "monospace",
            background: disabled ? "var(--grey-50)" : "var(--white)",
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
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--sp-1)" }}>
      <span className="text-[12px]" style={{ color: "var(--grey-600)" }}>
        {label}
      </span>
      {/* F-DESIGN-002: #fff → var(--white) | F-DESIGN-003: borderRadius 6 → var(--r-sm) | F-DESIGN-012: focus-visible */}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        style={{
          padding: "var(--sp-2) var(--sp-3)",
          border: "1px solid var(--grey-300)",
          borderRadius: "var(--r-sm)",
          fontSize: 13,
          background: disabled ? "var(--grey-50)" : "var(--white)",
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
        gap: "var(--sp-3)",
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
