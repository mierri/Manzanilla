import { useState, useEffect } from 'react';
import { FileText, Lock, Thermometer, Weight, Ruler, Activity, Heart, ClipboardList } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/app/AuthContext';
import { recordsApi } from '@/lib/api';
import { cached } from '@/lib/cache';
import { fmtDate, initials } from '@/lib/utils';
import type { ClinicalRecord } from '@/types';

function VitalChip({ icon: Icon, value, unit }: { icon: React.ElementType; value: number | string; unit: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card-tint)', borderRadius: 10, padding: '6px 10px', fontSize: 12.5 }}>
      <Icon size={13} color="var(--ink-soft)" />
      <span style={{ fontWeight: 500 }}>{value}</span>
      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{unit}</span>
    </div>
  );
}
import { ReadOnlyVital } from './components/ReadOnlyVital';

export default function PatientHistoria() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ClinicalRecord | null>(null);

  useEffect(() => {
    if (!user) return;
    cached(`pat-records-${user.id}`, () => recordsApi.list(user.id), r => setRecords(r.data))
      .then(r => setRecords(r.data))
      .finally(() => setLoading(false));
  }, [user]);

  const sorted = [...records].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latest = sorted[0];

  const conditions = [...new Set(
    sorted.slice(0, 5).map(r => r.diagnosis?.split('.')[0]?.trim()).filter(Boolean)
  )].slice(0, 3) as string[];

  const ini = user ? initials(user.name) : '?';

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <span className="role-stripe"><span className="dot" /> Portal paciente</span>
          <h1 className="page-title" style={{ marginTop: 6 }}>Mi <em>historia</em> clínica</h1>
          <p className="page-subtitle">Toda tu información médica, en un solo lugar y siempre contigo.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Cargando…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22 }} className="resp-pac-historia-2">
          {/* Left sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--sage)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <span className="serif" style={{ fontSize: 20, fontWeight: 500, color: '#3C5A3F' }}>{ini}</span>
                </div>
                <div>
                  <h3 className="serif" style={{ fontSize: 17, fontWeight: 500 }}>{user?.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                    {user?.age ? `${user.age} años` : '—'} · {user?.sex === 'M' ? 'Masculino' : user?.sex === 'F' ? 'Femenino' : 'Otro'}
                  </div>
                </div>
              </div>
              {conditions.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {conditions.map((c, i) => <span key={i} className={`chip ${i === 0 ? 'chip-sage' : 'chip-butter'}`}>{c.length > 24 ? c.slice(0, 24) + '…' : c}</span>)}
                </div>
              ) : <span className="chip chip-sage">Sin diagnósticos previos</span>}
            </div>

            {latest?.vitals && (
              <div className="card-soft" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Signos vitales recientes</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <ReadOnlyVital label="Peso"    value={latest.vitals.weight}     unit="kg"   />
                  <ReadOnlyVital label="Altura"  value={latest.vitals.height}     unit="cm"   />
                  <ReadOnlyVital label="Presión" value={`${latest.vitals.systolic}/${latest.vitals.diastolic}`} unit="mmHg" />
                  <ReadOnlyVital label="Pulso"   value={latest.vitals.heart_rate} unit="bpm"  />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>Última medición: {fmtDate(latest.created_at)}</div>
              </div>
            )}

            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ animation: 'lock-breathe 3s ease-in-out infinite', display: 'inline-flex', marginTop: 2 }}><Lock size={16} color="var(--ok)" /></span>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>Tu información clínica viaja cifrada. Solo tú y tu médico pueden verla.</div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="section-title">Consultas anteriores <span className="count">{sorted.length}</span></div>
            {sorted.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                <ClipboardList size={32} color="var(--muted)" style={{ marginBottom: 10 }} />
                <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>Sin consultas registradas</div>
                <p style={{ fontSize: 13, marginTop: 4 }}>Cuando tengas una consulta aparecerá aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                {sorted.map(r => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--sage)', display: 'grid', placeItems: 'center', marginTop: 14, boxShadow: '0 0 0 4px var(--bg)', zIndex: 2 }}>
                      <FileText size={14} color="#3C5A3F" />
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{fmtDate(r.created_at)}</div>
                        <span className="chip" style={{ fontSize: 10.5 }}>Tu médico</span>
                      </div>
                      <div className="serif" style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{r.diagnosis?.split('.')[0]?.trim() || 'Consulta médica'}</div>
                      {r.analysis_results && <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.analysis_results}</p>}
                      {r.prescriptions && (
                        <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--card-tint)', borderRadius: 10 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-soft)' }}>Indicaciones: </span>
                          <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{r.prescriptions.split('\n')[0]}{r.prescriptions.includes('\n') ? '…' : ''}</span>
                        </div>
                      )}
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '4px 10px', marginTop: 8, marginLeft: -8 }}
                        onClick={() => setDetail(r)}>
                        Ver completa →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
          </div>
        </div>
      )}
    </div>
  );
}
