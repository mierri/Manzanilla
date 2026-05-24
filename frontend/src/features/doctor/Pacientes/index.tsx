import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, LayoutGrid, List } from 'lucide-react';
import { patientsApi } from '@/lib/api';
import { cached, invalidate } from '@/lib/cache';
import { useToast } from '@/app/ToastContext';
import { Modal } from '@/components/ui/Modal';
import type { Patient } from '@/types';
import { PatientCard } from './components/PatientCard';
import { PatientRow } from './components/PatientRow';
import { PatientForm } from './components/PatientForm';

export default function Pacientes() {
  const navigate = useNavigate();
  const toast   = useToast();
  const [patients,  setPatients]  = useState<Patient[]>([]);
  const [query,     setQuery]     = useState('');
  const [view,      setView]      = useState<'cards' | 'list'>('cards');
  const [filter,    setFilter]    = useState<'all' | 'active' | 'new'>('all');
  const [loading,   setLoading]   = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [editing,   setEditing]   = useState<Patient | null>(null);
  const [deleting,  setDeleting]  = useState<Patient | null>(null);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = q
        ? (await patientsApi.list(q)).data
        : await cached('patients', () => patientsApi.list(), r => setPatients(r.data)).then(r => r.data);
      setPatients(data);
    } catch { toast.push({ tone: 'danger', title: 'Error al cargar pacientes' }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(query), 300); return () => clearTimeout(t); }, [query]);

  const filtered = patients.filter(p => {
    if (filter === 'active' && !p.last_visit && !p.notes_count) return false;
    if (filter === 'new') {
      if (!p.last_visit) return false;
      const days = Math.round((Date.now() - new Date(p.last_visit).getTime()) / (1000 * 60 * 60 * 24));
      if (days > 30) return false;
    }
    return true;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await patientsApi.delete(deleting.id);
      invalidate('patients');
      setPatients(p => p.filter(x => x.id !== deleting.id));
      toast.push({ tone: 'sage', title: 'Paciente eliminado' });
    } catch { toast.push({ tone: 'danger', title: 'Error al eliminar' }); }
    setDeleting(null);
  };

  const handleSave = async (data: Partial<Patient> & { password?: string }) => {
    try {
      if (editing) {
        const { data: updated } = await patientsApi.update(editing.id, data);
        invalidate('patients');
        setPatients(p => p.map(x => x.id === editing.id ? updated : x));
        toast.push({ tone: 'sage', title: 'Cambios guardados', body: `Datos de ${editing.name.split(' ')[0]} actualizados` });
      } else {
        const { data: created } = await patientsApi.create(data as Patient & { password: string });
        invalidate('patients');
        setPatients(p => [...p, created]);
        toast.push({ tone: 'sage', title: 'Paciente registrado', body: 'El paciente ya puede iniciar sesion.' });
      }
      setCreating(false); setEditing(null);
    } catch { toast.push({ tone: 'danger', title: 'Error al guardar' }); }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tu <em>directorio</em> de pacientes</h1>
          <p className="page-subtitle">{filtered.length} pacientes · ordenados por ultima visita</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary"><Download size={16} /> Exportar</button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Nuevo paciente</button>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        <div className="input-pill" style={{ flex: 1, minWidth: 200 }}>
          <span className="icon-prefix"><Search size={18} /></span>
          <input className="input" placeholder="Buscar por nombre o usuario…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', padding: 4, borderRadius: 999 }}>
          {([
            { id: 'all',    label: 'Todos'           },
            { id: 'active', label: 'Con seguimiento' },
            { id: 'new',    label: 'Recientes'       },
          ] as const).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: filter === f.id ? 'var(--ink)' : 'transparent', color: filter === f.id ? 'var(--bg-warm-white)' : 'var(--ink-soft)', transition: 'all .2s var(--ease)' }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', padding: 3, borderRadius: 12 }}>
          {([['cards', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)}
              style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 9, background: view === v ? '#fff' : 'transparent', color: view === v ? 'var(--ink)' : 'var(--muted)', boxShadow: view === v ? 'var(--shadow-xs)' : 'none', transition: 'all .2s var(--ease)' }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Cargando pacientes…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>No se encontraron pacientes</div>
      ) : view === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(248px, 1fr))', gap: 16 }} className="resp-patients-5">
          {filtered.map(p => (
            <PatientCard key={p.id} patient={p}
              onView={() => navigate(`/historia/${p.id}`)}
              onEdit={() => setEditing(p)}
              onDelete={() => setDeleting(p)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((p, i) => (
            <PatientRow key={p.id} patient={p} first={i === 0}
              onView={() => navigate(`/historia/${p.id}`)}
              onEdit={() => setEditing(p)}
            />
          ))}
        </div>
      )}

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); }} title={creating ? 'Nuevo paciente' : `Editar ${editing?.name.split(' ')[0]}`} maxWidth={560}>
        <PatientForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null); }} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar paciente">
        <p style={{ color: 'var(--ink-soft)' }}>
          Esta accion elimina a <strong>{deleting?.name}</strong> de forma permanente.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
