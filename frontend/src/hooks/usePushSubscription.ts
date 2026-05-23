import { useEffect, useRef, useState } from 'react';
import { pushApi } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushSubscription(enabled: boolean) {
  const [supported,  setSupported]  = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  // Register SW and check current subscription state
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      regRef.current = reg;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, [supported]);

  const subscribe = async () => {
    if (!regRef.current || loading) return;
    setLoading(true);
    try {
      const { data } = await pushApi.getPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(data.public_key);
      const sub = await regRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      const json = sub.toJSON();
      await pushApi.subscribe({
        endpoint:   json.endpoint!,
        public_key: json.keys?.p256dh ?? '',
        auth_token: json.keys?.auth   ?? '',
      });
      setSubscribed(true);
    } catch (err) {
      console.error('Push subscribe failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!regRef.current || loading) return;
    setLoading(true);
    try {
      const sub = await regRef.current.pushManager.getSubscription();
      if (sub) {
        await pushApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-subscribe/unsubscribe when `enabled` preference changes
  useEffect(() => {
    if (!supported || loading) return;
    if (enabled && !subscribed) subscribe();
    if (!enabled && subscribed) unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, supported]);

  return { supported, subscribed, loading };
}
