import { useTranslation } from "react-i18next";
import { Sheet } from "@shared/ui";
import { OvertimeForm } from "./OvertimeForm";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate?: string;
};

export function OvertimeRequestSheet({ open, onClose, defaultDate }: Props) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onClose={onClose} title={t("mobile.overtime.title")}>
      <OvertimeForm defaultDate={defaultDate} onSubmitted={onClose} />
    </Sheet>
  );
}
