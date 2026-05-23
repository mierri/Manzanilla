import { useState } from 'react';
import { Calendar, Users, FileText, Clock, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useToast } from '@/app/ToastContext';
import { notificationsApi } from '@/lib/api';
import type { Notification } from '@/types';
import { fmtTime, fmtDate } from '@/lib/utils';
import { NewAppointmentModal } from '@/features/appointments/NewAppointmentModal';
import { PatientAvatar } from './components/PatientAvatar';
import { ScheduleRow } from './components/ScheduleRow';
import { NotifRow } from './components/NotifRow';
import { useDashboardData } from './hooks/useDashboardData';

interface Props { onNavigate: (id: string, params?: Record<string, unknown>) => void; }

export default function DoctorDashboard({ onNavigate }: Props) {
  const { user }  = useAuth();
  const toast     = useToast();
  const { todayAppts, setTodayAppts, tomorrowAppts, notifs, setNotifs, patients, loading } = useDashboardData();
  const [creating, setCreating] = useState(false);

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifs(n => n.map(x => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
      toast.push({ tone: 'sage', title: 'Notificaciones marcadas como leídas' });
    } catch {
      toast.push({ tone: 'danger', title: 'Error al marcar notificaciones' });
    }
  };

  const deleteNotif = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifs((n: Notification[]) => n.filter(x => x.id !== id));
    } catch {
      toast.push({ tone: 'danger', title: 'Error al eliminar notificación' });
    }
  };

  const deleteAllNotifs = async () => {
    try {
      await notificationsApi.deleteAll();
      setNotifs([]);
      toast.push({ tone: 'sage', title: 'Notificaciones eliminadas' });
    } catch {
      toast.push({ tone: 'danger', title: 'Error al eliminar notificaciones' });
    }
  };

  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const unread   = notifs.filter(n => !n.read_at).length;
  const hoursToday = (todayAppts.reduce((s, a) => s + (a.duration ?? 0), 0) / 60).toFixed(1);

  const stats = [
    { label: 'Citas hoy',              value: todayAppts.length, sub: `${todayAppts.filter(a => a.status === 'confirmed').length} confirmadas`,         Icon: Calendar, tone: 'peach',    action: () => onNavigate('citas') },
    { label: 'Pacientes activos',       value: patients.length,   sub: 'Ver directorio',                                                                 Icon: Users,    tone: 'sage',     action: () => onNavigate('pacientes') },
    { label: 'Pendientes de relatoría', value: todayAppts.filter(a => a.status === 'confirmed').length, sub: 'Consultas confirmadas de hoy',              Icon: FileText, tone: 'butter',   action: () => onNavigate('historia') },
    { label: 'Horas en consulta',       value: hoursToday,        sub: `${todayAppts.length} citas programadas`,                                          Icon: Clock,    tone: 'lavender', action: () => {} },
  ];

  const recentPatients = [...patients].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, <em>{user?.name.split(' ')[0]}</em></h1>
          <p className="page-subtitle">
            Hoy es <span className="serif-italic">{fmtDate(now.toISOString())}</span>
            {todayAppts.length > 0
              ? ` · tienes ${todayAppts.length} cita${todayAppts.length > 1 ? 's' : ''} agendada${todayAppts.length > 1 ? 's' : ''}`
              : ' · sin citas por hoy, todo en calma'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('citas')}><Calendar size={16} /> Ver agenda</button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Nueva cita</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="resp-stats-4">
        {stats.map((s, i) => (
          <button key={i} className="card lift" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, textAlign: 'left', width: '100%' }} onClick={s.action}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{s.label}</div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 4, lineHeight: 1 }}>{loading ? '…' : s.value}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8 }}>{s.sub}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `var(--${s.tone})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <s.Icon size={18} />
            </div>
          </button>
        ))}
      </div>

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }} className="resp-main-2">
        {/* Today's schedule */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>Hoy <span className="count">{todayAppts.length} citas</span></div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Tu día de un vistazo</div>
            </div>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => onNavigate('citas')}>Ver agenda completa</button>
          </div>
          <div style={{ padding: '0 14px 4px' }}>
            {loading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>
            ) : todayAppts.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Sin citas para hoy</div>
            ) : (
              todayAppts.slice(0, 5).map((a, i) => (
                <ScheduleRow key={a.id} appt={a}
                  accent={(['peach','sage','butter','lavender'] as const)[i % 4]}
                  onClick={() => onNavigate('historia', { patientId: a.patient_id ?? undefined, appointmentId: a.id })}
                />
              ))
            )}
          </div>

          {/* Mañana section */}
          {tomorrowAppts.length > 0 && (
            <div style={{ padding: '16px 22px 22px', borderTop: '1px solid var(--hairline)', background: 'var(--card-tint)', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>Mañana</div>
              {tomorrowAppts.slice(0, 3).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', width: 60, flexShrink: 0 }}>{fmtTime(a.appointment_date)}</span>
                  <PatientAvatar name={a.patient?.name ?? '?'} id={a.patient_id ?? 0} size={28} />
                  <span style={{ fontSize: 14, color: 'var(--ink)', flex: 1 }}>{a.patient?.name ?? 'Paciente'}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{a.reason}</span>
                </div>
              ))}
              {tomorrowAppts.length > 3 && (
                <button className="btn-ghost" style={{ fontSize: 12, marginTop: 8, padding: '4px 0' }} onClick={() => onNavigate('citas')}>
                  +{tomorrowAppts.length - 3} más mañana
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Notifications */}
          <div className="card">
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                Avisos
                {unread > 0 && <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--peach-deep)', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>{unread}</span>}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {unread > 0 && <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px' }} onClick={markAllRead}>Marcar leídos</button>}
                {notifs.length > 0 && <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--danger)' }} onClick={deleteAllNotifs}>Borrar todo</button>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {loading ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Cargando…</div>
              ) : notifs.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Sin notificaciones</div>
              ) : (
                notifs.slice(0, 5).map(n => <NotifRow key={n.id} note={n} onDelete={deleteNotif} />)
              )}
            </div>
          </div>

          {/* Bienestar */}
          <div className="card-soft" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.35 }}>
              <img src="/flor.svg" width={120} height={120} aria-hidden />
            </div>
            <div style={{ position: 'relative' }}>
              <span className="chip chip-ink" style={{ marginBottom: 10 }}><Sparkles size={12} /> Bienestar del consultorio</span>
              <div className="serif" style={{ fontSize: 18, lineHeight: 1.2, fontWeight: 500, maxWidth: 260 }}>
                {todayAppts.length > 0
                  ? <>Llevas <em style={{ color: 'var(--peach-deep)' }}>{hoursToday} hrs</em> de consulta hoy.</>
                  : <>Día tranquilo. <em style={{ color: 'var(--peach-deep)' }}>Descansa</em> entre consultas.</>
                }
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, maxWidth: 280 }}>
                {patients.length > 0 ? `Tienes ${patients.length} pacientes activos.` : 'Comienza agregando pacientes.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pacientes recientes */}
      {recentPatients.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              Pacientes recientes <span className="count">últimos registrados</span>
            </span>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => onNavigate('pacientes')}>Ver todos</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }} className="resp-patients-5">
            {recentPatients.map(p => (
              <button key={p.id} className="card lift" style={{ padding: 18, textAlign: 'left', width: '100%' }}
                onClick={() => onNavigate('historia', { patientId: p.id })}>
                <PatientAvatar name={p.name} id={p.id} size={44} />
                <div className="serif" style={{ fontSize: 15, fontWeight: 500, marginTop: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name.split(' ').slice(0, 2).join(' ')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{p.age} años · {p.sex === 'M' ? 'Masculino' : p.sex === 'F' ? 'Femenino' : 'Otro'}</div>
                <div style={{ marginTop: 10 }}>
                  <span className={`chip chip-${p.last_visit ? 'sage' : 'butter'}`} style={{ fontSize: 11 }}>
                    {p.last_visit ? 'Reciente' : 'Sin visita'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <NewAppointmentModal open={creating} onClose={() => setCreating(false)}
        onCreated={appt => {
          const today = new Date().toISOString().split('T')[0];
          if (appt.appointment_date.startsWith(today)) {
            setTodayAppts(a => [...a, appt]);
          }
        }} />
    </div>
  );
}
