import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "work_manager.settings.dev")

app = Celery("work_manager")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
