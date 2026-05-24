import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Heart, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useToast } from '@/app/ToastContext';
import { appointmentsApi, recordsApi } from '@/lib/api';
import { cached } from '@/lib/cache';
import { fmtTime, fmtDate, parseApptDate } from '@/lib/utils';
import type { Appointment, ClinicalRecord } from '@/types';
import { BookAppointmentDialog } from '@/features/appointments/BookAppointmentDialog';
import { NextAppointmentCard } from './components/NextAppointmentCard';
import { DoctorCard } from './components/DoctorCard';

const DAYS_ES   = ['dom','lun','mar','mié','jue','vie','sáb'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function fmtNextAppt(dateStr: string) {
  const d = parseApptDate(dateStr);
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]} a las ${fmtTime(dateStr)}`;
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [appts,   setAppts]   = useState<Appointment[]>([]);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  const reload = () => {
    if (!user) return;
    Promise.all([
      cached('pat-appts',            () => appointmentsApi.list(),         r => setAppts(r.data)),
      cached(`pat-records-${user.id}`,() => recordsApi.list(user.id),      r => setRecords(r.data)),
    ]).then(([a, r]) => { setAppts(a.data); setRecords(r.data); })
      .finally(() => setLoading(false));
  };

  useEffect(reload, [user]);

  const now      = new Date();
  const upcoming = appts
    .filter(a => parseApptDate(a.appointment_date) >= now && a.status !== 'cancelled')
    .sort((a, b) => parseApptDate(a.appointment_date).getTime() - parseApptDate(b.appointment_date).getTime());
  const next = upcoming[0];
  const pastCount = appts.filter(a => parseApptDate(a.appointment_date) < now).length;

  const recentRecords = [...records]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const meds: string[] = [];
  const latestPrescription = recentRecords.find(r => r.prescriptions)?.prescriptions ?? '';
  if (latestPrescription) {
    latestPrescription.split(/\r?\n/).map(l => l.trim()).filter(Boolean).slice(0, 2).forEach(m => meds.push(m));
  }

  const stats = [
    { label: 'Próximas citas',   value: upcoming.length, sub: 'este mes',         Icon: Calendar, tone: 'sage',   action: () => navigate('/citas')    },
    { label: 'Visitas en el año', value: pastCount,       sub: 'consultas previas', Icon: FileText, tone: 'butter', action: () => navigate('/historia') },
    { label: 'Consultas totales', value: records.length,  sub: 'historial clínico', Icon: Heart,    tone: 'blush',  action: () => navigate('/historia') },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <span className="role-stripe"><span className="dot" /> Portal paciente</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>Hola, <em>{user?.name.split(' ')[0]}</em></h1>
          <p className="page-subtitle">
            {next
              ? <>Tu próxima cita es el <span className="serif-italic">{fmtNextAppt(next.appointment_date)}</span> — todo en orden</>
              : 'Bienvenida a tu portal de salud'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/historia')}><FileText size={16} /> Mi historia</button>
          <button className="btn btn-primary" onClick={() => setBookingOpen(true)}><Plus size={16} /> Agendar cita</button>
        </div>
      </div>

      {next && (
        <NextAppointmentCard appt={next} onReschedule={() => navigate('/citas')}
          onCancel={async () => {
            try {
              await appointmentsApi.delete(next.id);
              reload();
              toast.push({ tone: 'sage', title: 'Cita cancelada', body: 'Avisaremos al consultorio' });
            } catch {
              toast.push({ tone: 'danger', title: 'No se pudo cancelar' });
            }
          }}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }} className="resp-pac-stats-3">
        {stats.map((s, i) => (
          <button key={i} className="card lift" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, textAlign: 'left', width: '100%' }} onClick={s.action}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{s.label}</div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 4, lineHeight: 1 }}>{loading ? '…' : s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>{s.sub}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `var(--${s.tone})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><s.Icon size={18} /></div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }} className="resp-main-2">
        {/* Recent history */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>Lo último de tu salud <span className="count">{recentRecords.length} consultas</span></div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Resumen de tus últimas consultas</div>
            </div>
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/historia')}>Ver historia</button>
          </div>
          <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!loading && recentRecords.length === 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>Sin consultas registradas aún.</div>}
            {recentRecords.map((r, i) => (
              <button key={i} style={{ display: 'flex', gap: 12, padding: '12px 8px', borderRadius: 12, transition: 'background .2s var(--ease)', textAlign: 'left', width: '100%' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => navigate('/historia')}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sage)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><FileText size={14} color="#3C5A3F" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.diagnosis?.split('.')[0] || 'Consulta'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{fmtDate(r.created_at)}</div>
                  {r.analysis_results && <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.analysis_results}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DoctorCard />
          <div className="card-soft" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -16, top: -16, opacity: 0.25 }}><img src="/flor.svg" width={100} height={100} aria-hidden /></div>
            <div style={{ position: 'relative' }}>
              <span className="chip chip-sage" style={{ marginBottom: 10 }}><Sparkles size={11} /> Recordatorio</span>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.3, fontWeight: 500, maxWidth: 240 }}>
                {meds.length > 0
                  ? <><em style={{ color: 'var(--sage-deep)' }}>{meds[0].split(/\s+/).slice(0, 3).join(' ')}</em> · sigue tu plan.</>
                  : <>Revisa tus <em style={{ color: 'var(--sage-deep)' }}>indicaciones</em> con tu médico.</>
                }
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8 }}>Mantén tu tratamiento al día. ¡Vas muy bien!</p>
            </div>
          </div>
        </div>
      </div>

      {meds.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="section-title">Tus indicaciones <span className="count">activas</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="resp-pac-stats-3">
            {meds.map((med, i) => (
              <div key={i} className="card lift" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: i === 0 ? 'var(--peach)' : 'var(--butter)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Heart size={20} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 16, fontWeight: 500 }}>{med}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>Según indicación de tu médico</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BookAppointmentDialog open={bookingOpen} onClose={() => setBookingOpen(false)} onCreated={reload} />
    </div>
  );
}
