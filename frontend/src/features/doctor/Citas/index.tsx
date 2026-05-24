import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Lock, X, Bell } from 'lucide-react';
import { appointmentsApi } from '@/lib/api';
import { cached, invalidate } from '@/lib/cache';
import { useToast } from '@/app/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { fmtDate, parseApptDate } from '@/lib/utils';
import type { Appointment } from '@/types';
import { NewAppointmentModal } from '@/features/appointments/NewAppointmentModal';

function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfWeek(d: Date) { const r = new Date(d); r.setDate(r.getDate() - r.getDay() + 1); r.setHours(0, 0, 0, 0); return r; }
function sameDay(a: Date, b: Date) { return a.toDateString() === b.toDateString(); }
function fmtWeekRange(start: Date, end: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  return `${start.toLocaleDateString('es-MX', opts)} – ${end.toLocaleDateString('es-MX', { ...opts, year: 'numeric' })}`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}

export default function Citas() {
  const navigate = useNavigate();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [_loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<{ date: string; hour: number; min: number } | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cached('appts-all', () => appointmentsApi.list(), r => setAppts(r.data));
      setAppts(res.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const { data } = await appointmentsApi.list();
        setAppts(prev => {
          const newLocks = data.filter(a => a.status === 'locked' && !prev.find(x => x.id === a.id));
          if (newLocks.length > 0) {
            newLocks.forEach(a => toast.push({ tone: 'lavender', title: 'Horario bloqueado', body: `Alguien está reservando el ${fmtDate(a.appointment_date)}` }));
          }
          return data;
        });
      } catch { /* silent */ }
    }, 20000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const apptAtSlot = (day: Date, hour: number, min: number) =>
    appts.find(a => { const d = parseApptDate(a.appointment_date); return sameDay(d, day) && d.getHours() === hour && d.getMinutes() === min; });

  const handleDelete = async (id: number) => {
    try {
      await appointmentsApi.delete(id);
      invalidate('appts');
      setAppts(a => a.filter(x => x.id !== id));
      setSelected(null);
      toast.push({ tone: 'sage', title: 'Cita eliminada' });
    } catch { toast.push({ tone: 'danger', title: 'Error al eliminar' }); }
  };

  const handleRemind = async (id: number) => {
    try {
      await appointmentsApi.remind(id);
      toast.push({ tone: 'sage', title: 'Recordatorio enviado', body: 'El paciente recibió el aviso.' });
    } catch { toast.push({ tone: 'danger', title: 'Error al enviar recordatorio' }); }
  };

  const handleConfirm = async (id: number) => {
    try {
      const { data: updated } = await appointmentsApi.update(id, { status: 'confirmed' });
      invalidate('appts');
      setAppts(a => a.map(x => x.id === id ? updated : x));
      setSelected(updated);
      toast.push({ tone: 'sage', title: 'Cita confirmada', body: 'El paciente ha sido notificado.' });
    } catch { toast.push({ tone: 'danger', title: 'Error al confirmar' }); }
  };

  const statusColor: Record<string, string> = {
    confirmed: 'var(--sage)', pending: 'var(--butter)',
    locked: 'var(--lavender)', cancelled: 'var(--hairline)', completed: 'var(--hairline)',
  };

  const SLOTS = Array.from({ length: 22 }, (_, i) => ({ hour: 8 + Math.floor(i / 2), min: (i % 2) * 30 }));

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tu <em>agenda</em></h1>
          <p className="page-subtitle">Horarios en lavanda están bloqueados por otro usuario</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoy</button>
          <button className="btn btn-primary" onClick={() => setCreating({ date: new Date().toLocaleDateString('sv'), hour: 9, min: 0 })}><Plus size={16} /> Nueva cita</button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={18} /></button>
          <div className="serif" style={{ fontSize: 17, fontWeight: 500, minWidth: 220, textAlign: 'center' }}>{fmtWeekRange(weekStart, addDays(weekStart, 6))}</div>
          <button className="btn-icon" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-soft)' }}>
          {[['sage', 'Confirmada'], ['butter', 'Pendiente'], ['lavender', 'Bloqueada']].map(([tone, label]) => (
            <span key={tone} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: `var(--${tone})`, display: 'inline-block' }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="resp-calendar-wrap">
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--hairline)' }}>
            <div />
            {days.map((d, i) => {
              const isToday = sameDay(d, new Date());
              return (
                <div key={i} style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', fontWeight: 500 }}>{d.toLocaleDateString('es-MX', { weekday: 'short' })}</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: isToday ? 'var(--ok)' : 'var(--ink)', marginTop: 2 }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          {SLOTS.map(({ hour, min }) => (
            <div key={`${hour}-${min}`} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: `1px solid ${min === 0 ? 'var(--hairline)' : 'transparent'}`, minHeight: 40 }}>
              <div style={{ padding: '10px 8px', fontSize: 11, color: min === 0 ? 'var(--muted)' : 'var(--hairline)', textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                {String(hour).padStart(2, '0')}:{String(min).padStart(2, '0')}
              </div>
              {days.map((day, di) => {
                const appt = apptAtSlot(day, hour, min);
                const isLocked = appt?.status === 'locked';
                return (
                  <div key={di} style={{ borderLeft: '1px solid var(--hairline)', padding: 3, position: 'relative' }}>
                    {appt ? (
                      <button style={{ width: '100%', padding: '5px 8px', borderRadius: 8, background: statusColor[appt.status] ?? 'var(--hairline)', textAlign: 'left', fontSize: 12, lineHeight: 1.3, position: 'relative', cursor: isLocked ? 'not-allowed' : 'pointer', opacity: appt.status === 'completed' ? 0.55 : 1 }}
                        onClick={() => !isLocked && setSelected(appt)}>
                        {isLocked && <Lock size={11} style={{ position: 'absolute', top: 5, right: 6, color: 'var(--locked)' }} />}
                        <div style={{ fontWeight: 600, color: 'var(--ink)', textDecoration: appt.status === 'completed' ? 'line-through' : 'none' }}>{appt.patient?.name?.split(' ')[0] ?? (isLocked ? 'Bloqueado' : '—')}</div>
                        <div style={{ color: 'var(--ink-soft)', fontSize: 11 }}>{appt.status === 'completed' ? 'Terminada' : appt.reason}</div>
                      </button>
                    ) : (
                      <button style={{ width: '100%', height: '100%', minHeight: 34, borderRadius: 8, opacity: 0, transition: 'opacity .2s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                        onClick={() => setCreating({ date: day.toLocaleDateString('sv'), hour, min })} title="Crear cita">
                        <div style={{ background: 'var(--bg-alt)', borderRadius: 8, height: '100%', display: 'grid', placeItems: 'center', minHeight: 34 }}><Plus size={14} color="var(--muted)" /></div>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <NewAppointmentModal open={!!creating} onClose={() => setCreating(null)} onCreated={appt => setAppts(a => [...a, appt])} initial={creating ?? undefined} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detalle de cita">
        {selected && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="resp-detail-2">
              <Info label="Paciente" value={selected.patient?.name ?? '—'} />
              <Info label="Fecha"   value={fmtDate(selected.appointment_date)} />
              <Info label="Motivo"  value={selected.reason} />
              <Info label="Estado"  value={{ pending: 'Por confirmar', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Terminada', locked: 'Bloqueada' }[selected.status] ?? selected.status} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => { setSelected(null); navigate(`/historia/${selected.patient_id}`); }}>Ver historia</button>
              {selected.patient_id && selected.status !== 'completed' && <button className="btn btn-secondary" onClick={() => handleRemind(selected.id)}><Bell size={14} /> Recordatorio</button>}
              {selected.status === 'pending' && <button className="btn btn-primary" onClick={() => handleConfirm(selected.id)}>Confirmar cita</button>}
              {selected.status !== 'completed' && <button className="btn btn-danger" style={{ padding: '9px 16px', borderRadius: 'var(--r-pill)' }} onClick={() => handleDelete(selected.id)}><X size={14} /> Cancelar cita</button>}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
