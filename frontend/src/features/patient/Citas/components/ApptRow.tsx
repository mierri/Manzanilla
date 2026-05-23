import { Clock, Stethoscope, Calendar, Check } from 'lucide-react';
import { fmtTime, parseApptDate } from '@/lib/utils';
import type { Appointment } from '@/types';

const DAYS_SH   = ['dom','lun','mar','mié','jue','vie','sáb'];
const MONTHS_SH = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

interface Props {
  appt: Appointment;
  past: boolean;
  onCancel: () => void;
  onReschedule: () => void;
}

export function ApptRow({ appt: a, past, onCancel, onReschedule }: Props) {
  const d = parseApptDate(a.appointment_date);
  return (
    <div className="card lift" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center', padding: 16 }}>
      {/* Date block */}
      <div style={{ width: 64, textAlign: 'center', padding: '8px 0', background: past ? 'var(--card-tint)' : 'var(--sage)', borderRadius: 12 }}>
        <div style={{ fontSize: 10, color: past ? 'var(--muted)' : '#3C5A3F', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>{DAYS_SH[d.getDay()]}</div>
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>{d.getDate()}</div>
        <div style={{ fontSize: 10, color: past ? 'var(--muted)' : '#3C5A3F', marginTop: 2 }}>{MONTHS_SH[d.getMonth()]}</div>
      </div>
      {/* Info */}
      <div>
        <div className="serif" style={{ fontSize: 16, fontWeight: 500 }}>{a.reason || 'Consulta médica'}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4, fontSize: 12.5, color: 'var(--ink-soft)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={12} /> {fmtTime(a.appointment_date)} · {a.duration} min</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Stethoscope size={12} /> Tu médico</span>
          {!past && a.status !== 'completed' && <span className={`chip chip-${a.status === 'pending' ? 'butter' : 'sage'}`} style={{ padding: '2px 8px', fontSize: 11 }}>{a.status === 'pending' ? 'Por confirmar' : 'Confirmada'}</span>}
          {a.status === 'completed' && <span className="chip chip-ink" style={{ padding: '2px 8px', fontSize: 11 }}>Terminada</span>}
        </div>
      </div>
      {/* Actions */}
      {!past ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={onCancel}>Cancelar</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={onReschedule}><Calendar size={13} /> Reprogramar</button>
        </div>
      ) : (
        <span className="chip chip-sage" style={{ fontSize: 11, flexShrink: 0 }}><Check size={11} /> Completada</span>
      )}
    </div>
  );
}
