import { useState } from 'react';
import { Check, Lock, LogOut, ShieldCheck, Users, Stethoscope, Database, Bell } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useToast } from '@/app/ToastContext';
import api from '@/lib/api';
import { initials } from '@/lib/utils';
import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';
import { adminApi } from '@/lib/api';
import { useEffect } from 'react';

interface AdminStats {
  doctor_count: number;
  patient_count: number;
  today_count: number;
  month_count: number;
}

export default function AdminPerfil() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [saving, setSaving]           = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [stats, setStats]             = useState<AdminStats | null>(null);

  useEffect(() => {
    adminApi.stats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data: updated } = await api.put('/profile', form);
      updateUser(updated);
      toast.push({ tone: 'sage', title: 'Perfil actualizado' });
    } catch {
      toast.push({ tone: 'danger', title: 'Error al guardar' });
    } finally { setSaving(false); }
  };

  const ini = user ? initials(user.name) : '?';

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <span className="role-stripe" style={{ color: '#4B3B68' }}><span className="dot" style={{ background: '#4B3B68' }} /> Administración</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>Mi <em>perfil</em> admin</h1>
          <p className="page-subtitle">Configuración y datos del administrador del sistema.</p>
        </div>
        <button className="btn btn-primary" style={{ background: '#4B3B68' }} onClick={save} disabled={saving}>
          <Check size={16} /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22 }} className="resp-pac-perfil-2">
        {/* Identity card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 22, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: 4, background: 'var(--lavender)', borderRadius: 18, marginBottom: 14 }}>
              <div style={{ width: 88, height: 88, borderRadius: 14, background: '#4B3B68', display: 'grid', placeItems: 'center' }}>
                <span className="serif" style={{ fontSize: 32, fontWeight: 500, color: '#fff' }}>{ini}</span>
              </div>
            </div>
            <h2 className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{user?.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>@{user?.username}</div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 6 }}>
              <span className="chip" style={{ background: 'var(--lavender)', color: '#4B3B68' }}>
                <ShieldCheck size={11} /> Administrador
              </span>
            </div>
            <div style={{ marginTop: 18, padding: 14, background: 'var(--card-tint)', borderRadius: 14, textAlign: 'left' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Seguridad</div>
              <button className="btn-ghost" style={{ fontSize: 13, padding: '6px', width: '100%', display: 'flex', gap: 8, alignItems: 'center', borderRadius: 10 }}
                onClick={() => setChangePwdOpen(true)}>
                <Lock size={14} /> Cambiar contraseña
              </button>
              <button className="btn-ghost" style={{ fontSize: 13, padding: '6px', width: '100%', display: 'flex', gap: 8, alignItems: 'center', color: 'var(--danger)', borderRadius: 10 }}
                onClick={logout}>
                <LogOut size={14} /> Cerrar sesión
              </button>
            </div>
          </div>

          {/* System stats */}
          {stats && (
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>Estado del sistema</div>
              {[
                { label: 'Médicos registrados',   value: stats.doctor_count,  Icon: Stethoscope, color: 'var(--lavender)' },
                { label: 'Pacientes registrados',  value: stats.patient_count, Icon: Users,       color: 'var(--sage)'     },
                { label: 'Citas este mes',         value: stats.month_count,   Icon: Bell,        color: 'var(--butter)'   },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: s.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <s.Icon size={15} />
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-soft)' }}>{s.label}</div>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Personal data */}
          <div className="card">
            <div className="section-title">Datos del administrador</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="resp-modal-form-2">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label>Nombre completo</label>
                <input className="input" value={form.name} onChange={e => upd('name', e.target.value)} />
              </div>
              <div className="field">
                <label>Correo electrónico</label>
                <input className="input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} />
              </div>
              <div className="field">
                <label>Teléfono</label>
                <input className="input" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+52 33…" />
              </div>
            </div>
          </div>

          {/* System info */}
          <div className="card">
            <div className="section-title">Información del sistema</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Sistema',        value: 'Consultorio Manzanilla v1.0' },
                { label: 'Base de datos',  value: 'MySQL · manzanilla' },
                { label: 'Framework',      value: 'Laravel 11 + React 19' },
                { label: 'Autenticación',  value: 'Laravel Sanctum (Bearer tokens)' },
                { label: 'Cifrado datos',  value: 'AES-256 via Laravel Crypt' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--card-tint)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-soft)' }}>
                    <Database size={14} /> {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Asociaciones doctor-paciente */}
          <div className="card">
            <div className="section-title">Gestión de asociaciones</div>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              Para asociar pacientes con médicos, ve a la sección <strong>Médicos</strong> o <strong>Pacientes</strong> y usa el botón de asociación en cada tarjeta.
              Los pacientes solo podrán reservar citas con los médicos que tengan asignados.
            </p>
            <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--lavender)', borderRadius: 12, fontSize: 13, color: '#4B3B68', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Las asociaciones se gestionan en la sección Médicos → tarjeta del médico → "Ver pacientes".</span>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal open={changePwdOpen} onClose={() => setChangePwdOpen(false)} />
    </div>
  );
}
