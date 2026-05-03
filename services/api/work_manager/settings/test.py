from .base import *  # noqa: F401,F403

DATABASES["default"]["TEST"] = {"NAME": "test_work_manager"}  # noqa: F405
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
CELERY_TASK_ALWAYS_EAGER = True
