import { useState, useEffect } from 'react';
import { Plus, Stethoscope } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cached, invalidate } from '@/lib/cache';
import { useToast } from '@/app/ToastContext';
import { Modal } from '@/components/ui/Modal';
import type { User } from '@/types';
import { DoctorCard } from './components/DoctorCard';
import { DoctorForm } from './components/DoctorForm';
import { DoctorPatientsModal } from './components/DoctorPatientsModal';

type DoctorWithCount = User & { appointment_count?: number };

export default function AdminMedicos() {
  const toast = useToast();
  const [doctors,  setDoctors]  = useState<DoctorWithCount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [creating,        setCreating]        = useState(false);
  const [editing,         setEditing]         = useState<DoctorWithCount | null>(null);
  const [deleting,        setDeleting]        = useState<DoctorWithCount | null>(null);
  const [managingPatients,setManagingPatients]= useState<DoctorWithCount | null>(null);
  const [formError, setFormError] = useState('');

  const load = () =>
    cached('admin-doctors', () => adminApi.listDoctors(), r => setDoctors(r.data as DoctorWithCount[]))
      .then(r => setDoctors(r.data as DoctorWithCount[]))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async (data: Partial<User> & { password?: string }) => {
    setFormError('');
    try {
      if (editing) {
        const { data: updated } = await adminApi.updateDoctor(editing.id, data);
        invalidate('admin-doctors');
        setDoctors(d => d.map(x => x.id === editing.id ? { ...x, ...updated } : x));
        toast.push({ tone: 'sage', title: 'Medico actualizado' });
        setEditing(null);
      } else {
        const { data: created } = await adminApi.createDoctor(data as User & { password: string });
        invalidate('admin-doctors');
        setDoctors(d => [...d, created as DoctorWithCount]);
        toast.push({ tone: 'sage', title: 'Medico registrado', body: 'El medico ya puede iniciar sesion.' });
        setCreating(false);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errors = e?.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : undefined;
      setFormError(firstError ?? e?.response?.data?.message ?? 'Error al guardar. Verifica los campos.');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteDoctor(deleting.id);
      invalidate('admin-doctors');
      setDoctors(d => d.filter(x => x.id !== deleting.id));
      toast.push({ tone: 'sage', title: 'Medico eliminado' });
    } catch { toast.push({ tone: 'danger', title: 'Error al eliminar' }); }
    setDeleting(null);
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion de <em>medicos</em></h1>
          <p className="page-subtitle">{doctors.length} medicos registrados en el consultorio</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Nuevo medico</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Cargando…</div>
      ) : doctors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <Stethoscope size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>Sin medicos registrados. Agrega el primero.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {doctors.map(d => <DoctorCard key={d.id} doctor={d} onEdit={() => setEditing(d)} onDelete={() => setDeleting(d)} onManagePatients={() => setManagingPatients(d)} />)}
        </div>
      )}

      <Modal open={creating || !!editing} onClose={() => { setCreating(false); setEditing(null); setFormError(''); }}
        title={creating ? 'Nuevo medico' : `Editar ${editing?.name.split(' ')[0]}`} maxWidth={560}>
        <DoctorForm initial={editing ?? undefined} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null); setFormError(''); }} error={formError} />
      </Modal>

      {managingPatients && (
        <DoctorPatientsModal
          doctor={managingPatients}
          open={!!managingPatients}
          onClose={() => setManagingPatients(null)}
        />
      )}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Eliminar medico">
        <p style={{ color: 'var(--ink-soft)' }}>
          Sus citas y registros se mantendran, pero no podra iniciar sesion.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
