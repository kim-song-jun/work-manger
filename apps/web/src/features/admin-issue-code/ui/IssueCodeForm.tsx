import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button, FormField, TextField } from "@shared/ui";
import { createCompanyCode } from "@entities/company-code";

/** Inline form for issuing a join code (max uses + expiry, both optional). */
export function IssueCodeForm() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const m = useMutation({
    mutationFn: () =>
      createCompanyCode({
        max_uses: maxUses ? Number(maxUses) : null,
        expires_at: expiresAt || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-company-codes"] });
      setMaxUses("");
      setExpiresAt("");
      setError(null);
    },
    onError: (e) => setError(String(e)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    m.mutate();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-3"
      style={{
        background: "var(--white)",
        padding: 14,
        borderRadius: "var(--r-md)",
        border: "1px solid var(--grey-200)",
      }}
    >
      <div style={{ flex: 1 }}>
        <FormField error={error ?? undefined}>
          <TextField
            label={`${t("admin.code_max_uses")} (${t("admin.code_optional")})`}
            type="number"
            min={1}
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
          />
        </FormField>
      </div>
      <div style={{ flex: 1 }}>
        <FormField>
          <TextField
            label={`${t("admin.code_expires_at")} (${t("admin.code_optional")})`}
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </FormField>
      </div>
      <div style={{ paddingBottom: 16 }}>
        <Button type="submit" disabled={m.isPending}>
          {m.isPending ? "…" : t("admin.code_issue")}
        </Button>
      </div>
    </form>
  );
}
