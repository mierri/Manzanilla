import { Clock, Stethoscope, Bell } from 'lucide-react';
import { fmtTime, fmtDate, parseApptDate, initials, avatarColor } from '@/lib/utils';
import { appointmentsApi } from '@/lib/api';
import { useToast } from '@/app/ToastContext';
import type { Appointment, User } from '@/types';

type ApptWithNames = Appointment & {
  patient?: Pick<User, 'id' | 'name' | 'username'>;
  doctor?:  Pick<User, 'id' | 'name'>;
};

const DAYS_SH   = ['dom','lun','mar','mié','jue','vie','sáb'];
const MONTHS_SH = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

interface Props { appt: ApptWithNames; past?: boolean; }

export function ApptRow({ appt: a, past }: Props) {
  const toast    = useToast();
  const d        = parseApptDate(a.appointment_date);
  const patColor = avatarColor(a.patient_id ?? 0);

  const handleRemind = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await appointmentsApi.remind(a.id);
      toast.push({ tone: 'sage', title: 'Recordatorio enviado', body: `Avisado a ${a.patient?.name ?? 'paciente'}.` });
    } catch { toast.push({ tone: 'danger', title: 'Error al enviar recordatorio' }); }
  };

  return (
    <div className="card lift" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 18, alignItems: 'center', padding: 16 }}>
      <div style={{ width: 64, textAlign: 'center', padding: '8px 0', background: past ? 'var(--card-tint)' : 'var(--lavender)', borderRadius: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: past ? 'var(--muted)' : '#4B3B68', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>{DAYS_SH[d.getDay()]}</div>
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>{d.getDate()}</div>
        <div style={{ fontSize: 10, color: past ? 'var(--muted)' : '#4B3B68', marginTop: 2 }}>{MONTHS_SH[d.getMonth()]}</div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `var(--${patColor})`, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
            {initials(a.patient?.name ?? '?')}
          </div>
          <div className="serif" style={{ fontSize: 15, fontWeight: 500 }}>{a.patient?.name ?? 'Paciente'}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12.5, color: 'var(--ink-soft)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {fmtTime(a.appointment_date)} · {a.duration} min</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Stethoscope size={12} /> {a.doctor?.name ?? 'Médico'}</span>
          {a.reason && <span style={{ color: 'var(--muted)' }}>{a.reason}</span>}
        </div>
      </div>
      <span className={`chip chip-${a.status === 'confirmed' ? 'sage' : a.status === 'cancelled' ? 'blush' : a.status === 'completed' ? 'ink' : 'butter'}`} style={{ fontSize: 11, flexShrink: 0 }}>
        {a.status === 'confirmed' ? 'Confirmada' : a.status === 'cancelled' ? 'Cancelada' : a.status === 'completed' ? 'Terminada' : 'Por confirmar'}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(a.appointment_date)}</div>
        {a.patient_id && a.status !== 'cancelled' && (
          <button className="btn-ghost" style={{ fontSize: 11, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={handleRemind}>
            <Bell size={11} /> Recordatorio
          </button>
        )}
      </div>
    </div>
  );
}
