import { initials, avatarColor } from '@/lib/utils';
import type { Patient } from '@/types';

interface Props {
  patients: Patient[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export function PatientPickerCard({ patients, activeId, onSelect }: Props) {
  return (
    <div className="card-soft" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Cambiar paciente
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {patients.slice(0, 6).map(p => (
          <button key={p.id} onClick={() => onSelect(p.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, textAlign: 'left', width: '100%', background: activeId === p.id ? 'var(--card)' : 'transparent', boxShadow: activeId === p.id ? 'var(--shadow-xs)' : 'none', transition: 'all .2s var(--ease)' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `var(--${avatarColor(p.id)})`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {initials(p.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.age} años</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
