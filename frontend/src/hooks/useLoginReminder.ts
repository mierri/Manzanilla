import { useEffect, useState } from 'react';
import { appointmentsApi } from '@/lib/api';
import type { User } from '@/types';

const KEY_DISMISSED   = () => `manzanilla_reminded_${new Date().toISOString().split('T')[0]}`;
const KEY_SHOW_BANNER = 'manzanilla_show_dismiss_banner';

export function isDismissedToday()  { return localStorage.getItem(KEY_DISMISSED()) === '1'; }
export function dismissToday()      { localStorage.setItem(KEY_DISMISSED(), '1'); localStorage.removeItem(KEY_SHOW_BANNER); }

function actionsSupported(): boolean {
  return 'Notification' in window && (Notification as unknown as { maxActions?: number }).maxActions! > 0;
}

async function showPush(title: string, body: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;

  const options = {
    body,
    icon:     '/flor.svg',
    tag:      'manzanilla-login-reminder',
    renotify: false,
    ...(actionsSupported() ? { actions: [{ action: 'no_remind_today', title: 'No recordar mas hoy' }] } : {}),
  };

  reg.showNotification(title, options as NotificationOptions);

  // For browsers without action buttons: store flag so any tab (including one
  // opened by clicking the notification) knows to show the in-app banner.
  if (!actionsSupported()) {
    localStorage.setItem(KEY_SHOW_BANNER, '1');
  }
}

export function useLoginReminder(user: User | null) {
  // Check on mount if a previous notification set the banner flag
  const [showDismissToast, setShowDismissToast] = useState(
    () => localStorage.getItem(KEY_SHOW_BANNER) === '1' && !isDismissedToday()
  );

  useEffect(() => {
    if (!user) return;
    if (isDismissedToday()) return;

    // Listen for "No recordar hoy" action (Chrome/Edge — via SW message)
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NO_REMIND_TODAY') {
        dismissToday();
        setShowDismissToast(false);
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);

    const today    = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];

    Promise.all([
      appointmentsApi.list({ date: today }),
      appointmentsApi.list({ date: tomorrow }),
    ]).then(([todayRes, tomorrowRes]) => {
      if (isDismissedToday()) return;

      const todayAppts    = todayRes.data.filter(a => a.status !== 'cancelled');
      const tomorrowAppts = tomorrowRes.data.filter(a => a.status !== 'cancelled');

      if (todayAppts.length > 0) {
        const time = new Date(todayAppts[0].appointment_date)
          .toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        showPush('🗓️ Tienes cita hoy',
          `${todayAppts.length > 1 ? `${todayAppts.length} citas` : 'Una cita'} hoy - primera a las ${time}`
        ).then(() => {
          if (!actionsSupported()) setShowDismissToast(true);
        });
      } else if (tomorrowAppts.length > 0) {
        const time = new Date(tomorrowAppts[0].appointment_date)
          .toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        showPush('⏰ Tienes cita mañana',
          `${tomorrowAppts.length > 1 ? `${tomorrowAppts.length} citas` : 'Una cita'} mañana - primera a las ${time}`
        ).then(() => {
          if (!actionsSupported()) setShowDismissToast(true);
        });
      }
    }).catch(() => { /* silent */ });

    return () => { navigator.serviceWorker?.removeEventListener('message', handler); };
  }, [user?.id]);

  const handleDismissToday = () => { dismissToday(); setShowDismissToast(false); };
  const handleDismissToast = () => { localStorage.removeItem(KEY_SHOW_BANNER); setShowDismissToast(false); };

  return { showDismissToast, handleDismissToday, handleDismissToast };
}
