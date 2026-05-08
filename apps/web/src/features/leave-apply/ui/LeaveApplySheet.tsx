import { useTranslation } from "react-i18next";

import { Sheet } from "@shared/ui";

import { LeaveApplyForm } from "./LeaveApplyForm";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultEndDate?: string;
};

export function LeaveApplySheet({ open, onClose, defaultDate, defaultEndDate }: Props) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onClose={onClose} title={t("leave_apply.title")}>
      <LeaveApplyForm
        defaultDate={defaultDate}
        defaultEndDate={defaultEndDate}
        onDone={onClose}
      />
    </Sheet>
  );
}
