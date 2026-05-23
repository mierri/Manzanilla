import { useState } from 'react';
import { Edit, Trash2, MoreVertical, Calendar, Users } from 'lucide-react';
import { initials, avatarColor } from '@/lib/utils';
import type { User } from '@/types';
import { MenuBtn } from './MenuBtn';

type DoctorWithCount = User & { appointment_count?: number };

interface Props {
  doctor: DoctorWithCount;
  onEdit: () => void;
  onDelete: () => void;
  onManagePatients: () => void;
}

export function DoctorCard({ doctor: d, onEdit, onDelete, onManagePatients }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const color = avatarColor(d.id);

  return (
    <div className="card lift" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 56, height: 56, borderRadius: Math.round(56 * 0.28), background: `var(--${color})`, display: 'grid', placeItems: 'center', fontSize: Math.round(56 * 0.34), fontWeight: 700, color: 'var(--ink)', flexShrink: 0, boxShadow: 'var(--shadow-xs)' }}>
          {initials(d.name)}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}>
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 11, background: '#fff', borderRadius: 14, padding: 6, boxShadow: 'var(--shadow-md)', minWidth: 160, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MenuBtn Icon={Edit}   label="Editar datos"    onClick={() => { setMenuOpen(false); onEdit(); }} />
                <MenuBtn Icon={Users}  label="Ver pacientes"   onClick={() => { setMenuOpen(false); onManagePatients(); }} />
                <MenuBtn Icon={Trash2} label="Eliminar"        onClick={() => { setMenuOpen(false); onDelete(); }} danger />
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="serif" style={{ fontSize: 17, fontWeight: 500 }}>{d.name}</h3>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
          @{d.username} · {(d as User & { speciality?: string }).speciality || 'Medicina general'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--ink-soft)' }}>
        {d.email && <div>{d.email}</div>}
        {d.phone && <div>{d.phone}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--hairline)', marginTop: 'auto' }}>
        <span className="chip chip-lavender"><Calendar size={11} /> {d.appointment_count ?? 0} citas</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Médico activo</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: 12.5 }} onClick={onManagePatients}>
          <Users size={13} /> Pacientes
        </button>
        <button className="btn btn-primary" style={{ justifyContent: 'center', fontSize: 12.5, background: '#4B3B68', boxShadow: '0 6px 16px -6px rgba(75,59,104,0.4)' }} onClick={onEdit}>
          <Edit size={13} /> Editar
        </button>
      </div>
    </div>
  );
}
