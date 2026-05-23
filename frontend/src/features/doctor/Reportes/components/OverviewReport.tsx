import { parseApptDate } from '@/lib/utils';
import type { Patient, Appointment } from '@/types';
import { DonutChart } from './DonutChart';
import { PAvatar } from './PAvatar';

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEK_LABELS = ['1ª sem', '2ª sem', '3ª sem', '4ª sem', '5ª sem'];

interface Props { patients: Patient[]; appts: Appointment[]; }

export function OverviewReport({ patients, appts }: Props) {
  const now = new Date(); const year = now.getFullYear(); const month = now.getMonth();

  const weekBuckets = [0, 0, 0, 0, 0];
  appts.forEach(a => {
    const d = parseApptDate(a.appointment_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      weekBuckets[Math.min(Math.floor((d.getDate() - 1) / 7), 4)]++;
    }
  });
  const maxBar = Math.max(...weekBuckets, 1);

  const confirmed = appts.filter(a => a.status === 'confirmed').length;
  const pending   = appts.filter(a => a.status === 'pending').length;
  const cancelled = appts.filter(a => a.status === 'cancelled').length;
  const total     = confirmed + pending + cancelled || 1;

  const donutSegments = [
    { pct: Math.round((confirmed / total) * 100), tone: '--sage',   label: 'Confirmadas'   },
    { pct: Math.round((pending   / total) * 100), tone: '--butter', label: 'Por confirmar' },
    { pct: Math.round((cancelled / total) * 100), tone: '--blush',  label: 'Canceladas'    },
  ];

  const topPatients = [...patients].sort((a, b) => (b.notes_count ?? 0) - (a.notes_count ?? 0)).slice(0, 4);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }} className="resp-overview-2 print-doc">
      {/* Bar chart */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 0 }}>Consultas del mes</div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{MONTHS_ES[month]} {year}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="serif" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1 }}>{appts.length}</span>
            <span style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 600 }}>citas</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weekBuckets.length}, 1fr)`, gap: 8, alignItems: 'end', marginTop: 24 }}>
          {weekBuckets.map((v, i) => {
            const BAR_MAX = 140; // px
            const px = Math.max(Math.round((v / maxBar) * BAR_MAX), v > 0 ? 10 : 4);
            const isLast = i === weekBuckets.length - 1;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  {v > 0 && <span style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)', marginBottom: 4 }}>{v}</span>}
                  <div style={{ width: '100%', height: px, background: isLast ? 'var(--ink)' : 'var(--peach)', borderRadius: 8, transition: 'height .6s var(--ease)' }} />
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{WEEK_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donut */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div className="section-title" style={{ marginBottom: 4 }}>Estado de las citas</div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Distribución del mes</div>
        </div>
        <DonutChart segments={donutSegments} total={appts.length} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {donutSegments.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: 4, background: `var(${s.tone})`, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{s.label}</span>
              <span className="mono" style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top patients */}
      <div className="card" style={{ gridColumn: '1 / -1', padding: 24 }}>
        <div className="section-title" style={{ marginBottom: 18 }}>Pacientes con más consultas</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="resp-top-patients-4">
          {topPatients.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--card-tint)', borderRadius: 16 }}>
              <PAvatar patient={p} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{p.notes_count ?? 0} consultas</div>
              </div>
              <span className="serif" style={{ fontSize: 22, color: 'var(--ink-soft)', fontWeight: 500, flexShrink: 0 }}>#{i + 1}</span>
            </div>
          ))}
          {topPatients.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>Sin datos de pacientes</div>}
        </div>
      </div>
    </div>
  );
}
