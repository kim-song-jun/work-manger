// Minimal Web Push service worker for work-manager.
// Receives VAPID-encrypted pushes from apps.notification.providers.web_push,
// surfaces them as system notifications, and routes taps via clients.openWindow.
// See ADR-006 (self-hosted push, no Firebase).

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: 'Work Manager', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Work Manager';
  const options = {
    body: data.body || '',
    data: { url: data.url || '/' },
    icon: '/icon-192.png',
    badge: '/badge-72.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(clients.openWindow(target));
});
