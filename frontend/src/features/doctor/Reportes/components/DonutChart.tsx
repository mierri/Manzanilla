interface Segment { pct: number; tone: string; }
interface Props { segments: Segment[]; total: number; }

export function DonutChart({ segments, total }: Props) {
  const R = 70; const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 4px' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={R} fill="none" stroke="var(--bg)" strokeWidth="20" />
        {segments.map((s, i) => {
          const len = (s.pct / 100) * C;
          const off = C - acc;
          acc += len;
          return (
            <circle key={i} cx="90" cy="90" r={R} fill="none"
              stroke={`var(${s.tone})`} strokeWidth="20"
              strokeDasharray={`${len} ${C}`} strokeDashoffset={off}
              transform="rotate(-90 90 90)" strokeLinecap="butt" />
          );
        })}
        <text x="90" y="86" textAnchor="middle" fontFamily="Newsreader, serif" fontWeight="500" fontSize="28" fill="var(--ink)">{total}</text>
        <text x="90" y="106" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fill="var(--ink-soft)">citas este mes</text>
      </svg>
    </div>
  );
}
