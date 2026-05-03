from django.urls import path

from . import onboarding_views as onb
from . import views

urlpatterns = [
    path("auth/signup", views.signup),
    path("auth/login", views.login),
    path("auth/refresh", views.refresh),
    path("me", views.me),
    # onboarding
    path("onboarding/join-company", onb.join_company),
    path("onboarding/profile", onb.profile),
    path("onboarding/locations", onb.locations),
    path("onboarding/schedule", onb.schedule),
    path("onboarding/notifications", onb.notifications_pref),
    path("onboarding/complete", onb.complete),
    path("dev/bootstrap-company", onb.dev_bootstrap_company),
    # admin company codes
    path("admin/company-codes", onb.company_codes),
    path("admin/company-codes/<uuid:code_id>", onb.revoke_company_code),
]
