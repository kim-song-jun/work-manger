from .base import *  # noqa: F401,F403
from .base import env

DEBUG = False
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 63072000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Sentry — prod 에서는 DSN 이 반드시 설정되어 있어야 한다.
# base.py 의 init guard 가 SENTRY_DSN 비어 있으면 silent skip 하므로
# 운영 점검 (operations-guide.md §11.1) 에 명시.
# 실제 DSN 주입은 배포 파이프라인 (GitHub Secrets → ECS task env) 에서 강제.
