import { fmtDate } from '@/lib/utils';
import type { Patient } from '@/types';
import { PAvatar } from './PAvatar';

interface Props { patients: Patient[]; reportNum: string; }

export function PatientListReport({ patients, reportNum }: Props) {
  const today = fmtDate(new Date().toISOString());
  return (
    <div className="card print-doc" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '26px 32px', background: 'var(--card-tint)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/flor.svg" width={42} height={42} aria-hidden />
          <div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>Consultorio Manzanilla</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>Lista de pacientes registrados · al {today}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>REPORTE</div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500 }}>{reportNum}</div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Paciente', 'Edad', 'Sexo', 'Teléfono', 'Correo', 'Consultas', 'Última visita'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, background: 'var(--bg)', borderBottom: '1px solid var(--hairline)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--hairline)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-tint)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ color: 'var(--muted)' }}>{String(i + 1).padStart(3, '0')}</span></td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PAvatar patient={p} size={32} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>@{p.username}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 13.5 }}>{p.age}</td>
                <td style={{ padding: '14px 20px', fontSize: 13.5 }}>{p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : 'Otro'}</td>
                <td style={{ padding: '14px 20px', fontSize: 13.5 }}>{p.phone || '—'}</td>
                <td style={{ padding: '14px 20px', fontSize: 13.5, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</td>
                <td style={{ padding: '14px 20px' }}><span className="mono" style={{ fontSize: 13 }}>{p.notes_count ?? 0}</span></td>
                <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--ink-soft)' }}>{p.last_visit ? fmtDate(p.last_visit) : '—'}</td>
              </tr>
            ))}
            {patients.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>Sin pacientes</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '16px 32px', background: 'var(--bg)', fontSize: 11.5, color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--hairline)' }}>
        <span>Total: {patients.length} pacientes registrados</span>
        <span>Generado el {today} · Consultorio Manzanilla</span>
      </div>
    </div>
  );
}
