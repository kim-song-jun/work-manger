from django.urls import path

from . import onboarding_views as onb
from . import views

urlpatterns = [
    path("auth/signup", views.signup),
    path("auth/login", views.login),
    path("auth/refresh", views.refresh),
    path("auth/logout", views.logout),
    path("auth/password/change", views.password_change),
    path("auth/2fa/enable", views.two_fa_enable),
    path("auth/2fa/verify", views.two_fa_verify),
    path("auth/2fa/disable", views.two_fa_disable),
    path("auth/2fa/challenge", views.two_fa_challenge),
    path("auth/email/verify", views.email_verify),
    path("auth/email/resend", views.email_resend),
    path("auth/password/forgot", views.password_forgot),
    path("auth/password/reset", views.password_reset),
    path("me", views.me),
    path("me/settings", views.me_settings),
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
