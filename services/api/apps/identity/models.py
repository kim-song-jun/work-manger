from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone as django_tz


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra):
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra)

    def create_superuser(self, email: str, password: str, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        extra.setdefault("is_email_verified", True)
        if not extra.get("is_staff") or not extra.get("is_superuser"):
            raise ValueError("Superuser must have is_staff=True and is_superuser=True")
        return self._create_user(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120)
    locale = models.CharField(max_length=8, default="ko")
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    failed_login_count = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    totp_secret = models.CharField(max_length=64, blank=True, default="")
    totp_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    class Meta:
        db_table = "app_user"

    def __str__(self) -> str:
        return self.email


class Company(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=6, unique=True)
    fiscal_year_start = models.DateField()
    default_locale = models.CharField(max_length=8, default="ko")
    timezone = models.CharField(max_length=64, default="Asia/Seoul")
    # Spec §7.6 — when True, attendance.clock_in is blocked for memberships
    # already at/over the 52h weekly threshold. Default off (warn-only).
    compliance_block_when_over = models.BooleanField(default=False)
    # Spec §5.2 — 근로기준법 §61 사용 촉진 제도. When True, the
    # ``leave.promote_unused_leave`` beat task issues 6개월/2개월 전 reminders.
    leave_promotion_enabled = models.BooleanField(default=False)
    # iter11 Wave 6 — AdminSettingsPage 브랜드 컬러 / 로고.
    brand_color = models.CharField(max_length=9, default="#5B6CFF")
    logo_url = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "company"

    def __str__(self) -> str:
        return self.name


class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="departments")
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    name = models.CharField(max_length=120)
    path = models.CharField(max_length=255, default="/")
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "department"
        indexes = [models.Index(fields=["company", "path"], name="idx_dept_company_path")]


class Membership(models.Model):
    class Role(models.TextChoices):
        EMPLOYEE = "EMPLOYEE", "Employee"
        MANAGER = "MANAGER", "Manager"
        ADMIN = "ADMIN", "Admin"
        OWNER = "OWNER", "Owner"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name="members"
    )
    manager = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="reports"
    )
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.EMPLOYEE)
    position = models.CharField(max_length=64, blank=True, default="")
    employee_no = models.CharField(max_length=32, blank=True, default="")
    hired_at = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "membership"
        constraints = [
            models.UniqueConstraint(fields=["company", "user"], name="uniq_company_user"),
        ]
        indexes = [
            models.Index(fields=["company", "department"], name="idx_membership_company_dept"),
            models.Index(fields=["manager"], name="idx_membership_manager"),
        ]


class Location(models.Model):
    class Kind(models.TextChoices):
        OFFICE = "OFFICE", "Office"
        WFH = "WFH", "WFH"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="locations")
    kind = models.CharField(max_length=8, choices=Kind.choices)
    label = models.CharField(max_length=64)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    radius_m = models.IntegerField(default=100)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "location"


class CompanyJoinCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="join_codes")
    code = models.CharField(max_length=6, unique=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    max_uses = models.IntegerField(null=True, blank=True)
    used_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        Membership, on_delete=models.SET_NULL, null=True, blank=True, related_name="issued_codes"
    )
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "company_join_code"


class RecoveryCode(models.Model):
    """One-time TOTP recovery codes (bcrypt-hashed)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recovery_codes")
    code_hash = models.CharField(max_length=128)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "user_recovery_code"
        indexes = [models.Index(fields=["user"], name="idx_recovery_user")]
