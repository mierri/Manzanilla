import { Clock, Stethoscope } from 'lucide-react';

interface Props { onBook: () => void; }

export function QuickBookPanel({ onBook }: Props) {
  return (
    <div className="card" style={{ padding: 0, height: 'fit-content' }}>
      <div style={{ padding: '16px 18px 12px' }}>
        <div className="section-title" style={{ marginBottom: 2 }}>Reservar nueva cita</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Elige la opción que más te convenga.</div>
      </div>
      <div style={{ padding: '0 14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Consulta de seguimiento', desc: 'Revisión de tratamiento o resultado' },
          { label: 'Primera vez',             desc: 'Consulta general o nueva queja' },
          { label: 'Urgencia',                desc: 'Prioridad alta, mismo día si hay espacio' },
        ].map((opt, i) => (
          <button key={i} onClick={onBook}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, padding: '12px 14px', borderRadius: 12, textAlign: 'left', width: '100%', background: 'var(--card-tint)', transition: 'all .2s var(--ease)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--card-tint)')}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{opt.label}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{opt.desc}</span>
          </button>
        ))}
      </div>
      <div style={{ margin: '0 14px 14px', padding: '12px 14px', background: 'var(--sage)', borderRadius: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#3C5A3F' }}><Clock size={14} /> Lun–Vie · 8am a 6pm</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#3C5A3F', marginTop: 4 }}><Stethoscope size={14} /> Consultorio Manzanilla</div>
      </div>
    </div>
  );
}
