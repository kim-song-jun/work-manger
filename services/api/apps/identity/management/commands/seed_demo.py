"""Seed a realistic Postgres demo dataset for the "Acme" company.

Run via Compose:

    docker compose exec -T api python manage.py seed_demo

Idempotent — re-running clears the demo company first, then re-seeds.

Creates:
  - 1 Company "Acme" (code "ACMEDM"), 4 departments
  - 1 reusable onboarding join code "ACMEDM"
  - 1 OWNER, 1 ADMIN, 2 MANAGERs, 25 EMPLOYEEs (29 memberships)
  - WorkSchedule (09:00–18:00) per membership
  - 7 days of AttendanceRecord per active employee with realistic clock-in scatter
  - 5 PENDING + 3 APPROVED LeaveRequests
  - 3 PENDING OvertimeRequests
"""
from __future__ import annotations

import random
import string
import uuid
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone as django_tz

from apps.approval.models import ApprovalTask
from apps.attendance.models import AttendanceRecord, OvertimeRequest, WorkSchedule
from apps.identity.models import (
    Company,
    CompanyJoinCode,
    Department,
    Location,
    Membership,
    User,
)
from apps.leave.models import LeaveBalance, LeavePolicy, LeaveRequest


DEMO_COMPANY_CODE = "ACMEDM"
DEMO_COMPANY_NAME = "Acme"

DEPT_NAMES = ["Engineering", "Product", "Sales", "Operations"]
EMPLOYEE_NAMES = [
    "Alice", "Bob", "Charlie", "Diana", "Ethan", "Faye", "Gus", "Hera",
    "Ivan", "Julia", "Kim", "Liam", "Mona", "Nate", "Olive", "Park",
    "Quinn", "Riku", "Sora", "Theo", "Una", "Vera", "Will", "Xenia", "Yuna",
]


def _random_email(seed: str) -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"{seed.lower()}-{suffix}@acme.demo"


class Command(BaseCommand):
    help = "Seed the Acme demo dataset (idempotent — clears prior demo company first)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days-back",
            type=int,
            default=7,
            help="Number of past days of attendance records to generate (default 7).",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=20260504,
            help="RNG seed for reproducible demo data.",
        )

    def handle(self, *args, **options):
        random.seed(options["seed"])
        days_back = int(options["days_back"])

        with transaction.atomic():
            self._wipe()
            company, departments = self._create_company()
            owner, admin, managers, employees = self._create_memberships(
                company, departments
            )
            self._create_join_code(company, admin)
            self._create_locations(company)
            self._create_schedules(owner, admin, *managers, *employees)
            active = [owner, admin, *managers, *employees]
            self._create_attendance(company, employees + managers, days_back)
            self._create_leave_balances(company, active)
            self._create_leave_requests(company, employees, managers)
            self._create_overtime_requests(company, employees, managers)

        self.stdout.write(self.style.SUCCESS(
            f"Seeded company '{company.name}' (code {company.code}) — "
            f"{Membership.objects.filter(company=company).count()} memberships, "
            f"{AttendanceRecord.objects.filter(company=company).count()} attendance rows, "
            f"{LeaveRequest.objects.filter(company=company).count()} leave requests, "
            f"{OvertimeRequest.objects.filter(company=company).count()} overtime requests."
        ))

    # ------------------------------------------------------------------
    # Build steps
    # ------------------------------------------------------------------

    def _wipe(self) -> None:
        """Delete the demo company and its dependent rows.

        ON DELETE CASCADE on the FKs cleans up Memberships, Locations,
        AttendanceRecords, OvertimeRequests, LeaveBalances, LeaveRequests
        and LeavePolicies. ApprovalTasks reference Company directly too.
        Users orphaned by the wipe are removed individually.
        """
        existing = Company.objects.filter(code=DEMO_COMPANY_CODE).first()
        if existing is None:
            return
        user_ids = list(
            Membership.objects.filter(company=existing).values_list("user_id", flat=True)
        )
        existing.delete()
        if user_ids:
            User.objects.filter(id__in=user_ids).delete()

    def _create_company(self) -> tuple[Company, list[Department]]:
        # NOTE: explicitly pass `compliance_block_when_over` and
        # `leave_promotion_enabled` so we don't depend on schema-level
        # defaults (some environments still have the column with NO
        # DEFAULT). See migration 0005_company_compliance_block_default.
        company = Company.objects.create(
            name=DEMO_COMPANY_NAME,
            code=DEMO_COMPANY_CODE,
            fiscal_year_start=date(2026, 1, 1),
            timezone="Asia/Seoul",
            compliance_block_when_over=False,
            leave_promotion_enabled=False,
        )
        depts = [
            Department.objects.create(company=company, name=n, path=f"/{n.lower()}")
            for n in DEPT_NAMES
        ]
        # Default leave policy
        LeavePolicy.objects.create(
            company=company,
            effective_from=date(2024, 1, 1),
            rules_json={"strategy": "korean_labor_law"},
            expiry_months=12,
            notify_days_before=[30, 14, 7, 1],
        )
        return company, depts

    def _create_memberships(self, company, departments):
        today = django_tz.localdate()
        owner_user = User.objects.create_user(
            email="owner@acme.demo", password="DemoPass!1", name="Owner Acme",
            is_email_verified=True,
        )
        owner = Membership.objects.create(
            company=company, user=owner_user, role=Membership.Role.OWNER,
            department=departments[0], hired_at=today - timedelta(days=365 * 4),
        )
        admin_user = User.objects.create_user(
            email="admin@acme.demo", password="DemoPass!1", name="Admin Acme",
            is_email_verified=True,
        )
        admin = Membership.objects.create(
            company=company, user=admin_user, role=Membership.Role.ADMIN,
            department=departments[0], hired_at=today - timedelta(days=365 * 3),
        )

        managers: list[Membership] = []
        for i in range(2):
            mu = User.objects.create_user(
                email=f"manager{i+1}@acme.demo", password="DemoPass!1",
                name=f"Manager{i+1}", is_email_verified=True,
            )
            mgr = Membership.objects.create(
                company=company, user=mu, role=Membership.Role.MANAGER,
                department=departments[i % len(departments)],
                hired_at=today - timedelta(days=random.randint(365, 365 * 3)),
            )
            managers.append(mgr)

        employees: list[Membership] = []
        for i, name in enumerate(EMPLOYEE_NAMES):
            user = User.objects.create_user(
                email=_random_email(name),
                password="DemoPass!1",
                name=f"{name} Acme",
                is_email_verified=True,
            )
            mgr = managers[i % len(managers)]
            emp = Membership.objects.create(
                company=company,
                user=user,
                role=Membership.Role.EMPLOYEE,
                department=departments[i % len(departments)],
                manager=mgr,
                hired_at=today - timedelta(days=random.randint(30, 365 * 5)),
            )
            employees.append(emp)
        return owner, admin, managers, employees

    def _create_join_code(self, company, created_by) -> None:
        CompanyJoinCode.objects.create(
            company=company,
            code=DEMO_COMPANY_CODE,
            max_uses=None,
            created_by=created_by,
        )

    def _create_locations(self, company) -> None:
        Location.objects.create(
            company=company, kind=Location.Kind.OFFICE, label="본사",
            latitude=Decimal("37.500000"), longitude=Decimal("127.000000"),
            radius_m=150,
        )
        Location.objects.create(
            company=company, kind=Location.Kind.WFH, label="재택",
            latitude=Decimal("37.510000"), longitude=Decimal("127.010000"),
            radius_m=10000,
        )

    def _create_schedules(self, *memberships) -> None:
        for m in memberships:
            WorkSchedule.objects.create(
                membership=m,
                start_time=time(9, 0),
                end_time=time(18, 0),
                break_minutes=60,
                work_days=[1, 2, 3, 4, 5],
            )

    def _create_attendance(self, company, memberships, days_back) -> None:
        today = django_tz.localdate()
        tz = django_tz.get_current_timezone()
        kinds = [
            AttendanceRecord.Kind.OFFICE, AttendanceRecord.Kind.OFFICE,
            AttendanceRecord.Kind.OFFICE, AttendanceRecord.Kind.WFH,
        ]
        for offset in range(1, days_back + 1):
            wd = today - timedelta(days=offset)
            if wd.weekday() >= 5:  # skip weekends
                continue
            for m in memberships:
                # ~10% absence
                if random.random() < 0.1:
                    continue
                jitter_min = random.randint(-20, 25)
                clock_in_local = datetime.combine(wd, time(9, 0)) + timedelta(minutes=jitter_min)
                clock_in_at = django_tz.make_aware(clock_in_local, tz)
                clock_out_at = clock_in_at + timedelta(hours=9)
                kind = random.choice(kinds)
                AttendanceRecord.objects.create(
                    company=company,
                    membership=m,
                    work_date=wd,
                    clock_in_at=clock_in_at,
                    clock_out_at=clock_out_at,
                    clock_in_kind=kind,
                    is_late=jitter_min > 10,
                    is_early_leave=False,
                    total_break_minutes=60,
                    total_work_minutes=int((clock_out_at - clock_in_at).total_seconds() // 60) - 60,
                    status=AttendanceRecord.Status.COMPLETED,
                )

    def _create_leave_balances(self, company, memberships) -> None:
        today = django_tz.localdate()
        for m in memberships:
            LeaveBalance.objects.create(
                company=company,
                membership=m,
                kind=LeaveBalance.Kind.GRANTED,
                days=Decimal("15"),
                granted_at=date(today.year, 1, 1),
                expires_at=date(today.year, 12, 31),
                note=f"annual:{today.year}",
            )

    def _create_leave_requests(self, company, employees, managers) -> None:
        today = django_tz.localdate()
        # 5 PENDING
        for i in range(5):
            emp = employees[i]
            start = today + timedelta(days=7 + i)
            LeaveRequest.objects.create(
                company=company, membership=emp,
                start_date=start, end_date=start + timedelta(days=1),
                kind=LeaveRequest.Kind.FULL, days=Decimal("2"),
                reason="휴식", status=LeaveRequest.Status.PENDING,
            )
            ApprovalTask.objects.create(
                company=company,
                target_type=ApprovalTask.TargetType.LEAVE,
                target_id=LeaveRequest.objects.filter(membership=emp).order_by("-created_at").first().id,
                requester=emp, approver=emp.manager or managers[0],
                status=ApprovalTask.Status.PENDING,
            )
        # 3 APPROVED spanning today
        for i in range(3):
            emp = employees[5 + i]
            LeaveRequest.objects.create(
                company=company, membership=emp,
                start_date=today, end_date=today,
                kind=LeaveRequest.Kind.FULL, days=Decimal("1"),
                reason="개인", status=LeaveRequest.Status.APPROVED,
                decided_by=emp.manager or managers[0],
                decided_at=django_tz.now(),
            )

    def _create_overtime_requests(self, company, employees, managers) -> None:
        today = django_tz.localdate()
        for i in range(3):
            emp = employees[10 + i]
            ot = OvertimeRequest.objects.create(
                company=company, membership=emp,
                work_date=today - timedelta(days=i),
                requested_minutes=60 + i * 30,
                reason="장애 대응", auto_generated=False,
                status=OvertimeRequest.Status.PENDING,
            )
            ApprovalTask.objects.create(
                company=company,
                target_type=ApprovalTask.TargetType.OVERTIME,
                target_id=ot.id, requester=emp,
                approver=emp.manager or managers[0],
                status=ApprovalTask.Status.PENDING,
            )
