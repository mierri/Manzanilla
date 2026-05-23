import { Clock, Lock, Stethoscope } from 'lucide-react';

export function DoctorCard() {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--ink)', display: 'grid', placeItems: 'center' }}>
          <Stethoscope size={22} color="#FFFCF6" />
        </div>
        <div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>Tu médico</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Médico general · Consultorio Manzanilla</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--ink-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={13} color="var(--muted)" /> Lun–Vie · 8am a 6pm</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={13} color="var(--muted)" /> Información confidencial</div>
      </div>
    </div>
  );
}
