interface Props { state: 'idle' | 'dirty' | 'saved'; }

export function SaveBadge({ state }: Props) {
  if (state === 'idle') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--sage)', borderRadius: 999 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', animation: state === 'dirty' ? 'dot-pulse 1s ease-in-out infinite' : 'none' }} />
      <span style={{ fontSize: 12.5, fontWeight: 500, color: '#3C5A3F' }}>
        {state === 'dirty' ? 'Guardando…' : 'Guardado hace un momento'}
      </span>
    </div>
  );
}
