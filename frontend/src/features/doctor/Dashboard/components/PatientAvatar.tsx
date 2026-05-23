import { initials, avatarColor } from '@/lib/utils';

interface Props { name: string; id: number; size?: number; }

export function PatientAvatar({ name, id, size = 40 }: Props) {
  const color = avatarColor(id);
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.28),
      background: `var(--${color})`,
      display: 'grid', placeItems: 'center',
      fontSize: Math.round(size * 0.36),
      fontWeight: 600, color: 'var(--ink)',
      flexShrink: 0, boxShadow: 'var(--shadow-xs)',
    }}>
      {initials(name)}
    </div>
  );
}
