import { Phone, Mail, MapPin, Check } from 'lucide-react';
import { initials, avatarColor } from '@/lib/utils';
import type { Patient } from '@/types';

function InfoRow({ Icon, label }: { Icon: React.ElementType; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
      <Icon size={15} color="var(--muted)" />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
  );
}

interface Props { patient: Patient; }

export function PatientSummaryCard({ patient: p }: Props) {
  const color = avatarColor(p.id);
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: `var(--${color})`, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initials(p.name)}
        </div>
        <div>
          <h3 className="serif" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.15 }}>{p.name}</h3>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
            {p.age} años · {p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : 'Otro'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        <span className="chip chip-butter"><Check size={11} /> {p.notes_count ? `${p.notes_count} consultas` : 'Sin consultas'}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {p.phone   && <InfoRow Icon={Phone}  label={p.phone} />}
        {p.email   && <InfoRow Icon={Mail}   label={p.email} />}
        {p.address && <InfoRow Icon={MapPin} label={p.address} />}
      </div>
    </div>
  );
}
