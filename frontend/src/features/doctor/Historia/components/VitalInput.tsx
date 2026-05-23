interface Props {
  Icon: React.ElementType;
  label: string;
  unit: string;
  tone: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}

export function VitalInput({ Icon, label, unit, tone, hint, value, onChange }: Props) {
  return (
    <div className="card lift" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: `var(--${tone})`, display: 'grid', placeItems: 'center' }}>
          <Icon size={20} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{hint}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
          <input className="input" type="number" step="0.1" value={value} onChange={e => onChange(e.target.value)}
            style={{ fontFamily: '"Newsreader", serif', fontWeight: 500, fontSize: 22, padding: '4px 10px', width: 96, border: '1px solid var(--hairline)' }} />
          <span style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500 }}>{unit}</span>
        </div>
      </div>
    </div>
  );
}
