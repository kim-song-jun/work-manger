from __future__ import annotations

import datetime as _dt
import random
import string
import uuid

import factory
from factory.django import DjangoModelFactory

from apps.attendance.models import (
    AttendanceRecord,
    BreakRecord,
    OvertimeRequest,
    WorkSchedule,
)
from apps.identity.models import (
    Company,
    Department,
    Location,
    Membership,
    User,
)


def _rand_code(n: int = 6) -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=n))


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    id = factory.LazyFunction(uuid.uuid4)
    email = factory.LazyAttribute(lambda o: f"user-{uuid.uuid4().hex[:8]}@example.com")
    name = factory.Faker("name")
    locale = "ko"
    is_active = True
    is_email_verified = True

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "Strong!Pass99")
        obj = model_class(*args, **kwargs)
        obj.set_password(password)
        obj.save()
        return obj


class CompanyFactory(DjangoModelFactory):
    class Meta:
        model = Company

    id = factory.LazyFunction(uuid.uuid4)
    name = factory.Sequence(lambda n: f"Test Co {n}")
    code = factory.LazyFunction(_rand_code)
    fiscal_year_start = _dt.date(2026, 1, 1)
    default_locale = "ko"
    timezone = "Asia/Seoul"


class DepartmentFactory(DjangoModelFactory):
    class Meta:
        model = Department

    id = factory.LazyFunction(uuid.uuid4)
    company = factory.SubFactory(CompanyFactory)
    name = "Engineering"
    path = "/engineering"


class MembershipFactory(DjangoModelFactory):
    class Meta:
        model = Membership

    id = factory.LazyFunction(uuid.uuid4)
    company = factory.SubFactory(CompanyFactory)
    user = factory.SubFactory(UserFactory)
    role = Membership.Role.EMPLOYEE
    hired_at = _dt.date(2026, 1, 1)
    is_active = True


class LocationFactory(DjangoModelFactory):
    class Meta:
        model = Location

    id = factory.LazyFunction(uuid.uuid4)
    company = factory.SubFactory(CompanyFactory)
    kind = Location.Kind.OFFICE
    label = "본사"
    latitude = "37.500000"
    longitude = "127.000000"
    radius_m = 150


class WorkScheduleFactory(DjangoModelFactory):
    class Meta:
        model = WorkSchedule

    id = factory.LazyFunction(uuid.uuid4)
    membership = factory.SubFactory(MembershipFactory)
    start_time = _dt.time(9, 0)
    end_time = _dt.time(18, 0)
    break_minutes = 60
    work_days = [1, 2, 3, 4, 5]


class AttendanceRecordFactory(DjangoModelFactory):
    class Meta:
        model = AttendanceRecord

    id = factory.LazyFunction(uuid.uuid4)
    company = factory.SelfAttribute("membership.company")
    membership = factory.SubFactory(MembershipFactory)
    work_date = factory.LazyFunction(_dt.date.today)


class BreakRecordFactory(DjangoModelFactory):
    class Meta:
        model = BreakRecord

    id = factory.LazyFunction(uuid.uuid4)
    attendance_record = factory.SubFactory(AttendanceRecordFactory)


class OvertimeRequestFactory(DjangoModelFactory):
    class Meta:
        model = OvertimeRequest

    id = factory.LazyFunction(uuid.uuid4)
    company = factory.SelfAttribute("membership.company")
    membership = factory.SubFactory(MembershipFactory)
    work_date = factory.LazyFunction(_dt.date.today)
    requested_minutes = 60
    reason = "프로젝트 마감"
