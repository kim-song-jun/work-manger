import { useTranslation } from "react-i18next";
import { Button } from "@shared/ui";

type Props = {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
};

/** Shows count + bulk approve/reject buttons; renders a passive shell when empty. */
export function BulkActionBar({ selectedCount, onApprove, onReject, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: "10px 14px",
        background: "var(--white)",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--grey-200)",
      }}
    >
      <span
        className="text-[13px]"
        style={{ color: "var(--grey-700)" }}
        data-testid="bulk-action-count"
      >
        {t("admin.appr_selected", { n: selectedCount })}
      </span>
      <div className="flex-1" />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled || selectedCount === 0}
        onClick={onReject}
      >
        {t("admin.appr_bulk_reject")}
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={disabled || selectedCount === 0}
        onClick={onApprove}
      >
        {t("admin.appr_bulk_approve")}
      </Button>
    </div>
  );
}
