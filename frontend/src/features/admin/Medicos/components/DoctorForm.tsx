import { useState } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import type { User } from '@/types';

type DoctorWithCount = User & { appointment_count?: number; speciality?: string };

interface Props {
  initial?: DoctorWithCount;
  onSave: (data: Partial<User & { speciality: string }> & { password?: string }) => void;
  onCancel: () => void;
  error?: string;
}

export function DoctorForm({ initial, onSave, onCancel, error }: Props) {
  const [form, setForm] = useState({
    name:       initial?.name       ?? '',
    username:   initial?.username   ?? '',
    email:      initial?.email      ?? '',
    phone:      initial?.phone      ?? '',
    age:        String(initial?.age ?? ''),
    sex:        initial?.sex        ?? 'M',
    address:    initial?.address    ?? '',
    speciality: initial?.speciality ?? '',
    password:   '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const upd = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setTouched(t => ({ ...t, [k]: true })); };

  const isNew = !initial;
  const canSubmit = form.name.trim() && form.email.trim() &&
    (!isNew || (form.username.trim() && form.password.length >= 6));

  return (
    <>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FEE2E2', borderRadius: 12, marginBottom: 4, fontSize: 13, color: '#B91C1C' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="resp-modal-form-2">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Nombre completo *</label>
          <input className="input" value={form.name} onChange={e => upd('name', e.target.value)}
            placeholder="Dr. Nombre Apellido"
            style={{ borderColor: touched.name && !form.name.trim() ? 'var(--danger)' : undefined }} />
        </div>
        <div className="field">
          <label>Correo electrónico *</label>
          <input className="input" type="email" value={form.email} onChange={e => upd('email', e.target.value)}
            placeholder="medico@manzanilla.mx"
            style={{ borderColor: touched.email && !form.email.trim() ? 'var(--danger)' : undefined }} />
        </div>
        <div className="field">
          <label>Especialidad</label>
          <input className="input" value={form.speciality} onChange={e => upd('speciality', e.target.value)}
            placeholder="Medicina general, Cardiología…" />
        </div>
        <div className="field">
          <label>Teléfono</label>
          <input className="input" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+52 33 …" />
        </div>
        <div className="field">
          <label>Edad</label>
          <input className="input" type="number" min="18" max="99" value={form.age} onChange={e => upd('age', e.target.value)} />
        </div>
        <div className="field">
          <label>Sexo</label>
          <select className="select" value={form.sex} onChange={e => upd('sex', e.target.value)}>
            <option value="M">Masculino</option><option value="F">Femenino</option><option value="X">Otro</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Dirección</label>
          <input className="input" value={form.address} onChange={e => upd('address', e.target.value)} />
        </div>
        {isNew && (
          <>
            <div className="field">
              <label>Usuario *</label>
              <input className="input" value={form.username} onChange={e => upd('username', e.target.value)}
                placeholder="usuario único (sin espacios)"
                style={{ borderColor: touched.username && !form.username.trim() ? 'var(--danger)' : undefined }} />
            </div>
            <div className="field">
              <label>Contraseña inicial * (mín. 6)</label>
              <input className="input" type="password" value={form.password} onChange={e => upd('password', e.target.value)}
                placeholder="••••••••"
                style={{ borderColor: touched.password && form.password.length > 0 && form.password.length < 6 ? 'var(--danger)' : undefined }} />
              {touched.password && form.password.length > 0 && form.password.length < 6 && (
                <span style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 3 }}>Mínimo 6 caracteres</span>
              )}
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--card-tint)', borderRadius: 14, marginTop: 4, fontSize: 12.5, color: 'var(--ink-soft)' }}>
        <Lock size={16} color="var(--ok)" /> El médico recibirá acceso al portal con sus credenciales.
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" style={{ background: '#4B3B68' }}
          disabled={!canSubmit}
          onClick={() => onSave({ ...form, age: Number(form.age) || undefined })}>
          <Check size={16} /> {isNew ? 'Crear médico' : 'Guardar cambios'}
        </button>
      </div>
    </>
  );
}
