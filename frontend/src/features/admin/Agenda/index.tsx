import { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { parseApptDate } from '@/lib/utils';
import type { Appointment, User } from '@/types';
import { ApptRow } from './components/ApptRow';

type ApptWithNames = Appointment & {
  patient?: Pick<User, 'id' | 'name' | 'username'>;
  doctor?:  Pick<User, 'id' | 'name'>;
};

export default function AdminAgenda() {
  const [appts,   setAppts]   = useState<ApptWithNames[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorFilter, setDoctorFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Carga médicos una sola vez al montar
  useEffect(() => {
    adminApi.listDoctors().then(r => setDoctors(r.data));
  }, []);

  // Carga citas al cambiar filtros
  useEffect(() => {
    setLoading(true);
    adminApi.listAppointments({
      ...(doctorFilter ? { doctor_id: doctorFilter as number } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    })
      .then(r => setAppts(r.data as ApptWithNames[]))
      .finally(() => setLoading(false));
  }, [doctorFilter, statusFilter]);

  const upcoming = appts
    .filter(a => parseApptDate(a.appointment_date) >= new Date() && a.status !== 'cancelled')
    .sort((a, b) => parseApptDate(a.appointment_date).getTime() - parseApptDate(b.appointment_date).getTime());
  const past = appts
    .filter(a => parseApptDate(a.appointment_date) < new Date())
    .sort((a, b) => parseApptDate(b.appointment_date).getTime() - parseApptDate(a.appointment_date).getTime());

  const totalShown = appts.filter(a => a.status !== 'cancelled').length;

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda <em>global</em></h1>
          <p className="page-subtitle">{totalShown} citas · todos los médicos del consultorio</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <Filter size={16} color="var(--muted)" />
        <div className="field" style={{ flex: 1, minWidth: 180, margin: 0 }}>
          <select className="select" value={doctorFilter} onChange={e => setDoctorFilter(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todos los médicos</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ flex: 1, minWidth: 160, margin: 0 }}>
          <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pending">Por confirmar</option>
            <option value="confirmed">Confirmadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{appts.length} resultados</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Cargando…</div>
      ) : appts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <Calendar size={32} style={{ marginBottom: 12, opacity: 0.4, margin: '0 auto 12px' }} />
          <p>Sin citas con los filtros actuales</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {upcoming.length > 0 && (
            <div>
              <div className="section-title">Próximas <span className="count">{upcoming.length}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcoming.map(a => <ApptRow key={a.id} appt={a} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <div className="section-title">Anteriores <span className="count">{past.length}</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {past.slice(0, 50).map(a => <ApptRow key={a.id} appt={a} past />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
