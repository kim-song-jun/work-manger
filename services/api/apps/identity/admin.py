from django.contrib import admin

from .models import Company, CompanyJoinCode, Department, Location, Membership, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "is_email_verified", "is_active", "created_at")
    search_fields = ("email", "name")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "default_locale", "timezone", "created_at")
    search_fields = ("name", "code")


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "path", "sort_order")
    list_filter = ("company",)


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "company", "role", "department", "is_active")
    list_filter = ("company", "role", "is_active")
    search_fields = ("user__email", "user__name")


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("label", "company", "kind", "latitude", "longitude", "radius_m")
    list_filter = ("company", "kind")


@admin.register(CompanyJoinCode)
class CompanyJoinCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "company", "used_count", "max_uses", "expires_at", "revoked_at")
