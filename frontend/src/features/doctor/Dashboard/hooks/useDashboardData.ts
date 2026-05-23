import { useState, useEffect } from 'react';
import { appointmentsApi, patientsApi, notificationsApi } from '@/lib/api';
import { cached } from '@/lib/cache';
import type { Appointment, Notification, Patient } from '@/types';

export function useDashboardData() {
  const [todayAppts,    setTodayAppts]    = useState<Appointment[]>([]);
  const [tomorrowAppts, setTomorrowAppts] = useState<Appointment[]>([]);
  const [notifs,        setNotifs]        = useState<Notification[]>([]);
  const [patients,      setPatients]      = useState<Patient[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const today    = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const todayStr    = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    Promise.all([
      cached(`appts-${todayStr}`,    () => appointmentsApi.list({ date: todayStr }),    r => setTodayAppts(r.data.filter((a: Appointment) => a.status !== 'cancelled' && a.status !== 'completed'))),
      cached(`appts-${tomorrowStr}`, () => appointmentsApi.list({ date: tomorrowStr }), r => setTomorrowAppts(r.data.filter((a: Appointment) => a.status !== 'cancelled' && a.status !== 'completed'))),
      cached('notifications',        () => notificationsApi.list(),                     r => setNotifs(r.data)),
      cached('patients',             () => patientsApi.list(),                          r => setPatients(r.data)),
    ]).then(([tRes, tmRes, nRes, pRes]) => {
      setTodayAppts(tRes.data.filter((a: Appointment) => a.status !== 'cancelled' && a.status !== 'completed'));
      setTomorrowAppts(tmRes.data.filter((a: Appointment) => a.status !== 'cancelled' && a.status !== 'completed'));
      setNotifs(nRes.data);
      setPatients(pRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return { todayAppts, setTodayAppts, tomorrowAppts, notifs, setNotifs, patients, loading };
}
