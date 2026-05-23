import { useState } from 'react';
import { Check, Lock, LogOut, Mail, Bell } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useToast } from '@/app/ToastContext';
import api, { authApi } from '@/lib/api';
import { initials } from '@/lib/utils';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';

export default function PatientPerfil() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name:    user?.name    ?? '',
    email:   user?.email   ?? '',
    phone:   user?.phone   ?? '',
    address: user?.address ?? '',
    age:     String(user?.age ?? ''),
    sex:     user?.sex     ?? 'F',
  });
  const [saving, setSaving]         = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    email: user?.notif_email !== false,
    push:  user?.notif_push  === true,
  });

  const upd    = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const togPref = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const save = async () => {
    setSaving(true);
    try {
      const { data: updated } = await api.put('/profile', {
        ...form,
        age: Number(form.age) || undefined,
        notif_email: prefs.email,
        notif_push: prefs.push,
      });
      updateUser(updated);
      toast.push({ tone: 'sage', title: 'Cambios guardados', body: 'Tu perfil quedó actualizado' });
    } catch {
      toast.push({ tone: 'danger', title: 'Error al guardar' });
    } finally { setSaving(false); }
  };

  const { supported: pushSupported, loading: pushLoading } = usePushSubscription(prefs.push);
  const ini = user ? initials(user.name) : '?';

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <span className="role-stripe"><span className="dot" /> Portal paciente</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>Mi <em>perfil</em></h1>
          <p className="page-subtitle">Mantén tus datos al día para que tu médico pueda contactarte rápido.</p>
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Check size={16} /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 22 }} className="resp-pac-perfil-2">
        {/* Identity card */}
        <div className="card" style={{ padding: 22, textAlign: 'center', height: 'fit-content' }}>
          <div style={{ display: 'inline-flex', padding: 4, background: 'var(--sage)', borderRadius: 18, marginBottom: 14 }}>
            <div style={{ width: 88, height: 88, borderRadius: 14, background: 'var(--sage-deep)', display: 'grid', placeItems: 'center' }}>
              <span className="serif" style={{ fontSize: 32, fontWeight: 500, color: '#fff' }}>{ini}</span>
            </div>
          </div>
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{user?.name}</h2>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>@{user?.username} · {user?.age ? `${user.age} años` : '—'}</div>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span className="chip chip-sage"><Check size={11} /> Cuenta activa</span>
            <span className="chip chip-butter">Paciente #{user?.id}</span>
          </div>
          <div style={{ marginTop: 18, padding: 14, background: 'var(--card-tint)', borderRadius: 14, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Acceso</div>
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

        {/* Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card">
            <div className="section-title">Datos personales</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="resp-modal-form-2">
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Nombre completo</label><input className="input" value={form.name} onChange={e => upd('name', e.target.value)} /></div>
              <div className="field"><label>Correo electrónico</label><input className="input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} /></div>
              <div className="field"><label>Teléfono</label><input className="input" value={form.phone} onChange={e => upd('phone', e.target.value)} /></div>
              <div className="field"><label>Edad</label><input className="input" type="number" min="0" max="120" value={form.age} onChange={e => upd('age', e.target.value)} /></div>
              <div className="field"><label>Sexo</label>
                <select className="select" value={form.sex} onChange={e => upd('sex', e.target.value)}>
                  <option value="F">Femenino</option><option value="M">Masculino</option><option value="X">Otro</option>
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}><label>Dirección</label><input className="input" value={form.address} onChange={e => upd('address', e.target.value)} /></div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">¿Cómo quieres que te recordemos tus citas?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {([
                { key: 'email' as const, label: 'Correo electrónico', sub: form.email || '—',   Icon: Mail, disabled: false },
                { key: 'push'  as const, label: 'Notificación push',  sub: pushSupported ? 'En este navegador' : 'No soportado en este navegador', Icon: Bell, disabled: !pushSupported || pushLoading },
              ] as const).map(o => (
                <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: prefs[o.key] ? 'var(--card-tint)' : 'transparent', borderRadius: 12, cursor: o.disabled ? 'not-allowed' : 'pointer', transition: 'background .2s var(--ease)', opacity: o.disabled ? 0.6 : 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sage)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><o.Icon size={16} color="#3C5A3F" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{o.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{o.sub}</div>
                  </div>
                  <div onClick={e => { e.preventDefault(); if (!o.disabled) togPref(o.key); }}
                    style={{ width: 38, height: 22, borderRadius: 999, background: prefs[o.key] ? 'var(--sage-deep)' : 'var(--hairline)', position: 'relative', transition: 'background .2s var(--ease)', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: prefs[o.key] ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-xs)', transition: 'left .2s var(--ease)' }} />
                  </div>
                </label>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.5 }}>
              Las preferencias se guardan en tu cuenta y aplican en todos tus dispositivos.
            </p>
          </div>
        </div>
      </div>

      <ChangePasswordModal open={changePwdOpen} onClose={() => setChangePwdOpen(false)} />
    </div>
  );
}
