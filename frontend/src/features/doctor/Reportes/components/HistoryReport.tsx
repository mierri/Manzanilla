import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { fmtDate } from '@/lib/utils';
import type { Patient, ClinicalRecord } from '@/types';
import { PAvatar } from './PAvatar';
import { DocField } from './DocField';
import { DocVital } from './DocVital';

interface Props { patients: Patient[]; }

export function HistoryReport({ patients }: Props) {
  const [selId,   setSelId]  = useState<number | null>(patients[0]?.id ?? null);
  const [report,  setReport] = useState<{ patient: Patient; records: ClinicalRecord[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selId === null) return;
    setLoading(true);
    reportsApi.history(selId).then(r => setReport(r.data)).finally(() => setLoading(false));
  }, [selId]);

  const p = report?.patient;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }} className="no-print">
        {patients.slice(0, 8).map(pp => (
          <button key={pp.id} onClick={() => setSelId(pp.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, fontSize: 13, fontWeight: 500, background: selId === pp.id ? 'var(--ink)' : 'var(--card)', color: selId === pp.id ? 'var(--bg-warm-white)' : 'var(--ink)', boxShadow: 'var(--shadow-xs)', transition: 'all .2s var(--ease)' }}>
            <PAvatar patient={pp} size={26} />
            {pp.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Generando historial…</div>}

      {!loading && report && p && (
        <div className="card print-doc" style={{ padding: 0, overflow: 'hidden', maxWidth: 820, margin: '0 auto' }}>
          <div style={{ background: 'var(--butter)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: '#6E5418', textTransform: 'uppercase', letterSpacing: '.15em', fontWeight: 600 }}>Historial clínico</div>
              <h1 className="serif" style={{ fontSize: 28, fontWeight: 500, marginTop: 6, color: 'var(--ink)' }}>{p.name}</h1>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 13, color: 'var(--ink-soft)' }}>
                <span><b style={{ color: 'var(--ink)' }}>{p.age}</b> años</span>
                <span><b style={{ color: 'var(--ink)' }}>{p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : 'Otro'}</b></span>
                <span>Expediente <span className="mono" style={{ color: 'var(--ink)' }}>#{p.id}</span></span>
              </div>
            </div>
            <img src="/flor.svg" width={60} height={60} aria-hidden />
          </div>

          <div style={{ padding: '30px 40px' }}>
            <h2 className="serif" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>Datos generales</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', paddingBottom: 24, borderBottom: '1px solid var(--hairline)' }} className="resp-doc-fields">
              <DocField label="Correo"    value={p.email}   />
              <DocField label="Teléfono" value={p.phone}   />
              <DocField label="Dirección" value={p.address} span />
              <DocField label="Usuario"   value={`@${p.username}`} />
            </div>

            <h2 className="serif" style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 28, marginBottom: 14 }}>
              Consultas registradas <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', fontWeight: 400, color: 'var(--muted)' }}>({report.records.length})</span>
            </h2>

            {report.records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>Sin consultas registradas</div>
            ) : (
              report.records.map((r, i) => (
                <div key={r.id} style={{ paddingBottom: 28, marginBottom: 28, borderBottom: i < report.records.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                    <span className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{r.diagnosis?.split('.')[0]?.trim() || 'Consulta médica'}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{fmtDate(r.created_at)}</span>
                  </div>
                  {r.vitals && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 14 }} className="resp-doc-vitals">
                      <DocVital label="Temp."   value={`${r.vitals.temperature}°C`}  />
                      <DocVital label="Peso"    value={`${r.vitals.weight} kg`}      />
                      <DocVital label="Altura"  value={`${r.vitals.height} cm`}      />
                      <DocVital label="Presión" value={`${r.vitals.systolic}/${r.vitals.diastolic}`} />
                      <DocVital label="FC"      value={`${r.vitals.heart_rate} bpm`} />
                    </div>
                  )}
                  {r.diagnosis    && <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink)', fontFamily: '"Newsreader", serif', marginBottom: 8 }}>{r.diagnosis}</p>}
                  {r.prescriptions && <div style={{ marginTop: 8 }}><span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-soft)' }}>Prescripciones: </span><span style={{ fontSize: 13 }}>{r.prescriptions}</span></div>}
                  {r.analysis_results && <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.6 }}>{r.analysis_results}</p>}
                </div>
              ))
            )}

            <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--card-tint)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--sage)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Lock size={20} color="#3C5A3F" /></div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>Documento con candado</div>
                <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>Solo el paciente y su médico tratante tienen acceso a este historial.</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 40px', background: 'var(--card-tint)', fontSize: 11.5, color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--hairline)' }}>
            <span>Consultorio Manzanilla · <Check size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> Documento verificado</span>
            <span>Generado el {fmtDate(new Date().toISOString())}</span>
          </div>
        </div>
      )}
    </div>
  );
}
