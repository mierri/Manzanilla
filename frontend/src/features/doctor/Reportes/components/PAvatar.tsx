import { initials, avatarColor } from '@/lib/utils';
import type { Patient } from '@/types';

interface Props { patient: Patient; size?: number; }

export function PAvatar({ patient, size = 40 }: Props) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.28),
      background: `var(--${avatarColor(patient.id)})`,
      display: 'grid', placeItems: 'center',
      fontSize: Math.round(size * 0.34), fontWeight: 700, color: 'var(--ink)',
      flexShrink: 0, boxShadow: 'var(--shadow-xs)',
    }}>
      {initials(patient.name)}
    </div>
  );
}
