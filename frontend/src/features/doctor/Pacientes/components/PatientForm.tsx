import { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import type { Patient } from '@/types';

interface Props {
  initial?: Patient;
  onSave: (data: Partial<Patient> & { password?: string }) => void;
  onCancel: () => void;
}

export function PatientForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState({
    name:     initial?.name     ?? '',
    email:    initial?.email    ?? '',
    phone:    initial?.phone    ?? '',
    age:      String(initial?.age ?? ''),
    sex:      initial?.sex      ?? 'F',
    address:  initial?.address  ?? '',
    username: initial?.username ?? '',
    password: '',
  });
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="resp-modal-form-2">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Nombre completo</label>
          <input className="input" value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Ej. Mariana Olvera Sosa" />
        </div>
        <div className="field">
          <label>Edad</label>
          <input className="input" type="number" value={form.age} onChange={e => upd('age', e.target.value)} placeholder="32" />
        </div>
        <div className="field">
          <label>Sexo</label>
          <select className="select" value={form.sex} onChange={e => upd('sex', e.target.value)}>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="X">Otro / Prefiero no decir</option>
          </select>
        </div>
        <div className="field">
          <label>Teléfono</label>
          <input className="input" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+52 33 …" />
        </div>
        <div className="field">
          <label>Correo electrónico</label>
          <input className="input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="correo@ejemplo.mx" />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Dirección</label>
          <input className="input" value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Calle, número, ciudad" />
        </div>
        {!initial && (
          <>
            <div className="field">
              <label>Usuario</label>
              <input className="input" value={form.username} onChange={e => upd('username', e.target.value)} placeholder="usuario único" />
            </div>
            <div className="field">
              <label>Contraseña inicial</label>
              <input className="input" type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="••••••••" />
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--card-tint)', borderRadius: 14, marginTop: 4, fontSize: 12.5, color: 'var(--ink-soft)' }}>
        <Lock size={16} color="var(--ok)" /> La información del paciente se guarda de forma segura.
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave({ ...form, age: Number(form.age) })}>
          <Check size={16} /> Guardar paciente
        </button>
      </div>
    </>
  );
}
