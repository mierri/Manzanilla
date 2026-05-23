import { useState, useEffect } from 'react';
import { Plus, CalendarX } from 'lucide-react';
import { appointmentsApi } from '@/lib/api';
import { cached, invalidate } from '@/lib/cache';
import { useToast } from '@/app/ToastContext';
import { parseApptDate } from '@/lib/utils';
import type { Appointment } from '@/types';
import { BookAppointmentDialog } from '@/features/appointments/BookAppointmentDialog';
import { ApptRow } from './components/ApptRow';
import { QuickBookPanel } from './components/QuickBookPanel';

export default function PatientCitas() {
  const toast = useToast();
  const [appts,   setAppts]   = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [tab,     setTab]     = useState<'proximas' | 'pasadas'>('proximas');

  const load = () =>
    cached('pat-appts', () => appointmentsApi.list(), r => setAppts(r.data))
      .then(r => setAppts(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const now      = new Date();
  const upcoming = appts
    .filter(a => parseApptDate(a.appointment_date) >= now && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => parseApptDate(a.appointment_date).getTime() - parseApptDate(b.appointment_date).getTime());
  const past = appts
    .filter(a => parseApptDate(a.appointment_date) < now)
    .sort((a, b) => parseApptDate(b.appointment_date).getTime() - parseApptDate(a.appointment_date).getTime());

  const list = tab === 'proximas' ? upcoming : past;

  const handleCancel = async (id: number) => {
    try {
      await appointmentsApi.delete(id);
      invalidate('pat-appts');
      setAppts(a => a.filter(x => x.id !== id));
      toast.push({ tone: 'sage', title: 'Cita cancelada', body: 'Avisaremos a tu médico' });
    } catch {
      toast.push({ tone: 'danger', title: 'No se pudo cancelar' });
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <span className="role-stripe"><span className="dot" /> Portal paciente</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>Mis <em>citas</em></h1>
          <p className="page-subtitle">Lleva el control de tus consultas médicas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setBooking(true)}><Plus size={16} /> Agendar cita</button>
      </div>

      <div style={{ display: 'flex', gap: 4, background: 'var(--card-tint)', padding: 4, borderRadius: 999, marginBottom: 18, width: 'fit-content' }}>
        {([
          { id: 'proximas', label: `Próximas (${upcoming.length})` },
          { id: 'pasadas',  label: `Pasadas (${past.length})` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: tab === t.id ? 'var(--ink)' : 'transparent', color: tab === t.id ? 'var(--bg-warm-white)' : 'var(--ink-soft)', transition: 'all .2s var(--ease)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Cargando…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: tab === 'proximas' ? '1.5fr 1fr' : '1fr', gap: 18 }} className="resp-pac-citas-2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <CalendarX size={36} color="var(--muted)" style={{ marginBottom: 8 }} />
                <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>Sin citas {tab === 'proximas' ? 'próximas' : 'anteriores'}</div>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
                  {tab === 'proximas' ? 'Agenda una consulta con el botón de arriba.' : 'Tus consultas anteriores aparecerán aquí.'}
                </p>
                {tab === 'proximas' && (
                  <button className="btn btn-primary" style={{ margin: '16px auto 0', display: 'inline-flex' }} onClick={() => setBooking(true)}>
                    <Plus size={16} /> Agendar cita
                  </button>
                )}
              </div>
            )}
            {list.map(a => (
              <ApptRow key={a.id} appt={a} past={tab === 'pasadas'} onCancel={() => handleCancel(a.id)} onReschedule={() => setBooking(true)} />
            ))}
          </div>
          {tab === 'proximas' && <QuickBookPanel onBook={() => setBooking(true)} />}
        </div>
      )}

      <BookAppointmentDialog open={booking} onClose={() => setBooking(false)} onCreated={load} />
    </div>
  );
}
