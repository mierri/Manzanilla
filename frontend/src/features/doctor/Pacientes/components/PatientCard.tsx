import { useRef, useState } from 'react';
import { FileText, Edit, Trash2, MoreVertical, ArrowRight, Phone } from 'lucide-react';
import type { Patient } from '@/types';
import { PatientAvatar } from './PatientAvatar';
import { MenuBtn } from './MenuBtn';
import { daysSince, patientChip } from '../utils/helpers';

interface Props {
  patient: Patient;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PatientCard({ patient: p, onView, onEdit, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const chip = patientChip(p);

  return (
    <div className="card lift" style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PatientAvatar patient={p} size={56} />
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button className="btn-icon" style={{ width: 32, height: 32 }}
            onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}>
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setMenuOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 11, background: '#fff', borderRadius: 14, padding: 6, boxShadow: 'var(--shadow-md)', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MenuBtn Icon={FileText} label="Ver historia" onClick={() => { setMenuOpen(false); onView(); }} />
                <MenuBtn Icon={Edit}     label="Editar datos" onClick={() => { setMenuOpen(false); onEdit(); }} />
                <MenuBtn Icon={Trash2}   label="Eliminar"     onClick={() => { setMenuOpen(false); onDelete(); }} danger />
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="serif" style={{ fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.name}</h3>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>
          {p.age} años · {p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : 'Otro'} · @{p.username}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-soft)' }}>
          <Phone size={12} /> {p.phone || '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden' }}>
          ✉️ <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--hairline)' }}>
        <span className={`chip chip-${chip.tone}`}>{chip.label}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{daysSince(p.last_visit)}</span>
      </div>

      <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '10px 14px', fontSize: 13 }} onClick={onView}>
        Abrir historia <ArrowRight size={14} />
      </button>
    </div>
  );
}
