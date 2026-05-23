interface Props { label: string; value?: string; span?: boolean; }

export function DocField({ label, value, span }: Props) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 4 }}>{value || '—'}</div>
    </div>
  );
}
