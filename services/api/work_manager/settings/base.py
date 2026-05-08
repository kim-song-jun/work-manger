from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env(
    DEBUG=(bool, False),
)
environ.Env.read_env(BASE_DIR / ".env", overwrite=False)

SECRET_KEY = env("DJANGO_SECRET_KEY", default="dev-insecure-change-me")
DEBUG = env.bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["*"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
    "django_celery_beat",
    "channels",
    "apps.identity",
    "apps.attendance",
    "apps.leave",
    "apps.approval",
    "apps.notification",
    "apps.team",
    "apps.admin_api",
    "apps.audit",
    "apps.realtime",
    "apps.compliance",
    "apps.oauth",
    "apps.trip",
    "apps.notice",
    "apps.billing",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "work_manager.urls"
WSGI_APPLICATION = "work_manager.wsgi.application"
ASGI_APPLICATION = "work_manager.asgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {
    "default": env.db_url(
        "DATABASE_URL",
        default="postgres://wm:wm@db:5432/work_manager",
    )
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL", default="redis://redis:6379/1"),
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [env("REDIS_URL", default="redis://redis:6379/2")]},
    }
}

CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="redis://redis:6379/0")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default="redis://redis:6379/0")
CELERY_TIMEZONE = "Asia/Seoul"
CELERY_TASK_TRACK_STARTED = True
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

AUTH_USER_MODEL = "identity.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
     "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "core.errors.exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "sub",
}

# Auth lockout policy — docs/api/authentication.md §2
AUTH_LOCKOUT_THRESHOLD = 5
AUTH_LOCKOUT_DURATION = timedelta(minutes=15)

# 2FA challenge token TTL (seconds) — docs/api/authentication.md §8
TWO_FA_CHALLENGE_TTL_SECONDS = 60
TWO_FA_RECOVERY_CODE_COUNT = 10

# ── Email-verification / password-reset ─────────────────────────────────────
# Frontend base URL embedded in verification + reset email links. Configurable
# per environment (dev: http://localhost:4444, prod: app.work-manager.molcube.com).
WM_FRONTEND_BASE_URL = env(
    "WM_FRONTEND_BASE_URL", default="http://localhost:4444"
)

# ── OAuth (Google + Kakao) ──────────────────────────────────────────────────
# When the *_CLIENT_ID is blank the corresponding /v1/auth/oauth/{provider}/start
# endpoint returns 503 OAUTH_NOT_CONFIGURED so dev environments without secrets
# don't accidentally redirect to a broken URL.
OAUTH_GOOGLE_CLIENT_ID = env("OAUTH_GOOGLE_CLIENT_ID", default="")
OAUTH_GOOGLE_CLIENT_SECRET = env("OAUTH_GOOGLE_CLIENT_SECRET", default="")
OAUTH_KAKAO_CLIENT_ID = env("OAUTH_KAKAO_CLIENT_ID", default="")
OAUTH_KAKAO_CLIENT_SECRET = env("OAUTH_KAKAO_CLIENT_SECRET", default="")

# ── Self-hosted push notification stack ────────────────────────────────────
# See docs/operations/operations-guide.md §5.4 + ADR-006 for the rationale
# (zero Google dependency: Web Push for browsers/Electron/WebView, APNs HTTP/2
# direct for iOS native, ntfy self-hosted for Android native).
NOTIFICATION_PROVIDER_MODE = env("NOTIFICATION_PROVIDER_MODE", default="stub")

# Web Push (VAPID) — emit ECDSA P-256 keypair via:
#   docker compose exec api python manage.py generate_vapid_keys
WEB_PUSH_VAPID_PUBLIC_KEY = env("WEB_PUSH_VAPID_PUBLIC_KEY", default="")
WEB_PUSH_VAPID_PRIVATE_KEY = env("WEB_PUSH_VAPID_PRIVATE_KEY", default="")
WEB_PUSH_VAPID_SUBJECT = env(
    "WEB_PUSH_VAPID_SUBJECT", default="mailto:ops@work-manager.molcube.com"
)

# ntfy (Android native) — internal compose service; nginx proxies /v1/ntfy/
NTFY_BASE_URL = env("NTFY_BASE_URL", default="http://ntfy:80")
NTFY_TOPIC_PREFIX = env("NTFY_TOPIC_PREFIX", default="wm-prod")
NTFY_AUTH_TOKEN = env("NTFY_AUTH_TOKEN", default="")

# APNs HTTP/2 direct (iOS native) — bypass FCM entirely.
APNS_KEY_ID = env("APNS_KEY_ID", default="")
APNS_TEAM_ID = env("APNS_TEAM_ID", default="")
APNS_BUNDLE_ID = env("APNS_BUNDLE_ID", default="com.molcube.workmanager")
APNS_KEY_PEM = env("APNS_KEY_PEM", default="")
APNS_USE_SANDBOX = env.bool("APNS_USE_SANDBOX", default=True)

# Email provider toggles (existing — kept here so the §5.4 table is self-contained).
EMAIL_PROVIDER = env("EMAIL_PROVIDER", default="ses")
EMAIL_FROM = env("EMAIL_FROM", default="no-reply@work-manager.molcube.com")
AWS_REGION = env("AWS_REGION", default="ap-northeast-2")

SPECTACULAR_SETTINGS = {
    "TITLE": "Work Manager API",
    "DESCRIPTION": "근무 관리 시스템 REST API",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "COMPONENT_SPLIT_REQUEST": True,
}

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:4444",
        "http://127.0.0.1:4444",
    ],
)
# Regex allowlist (e.g., compose internal IPv4 used by the e2e container).
# Default permits 172.* docker networks talking to web:4444.
CORS_ALLOWED_ORIGIN_REGEXES = env.list(
    "CORS_ALLOWED_ORIGIN_REGEXES",
    default=[
        r"^http://(127\.0\.0\.1|localhost|web|172\.[0-9]+\.[0-9]+\.[0-9]+):4444$",
    ],
)
CORS_ALLOW_CREDENTIALS = True

LANGUAGE_CODE = "ko-kr"
TIME_ZONE = "Asia/Seoul"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "format": '{"ts":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
        },
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "json"},
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}

# ── Sentry (error + perf monitoring) ────────────────────────────────────────
# DSN 미설정 시 init 을 건너뜀 → 로컬 / CI 환경에서는 무영향.
# stg / prod 환경에서는 SENTRY_DSN env 를 주입하면 자동 활성.
SENTRY_DSN = env("SENTRY_DSN", default="")
SENTRY_TRACES_SAMPLE_RATE = env.float("SENTRY_TRACES_SAMPLE_RATE", default=0.1)
DJANGO_ENV = env("DJANGO_ENV", default="dev")

if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.celery import CeleryIntegration
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.redis import RedisIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=SENTRY_TRACES_SAMPLE_RATE,
        send_default_pii=False,  # PII 보호 — operations-guide.md §8.4
        environment=DJANGO_ENV,
    )
