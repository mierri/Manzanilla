// Manzanilla Push Service Worker
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); } catch { data = { title: 'Manzanilla', body: event.data.text() }; }

  const options = {
    body:    data.body  ?? '',
    icon:    data.icon  ?? '/flor.svg',
    badge:   data.badge ?? '/flor.svg',
    data:    data.data  ?? {},
    vibrate: [100, 50, 100],
    tag:     data.tag ?? 'manzanilla-appt',
    renotify: true,
    actions: [
      { action: 'no_remind_today', title: 'No recordar más hoy' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title ?? 'Consultorio Manzanilla', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'no_remind_today') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients =>
        clients.forEach(c => c.postMessage({ type: 'NO_REMIND_TODAY' }))
      )
    );
    return;
  }

  const isLoginReminder = event.notification.tag === 'manzanilla-login-reminder';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(async clients => {
      const existing = clients.find(c => new URL(c.url).origin === self.location.origin);
      if (existing) {
        await existing.focus();
      } else if (!isLoginReminder) {
        // For appointment notifications open the app if no window is open.
        // Login reminder banner is driven by localStorage so no navigation needed.
        self.clients.openWindow(self.location.origin);
      }
    })
  );
});
