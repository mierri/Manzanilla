import { useState, useEffect } from 'react';
import { Search, UserPlus, UserMinus, Users } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { useToast } from '@/app/ToastContext';
import { initials, avatarColor } from '@/lib/utils';
import type { User } from '@/types';

interface Props {
  doctor: User;
  open: boolean;
  onClose: () => void;
}

type PatientBasic = Pick<User, 'id' | 'name' | 'username' | 'email' | 'age' | 'sex'>;

export function DoctorPatientsModal({ doctor, open, onClose }: Props) {
  const toast = useToast();
  const [associated, setAssociated] = useState<PatientBasic[]>([]);
  const [allPatients, setAllPatients] = useState<PatientBasic[]>([]);
  const [query, setQuery]   = useState('');
  const [tab, setTab]       = useState<'asociados' | 'agregar'>('asociados');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      adminApi.getDoctorPatients(doctor.id),
      adminApi.listPatients(),
    ]).then(([assocRes, allRes]) => {
      setAssociated(assocRes.data as PatientBasic[]);
      setAllPatients(allRes.data as PatientBasic[]);
    }).finally(() => setLoading(false));
  }, [open, doctor.id]);

  const associatedIds = new Set(associated.map(p => p.id));

  const filtered = allPatients.filter(p => {
    if (tab === 'agregar' && associatedIds.has(p.id)) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q);
  });

  const associate = async (patient: PatientBasic) => {
    setWorking(patient.id);
    try {
      await adminApi.associatePatient(doctor.id, patient.id);
      setAssociated(prev => [...prev, patient]);
      toast.push({ tone: 'sage', title: `${patient.name.split(' ')[0]} asociado/a` });
    } catch {
      toast.push({ tone: 'danger', title: 'Error al asociar' });
    } finally { setWorking(null); }
  };

  const deassociate = async (patient: PatientBasic) => {
    setWorking(patient.id);
    try {
      await adminApi.deassociatePatient(doctor.id, patient.id);
      setAssociated(prev => prev.filter(p => p.id !== patient.id));
      toast.push({ tone: 'sage', title: `Asociación eliminada` });
    } catch {
      toast.push({ tone: 'danger', title: 'Error al eliminar asociación' });
    } finally { setWorking(null); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Pacientes de ${doctor.name.split(' ')[0]}`} maxWidth={520}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--card-tint)', padding: 4, borderRadius: 12, marginBottom: 16 }}>
        {([
          { id: 'asociados', label: `Asociados (${associated.length})` },
          { id: 'agregar',   label: 'Agregar paciente' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setQuery(''); }}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 9, fontSize: 13, fontWeight: 500,
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? 'var(--ink)' : 'var(--ink-soft)',
              boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all .2s var(--ease)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="input-pill" style={{ marginBottom: 14 }}>
        <span className="icon-prefix"><Search size={17} /></span>
        <input className="input" placeholder="Buscar paciente…" value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 340, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
            <Users size={28} style={{ margin: '0 auto 8px', opacity: 0.4, display: 'block' }} />
            {tab === 'asociados' ? 'Sin pacientes asociados' : 'No se encontraron pacientes'}
          </div>
        ) : (
          (tab === 'asociados' ? associated.filter(p => {
            if (!query) return true;
            const q = query.toLowerCase();
            return p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q);
          }) : filtered).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--card-tint)', transition: 'background .2s var(--ease)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hairline)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--card-tint)')}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `var(--${avatarColor(p.id)})`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {initials(p.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>@{p.username}{p.age ? ` · ${p.age} años` : ''}</div>
              </div>
              {tab === 'asociados' ? (
                <button className="btn btn-ghost" style={{ fontSize: 12.5, padding: '5px 10px', color: 'var(--danger)', flexShrink: 0 }}
                  disabled={working === p.id}
                  onClick={() => deassociate(p)}>
                  <UserMinus size={14} /> {working === p.id ? '…' : 'Quitar'}
                </button>
              ) : (
                <button className="btn btn-primary" style={{ fontSize: 12.5, padding: '5px 12px', background: '#4B3B68', flexShrink: 0 }}
                  disabled={working === p.id}
                  onClick={() => associate(p)}>
                  <UserPlus size={14} /> {working === p.id ? '…' : 'Agregar'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
