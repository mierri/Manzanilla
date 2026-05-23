import { useState, useEffect } from 'react';
import { Search, Users, ShieldOff } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cached } from '@/lib/cache';
import { initials, avatarColor } from '@/lib/utils';
import type { User } from '@/types';

type PatientBasic = User & { appointment_count?: number };

export default function AdminPacientes() {
  const [patients, setPatients] = useState<PatientBasic[]>([]);
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    cached('admin-patients', () => adminApi.listPatients(), r => setPatients(r.data as PatientBasic[]))
      .then(r => setPatients(r.data as PatientBasic[]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      adminApi.listPatients(query).then(r => setPatients(r.data as PatientBasic[]));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Directorio de <em>pacientes</em></h1>
          <p className="page-subtitle">{patients.length} pacientes · solo datos de contacto (sin historial clínico)</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'var(--lavender)', borderRadius: 14, marginBottom: 22, fontSize: 13, color: '#4B3B68' }}>
        <ShieldOff size={18} color="#4B3B68" />
        <span>Como administrador, ves datos de contacto. Los <strong>expedientes clínicos</strong> (diagnósticos, prescripciones, notas) son exclusivos del médico tratante y el paciente.</span>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginBottom: 22 }}>
        <div className="input-pill" style={{ flex: 1 }}>
          <span className="icon-prefix"><Search size={18} /></span>
          <input className="input" placeholder="Buscar por nombre, usuario o correo…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{patients.length} resultados</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Cargando…</div>
      ) : patients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <Users size={32} style={{ marginBottom: 12, opacity: 0.4, margin: '0 auto 12px' }} />
          <p>No se encontraron pacientes</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr auto', gap: 16, padding: '12px 22px', background: 'var(--bg)', borderBottom: '1px solid var(--hairline)' }}>
            {['', 'Paciente', 'Edad / Sexo', 'Teléfono', 'Correo', 'Citas'].map((h, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{h}</div>
            ))}
          </div>
          {patients.map((p, i) => (
            <div key={p.id}
              style={{ display: 'grid', gridTemplateColumns: 'auto 2fr 1fr 1fr 1fr auto', gap: 16, padding: '14px 22px', alignItems: 'center', borderTop: i > 0 ? '1px solid var(--hairline)' : 'none', transition: 'background .2s var(--ease)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-tint)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `var(--${avatarColor(p.id)})`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials(p.name)}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>@{p.username}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{p.age ? `${p.age} años` : '—'} · {p.sex === 'F' ? 'F' : p.sex === 'M' ? 'M' : p.sex ?? '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{p.phone || '—'}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
              <span className="chip chip-lavender" style={{ fontSize: 11, justifySelf: 'end' }}>{p.appointment_count ?? 0} citas</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
