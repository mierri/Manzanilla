import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Users, Calendar, BarChart2, Plus, Clock } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { adminApi } from '@/lib/api';
import { cached } from '@/lib/cache';
import { fmtTime } from '@/lib/utils';
import type { Appointment } from '@/types';

interface Stats {
  doctor_count: number; patient_count: number;
  today_count: number;  month_count: number;
  today_list: Appointment[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cached('admin-stats', () => adminApi.stats(), r => setStats(r.data))
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const statCards = [
    { label: 'Médicos activos',   value: stats?.doctor_count,  sub: 'en el consultorio', Icon: Stethoscope, tone: 'lavender', action: () => navigate('/medicos')   },
    { label: 'Pacientes totales', value: stats?.patient_count, sub: 'registrados',        Icon: Users,       tone: 'sage',     action: () => navigate('/pacientes') },
    { label: 'Citas hoy',         value: stats?.today_count,   sub: 'todos los médicos',  Icon: Calendar,    tone: 'peach',    action: () => navigate('/agenda')    },
    { label: 'Citas este mes',    value: stats?.month_count,   sub: 'en el consultorio',  Icon: BarChart2,   tone: 'butter',   action: () => {}                      },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, <em>{user?.name.split(' ')[0]}</em></h1>
          <p className="page-subtitle">Panel de administración · {now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/medicos')}><Stethoscope size={16} /> Médicos</button>
          <button className="btn btn-primary" onClick={() => navigate('/medicos')}><Plus size={16} /> Nuevo médico</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }} className="resp-stats-4">
        {statCards.map((s, i) => (
          <button key={i} className="card lift" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, textAlign: 'left', width: '100%' }} onClick={s.action}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{s.label}</div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 500, marginTop: 4, lineHeight: 1 }}>{loading ? '…' : (s.value ?? 0)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8 }}>{s.sub}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `var(--${s.tone})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><s.Icon size={18} /></div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }} className="resp-main-2">
        {/* Today's appointments */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>Citas de hoy <span className="count">{stats?.today_list.length ?? 0} en total</span></div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Todos los médicos · {now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
            <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/agenda')}>Ver agenda global</button>
          </div>
          <div style={{ padding: '0 14px 18px' }}>
            {loading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Cargando…</div>
            ) : !stats?.today_list.length ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>Sin citas para hoy</div>
            ) : (
              stats.today_list.slice(0, 8).map((a, i) => (
                <div key={a.id} style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', gap: 12, padding: '10px 8px', borderRadius: 12, alignItems: 'center', borderBottom: i < Math.min(stats.today_list.length, 8) - 1 ? '1px solid var(--hairline)' : 'none' }}>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)', width: 52 }}>{fmtTime(a.appointment_date)}</span>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${(['peach','sage','butter','lavender'] as const)[i % 4]}-deep)` }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{(a as any).patient?.name ?? 'Paciente'}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{(a as any).doctor?.name ?? 'Médico'} · {a.reason}</div>
                  </div>
                  <span className={`chip chip-${a.status === 'confirmed' ? 'sage' : 'butter'}`} style={{ fontSize: 11 }}>
                    {a.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick actions + bienestar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Acciones rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Agregar médico', desc: 'Crear nueva cuenta de médico',   Icon: Stethoscope, action: () => navigate('/medicos')   },
                { label: 'Ver pacientes', desc: 'Directorio de pacientes',          Icon: Users,       action: () => navigate('/pacientes') },
                { label: 'Agenda global', desc: 'Todas las citas del consultorio',  Icon: Calendar,    action: () => navigate('/agenda')    },
              ].map((q, i) => (
                <button key={i} onClick={q.action}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, textAlign: 'left', width: '100%', background: 'var(--card-tint)', transition: 'all .2s var(--ease)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--lavender)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--card-tint)')}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--lavender)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><q.Icon size={16} color="#4B3B68" /></div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{q.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{q.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card-soft" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -16, top: -16, opacity: 0.25 }}><img src="/flor.svg" width={100} height={100} aria-hidden /></div>
            <div style={{ position: 'relative' }}>
              <span className="chip chip-lavender" style={{ marginBottom: 10 }}><Clock size={11} /> Sistema</span>
              <div className="serif" style={{ fontSize: 17, lineHeight: 1.3, fontWeight: 500 }}>
                {stats?.doctor_count ?? 0} médico{(stats?.doctor_count ?? 0) !== 1 ? 's' : ''} y {stats?.patient_count ?? 0} paciente{(stats?.patient_count ?? 0) !== 1 ? 's' : ''} registrados.
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8 }}>Consultorio Manzanilla · administración activa.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
