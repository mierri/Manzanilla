import { Edit, ChevronRight } from 'lucide-react';
import type { Patient } from '@/types';
import { PatientAvatar } from './PatientAvatar';
import { patientChip } from '../utils/helpers';

interface Props {
  patient: Patient;
  first: boolean;
  onView: () => void;
  onEdit: () => void;
}

export function PatientRow({ patient: p, first, onView, onEdit }: Props) {
  const chip = patientChip(p);
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'auto 2fr 1.5fr 1fr 1fr auto', gap: 18, alignItems: 'center', padding: '16px 22px', borderTop: first ? 'none' : '1px solid var(--hairline)', cursor: 'pointer', transition: 'background .2s var(--ease)' }}
      className="resp-patient-row"
      onClick={onView}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-tint)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <PatientAvatar patient={p} size={40} />
      <div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>@{p.username} · {p.age} años</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{p.phone || '—'}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
      <span className={`chip chip-${chip.tone}`}>{chip.label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={e => { e.stopPropagation(); onEdit(); }} title="Editar">
          <Edit size={13} />
        </button>
        <ChevronRight size={18} color="var(--muted)" />
      </div>
    </div>
  );
}
