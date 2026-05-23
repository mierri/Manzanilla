import { useState } from 'react';
import { FileText, Thermometer, Weight, Heart, Activity, Ruler } from 'lucide-react';
import { fmtDate } from '@/lib/utils';
import type { ClinicalRecord } from '@/types';
import { Modal } from '@/components/ui/Modal';

interface Props { records: ClinicalRecord[]; }

function VitalChip({ icon: Icon, value, unit }: { icon: React.ElementType; value: number | string; unit: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card-tint)', borderRadius: 10, padding: '6px 10px', fontSize: 12.5 }}>
      <Icon size={13} color="var(--ink-soft)" />
      <span style={{ fontWeight: 500 }}>{value}</span>
      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{unit}</span>
    </div>
  );
}

export function RecordTimeline({ records }: Props) {
  const [detail, setDetail] = useState<ClinicalRecord | null>(null);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }} className="historia-tl">
        {records.map(r => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--butter)', display: 'grid', placeItems: 'center', marginTop: 14, boxShadow: '0 0 0 4px var(--bg)', zIndex: 2 }}>
              <FileText size={14} color="var(--ink)" />
            </div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', boxShadow: 'var(--shadow-sm)', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>
                {fmtDate(r.created_at)}
              </div>
              <div className="serif" style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>
                {r.diagnosis?.split('.')[0]?.trim() || 'Consulta médica'}
              </div>
              {r.vitals && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                  <span><Thermometer size={10} style={{ verticalAlign: 'middle' }} /> {r.vitals.temperature}°C</span>
                  <span><Weight size={10} style={{ verticalAlign: 'middle' }} /> {r.vitals.weight} kg</span>
                  <span><Heart size={10} style={{ verticalAlign: 'middle' }} /> {r.vitals.systolic}/{r.vitals.diastolic}</span>
                </div>
              )}
              {r.analysis_results && (
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.analysis_results}
                </p>
              )}
              <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px', marginTop: 8, marginLeft: -8 }}
                onClick={() => setDetail(r)}>
                Ver completa →
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.diagnosis?.split('.')[0]?.trim() || 'Consulta médica'} maxWidth={600}>
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: -8 }}>{fmtDate(detail.created_at)}</div>

            {detail.vitals && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Signos vitales</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <VitalChip icon={Thermometer} value={detail.vitals.temperature} unit="°C" />
                  <VitalChip icon={Weight}      value={detail.vitals.weight}      unit="kg" />
                  <VitalChip icon={Ruler}       value={detail.vitals.height}      unit="cm" />
                  <VitalChip icon={Activity}    value={`${detail.vitals.systolic}/${detail.vitals.diastolic}`} unit="mmHg" />
                  <VitalChip icon={Heart}       value={detail.vitals.heart_rate}  unit="bpm" />
                </div>
              </div>
            )}

            {detail.diagnosis && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Diagnóstico</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{detail.diagnosis}</p>
              </div>
            )}

            {detail.prescriptions && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Prescripciones</div>
                <div style={{ background: 'var(--card-tint)', borderRadius: 12, padding: '12px 14px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{detail.prescriptions}</div>
              </div>
            )}

            {detail.analysis_results && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Resultados de análisis</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{detail.analysis_results}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
