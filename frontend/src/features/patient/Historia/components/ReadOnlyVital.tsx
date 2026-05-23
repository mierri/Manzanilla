interface Props { label: string; value: number | string; unit: string; }

export function ReadOnlyVital({ label, value, unit }: Props) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '10px 12px', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
        <span className="serif" style={{ fontSize: 18, fontWeight: 500 }}>{value ?? '—'}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{unit}</span>
      </div>
    </div>
  );
}
