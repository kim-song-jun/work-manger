import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, Card, KPIStat, Skeleton, useToast } from "@shared/ui";
import {
  fetchEmployeeDetail,
  updateEmployee,
  deactivateEmployee,
  type EmployeeRole,
} from "@entities/employee";
import { EmployeeEditForm, ROLES } from "@features/admin-employee-edit";

type Tab = "overview" | "attendance" | "leave" | "perm";

const TABS: Tab[] = ["overview", "attendance", "leave", "perm"];

function isRole(v: unknown): v is EmployeeRole {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

export function AdminEmployeeDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");

  const q = useQuery({
    queryKey: ["admin-employee", id],
    queryFn: () => fetchEmployeeDetail(id),
    enabled: !!id,
  });

  const m = useMutation({
    mutationFn: (patch: Parameters<typeof updateEmployee>[1]) =>
      updateEmployee(id, patch),
    onSuccess: () => {
      toast.show(t("admin.emp_save_success"));
      qc.invalidateQueries({ queryKey: ["admin-employee", id] });
    },
    onError: () => toast.show(t("admin.emp_save_failed")),
  });

  const dm = useMutation({
    mutationFn: () => deactivateEmployee(id),
    onSuccess: () => {
      toast.show(t("admin.emp_save_success"));
      qc.invalidateQueries({ queryKey: ["admin-employee", id] });
    },
    onError: () => toast.show(t("admin.emp_save_failed")),
  });

  const detail = q.data;

  return (
    <div>
      <Link
        to="/admin/employees"
        className="text-[13px]"
        style={{ color: "var(--grey-600)", textDecoration: "none" }}
      >
        ← {t("admin.common_back")}
      </Link>

      {q.isLoading || !detail ? (
        <Card padding={24} className="mt-4">
          <Skeleton height={20} />
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-4 mt-3 mb-5">
            <Avatar name={detail.name} size={56} />
            <div>
              <h1 className="text-[24px] font-bold m-0">{detail.name}</h1>
              <div className="text-[13px]" style={{ color: "var(--grey-600)" }}>
                {detail.email}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 4,
              borderBottom: "1px solid var(--grey-200)",
              marginBottom: 18,
            }}
          >
            {TABS.map((tk) => (
              <button
                key={tk}
                type="button"
                onClick={() => setTab(tk)}
                style={{
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  color: tab === tk ? "var(--grey-900)" : "var(--grey-500)",
                  borderBottom:
                    tab === tk ? "2px solid var(--grey-900)" : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {t(`admin.emp_detail_${tk}` as const)}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <Card padding={18}>
                <KPIStat label={t("admin.emp_col_role")} value={t(`admin.role_${detail.role.toLowerCase()}` as const)} />
              </Card>
              <Card padding={18}>
                <KPIStat label={t("admin.emp_col_team")} value={detail.team ?? "—"} />
              </Card>
              <Card padding={18}>
                <KPIStat label={t("admin.emp_col_position")} value={detail.position ?? "—"} />
              </Card>
            </div>
          )}

          {tab === "attendance" && (
            <Card padding={18}>
              <div className="text-[13px] font-bold mb-2">30d</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {(detail.attendance_30d ?? []).map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date} · ${d.worked_minutes}m`}
                    style={{
                      width: 18,
                      height: 18,
                      background:
                        d.worked_minutes > 0 ? "var(--success)" : "var(--grey-200)",
                      borderRadius: 3,
                    }}
                  />
                ))}
                {(detail.attendance_30d ?? []).length === 0 && (
                  <div style={{ color: "var(--grey-500)" }}>—</div>
                )}
              </div>
            </Card>
          )}

          {tab === "leave" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <Card padding={18}>
                <KPIStat label={t("leave.balance")} value={detail.leave?.remaining ?? 0} unit={t("leave.days_unit")} />
              </Card>
              <Card padding={18}>
                <KPIStat label={t("leave.used")} value={detail.leave?.used ?? 0} unit={t("leave.days_unit")} />
              </Card>
              <Card padding={18}>
                <KPIStat label={t("leave.accrued")} value={detail.leave?.accrued ?? 0} unit={t("leave.days_unit")} />
              </Card>
              <Card padding={18}>
                <KPIStat
                  label={t("leave.expiring")}
                  value={detail.leave?.expiring ?? 0}
                  unit={t("leave.days_unit")}
                  color="var(--warn)"
                />
              </Card>
            </div>
          )}

          {tab === "perm" && (
            <Card padding={20}>
              <EmployeeEditForm
                defaultValues={{
                  role: isRole(detail.role) ? detail.role : "EMPLOYEE",
                  position: detail.position ?? null,
                  department: detail.department ?? null,
                  active: detail.active !== false,
                }}
                submitting={m.isPending}
                onSubmit={async (v) => {
                  await m.mutateAsync({
                    role: v.role,
                    position: v.position,
                    department: v.department,
                    active: v.active,
                  });
                }}
              />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => dm.mutate()}
                  disabled={dm.isPending}
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer" }}
                >
                  {t("admin.emp_deactivate")}
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
