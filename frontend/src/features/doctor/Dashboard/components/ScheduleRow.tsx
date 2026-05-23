import { ChevronRight } from 'lucide-react';
import { fmtTime } from '@/lib/utils';
import type { Appointment } from '@/types';
import { PatientAvatar } from './PatientAvatar';

interface Props {
  appt: Appointment;
  accent: 'peach' | 'sage' | 'butter' | 'lavender';
  onClick: () => void;
}

export function ScheduleRow({ appt: a, accent, onClick }: Props) {
  return (
    <button
      style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, padding: '12px 14px', width: '100%', textAlign: 'left', borderRadius: 16, transition: 'background .2s var(--ease)', alignItems: 'center' }}
      onClick={onClick}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-tint)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {/* Time */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
        <span className="serif" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1 }}>{fmtTime(a.appointment_date)}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.duration} min</span>
      </div>
      {/* Patient */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <PatientAvatar name={a.patient?.name ?? '?'} id={a.patient_id ?? 0} size={38} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{a.patient?.name ?? 'Paciente'}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{a.reason}</div>
        </div>
      </div>
      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span className={`chip chip-${accent}`}>{a.status === 'pending' ? 'Por confirmar' : 'Confirmada'}</span>
        <ChevronRight size={18} color="var(--muted)" />
      </div>
    </button>
  );
}
