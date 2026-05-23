import { Calendar, Clock, Check } from 'lucide-react';
import { fmtTime, parseApptDate } from '@/lib/utils';
import type { Appointment } from '@/types';

const DAYS_ES   = ['dom','lun','mar','mié','jue','vie','sáb'];
const MONTHS_SH = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

interface Props {
  appt: Appointment;
  onReschedule: () => void;
  onCancel: () => void;
}

export function NextAppointmentCard({ appt, onReschedule, onCancel }: Props) {
  const d = parseApptDate(appt.appointment_date);
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--sage) 0%, #C5D9B7 100%)',
      borderRadius: 18, padding: 22, marginBottom: 18, boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ position: 'absolute', right: -10, bottom: -30, opacity: 0.28 }}>
        <img src="/flor.svg" width={160} height={160} aria-hidden />
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center' }} className="resp-next-hero-inner">
        {/* Date block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 88, padding: '12px 0', background: 'rgba(255,252,246,0.7)', borderRadius: 14, backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: 11, color: '#3C5A3F', textTransform: 'uppercase', letterSpacing: '.15em', fontWeight: 600 }}>{DAYS_ES[d.getDay()]}</div>
          <div className="serif" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1, color: 'var(--ink)' }}>{d.getDate()}</div>
          <div style={{ fontSize: 11, color: '#3C5A3F', fontWeight: 500 }}>{MONTHS_SH[d.getMonth()]}</div>
        </div>
        {/* Details */}
        <div style={{ minWidth: 0 }}>
          <span className="chip chip-sage" style={{ marginBottom: 8 }}><Check size={11} /> Confirmada</span>
          <div className="serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.2 }}>
            {appt.reason || 'Consulta médica'} con tu <em style={{ color: 'var(--sage-deep)' }}>médico</em>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, fontSize: 13, color: 'var(--ink-soft)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} color="var(--muted)" /> {fmtTime(appt.appointment_date)} · {appt.duration} min
            </span>
          </div>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-primary"
            style={{ background: '#3C5A3F', boxShadow: '0 2px 0 rgba(0,0,0,0.04), 0 6px 16px -6px rgba(60,90,63,0.5)' }}
            onClick={onReschedule}>
            <Calendar size={14} /> Reprogramar
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 12.5, justifyContent: 'center' }} onClick={onCancel}>
            Cancelar cita
          </button>
        </div>
      </div>
    </div>
  );
}
