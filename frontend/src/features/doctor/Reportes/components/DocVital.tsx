interface Props { label: string; value: string; }

export function DocVital({ label, value }: Props) {
  return (
    <div style={{ background: 'var(--card-tint)', borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{label}</div>
      <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}
