import { useState } from 'react';

interface Props {
  Icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function MenuBtn({ Icon, label, onClick, danger }: Props) {
  const [hov, setHov] = useState(false);
  return (
    <button
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        borderRadius: 10, fontSize: 13, color: danger ? 'var(--danger)' : 'var(--ink)',
        textAlign: 'left', width: '100%', transition: 'background .15s var(--ease)',
        background: hov ? 'var(--card-tint)' : 'transparent',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}>
      <Icon size={15} /> {label}
    </button>
  );
}
