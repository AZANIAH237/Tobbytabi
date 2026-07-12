const CACHE_NAME = 'tt-connect-v2';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

/* ================= NOTIFICATIONS ================= */
// Reminders are scheduled from the page (localStorage-backed) while the app
// is open/backgrounded-but-alive. This SW is responsible for: (1) rendering
// the actual system notification with action buttons, and (2) reacting to
// taps on it, including the "Snooze" action, even if the app has been
// closed in the meantime (as long as the browser hasn't unregistered the SW).
// When Capacitor wraps this app later, this same showNotification() call
// path can stay - only the trigger (native LocalNotifications / real Push)
// changes.

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'tt-show-notification') {
    const { title, body, tag, reminderType } = msg;
    event.waitUntil(
      self.registration.showNotification(title || 'Tobby Tabi', {
        body: body || '',
        tag: tag || 'tt-reminder',
        icon: './logo.png',
        badge: './logo.png',
        vibrate: [120, 60, 120],
        renotify: true,
        data: { reminderType: reminderType || '' },
        actions: [
          { action: 'snooze', title: 'Snooze 1h' },
          { action: 'open', title: 'Open App' }
        ]
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  const reminderType = (event.notification.data && event.notification.data.reminderType) || '';
  event.notification.close();

  if (event.action === 'snooze') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        const client = clients.find((c) => 'focus' in c);
        if (client) {
          client.postMessage({ type: 'tt-snooze', reminderType });
          return client.focus();
        }
        return self.clients.openWindow('./index.html?snooze=' + encodeURIComponent(reminderType));
      })
    );
    return;
  }

  // Default tap or "Open App" action: focus existing tab, else open a new one.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const client = clients.find((c) => 'focus' in c);
      if (client) {
        client.postMessage({ type: 'tt-open-notifications' });
        return client.focus();
      }
      return self.clients.openWindow('./index.html?openNotifications=1');
    })
  );
});

// Future-proofing: once this app is wrapped with Capacitor / gets a real
// push server, this will start receiving actual server push payloads.
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) {}
  const title = payload.title || 'Tobby Tabi';
  const body = payload.body || '';
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: './logo.png',
      badge: './logo.png',
      data: { reminderType: payload.reminderType || '' }
    })
  );
});
