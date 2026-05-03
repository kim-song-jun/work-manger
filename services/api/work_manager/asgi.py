import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "work_manager.settings.dev")
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402

from apps.realtime.auth_middleware import JWTAuthMiddleware  # noqa: E402
from apps.realtime.routing import websocket_urlpatterns  # noqa: E402

http_application = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": http_application,
        "websocket": AllowedHostsOriginValidator(
            JWTAuthMiddleware(URLRouter(websocket_urlpatterns))
        ),
    }
)
