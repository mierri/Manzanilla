import { useState, useEffect, useRef } from 'react';
import {
  FileText, Thermometer, Weight, Ruler, Heart, Activity,
  ArrowLeft, Lock, Check, Sparkles, Clock, CalendarDays,
} from 'lucide-react';
import { patientsApi, recordsApi, appointmentsApi } from '@/lib/api';
import { useToast } from '@/app/ToastContext';
import { fmtDate, fmtTime } from '@/lib/utils';
import type { Patient, ClinicalRecord, Appointment } from '@/types';
import { SaveBadge } from './components/SaveBadge';
import { VitalInput } from './components/VitalInput';
import { PatientSummaryCard } from './components/PatientSummaryCard';
import { PatientPickerCard } from './components/PatientPickerCard';
import { RecordTimeline } from './components/RecordTimeline';
import { useAutoSave } from './hooks/useAutoSave';

interface Props {
  onNavigate: (id: string, params?: Record<string, unknown>) => void;
  patientId?: number;
  appointmentId?: number;
}

const EMPTY_VITALS = { temperature: '', weight: '', height: '', systolic: '', diastolic: '', heart_rate: '' };

export default function Historia({ onNavigate, patientId: initialId, appointmentId: initialApptId }: Props) {
  const toast = useToast();
  const [patients,   setPatients]   = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialId ?? null);
  const [records,    setRecords]    = useState<ClinicalRecord[]>([]);
  const [loadingRec, setLoadingRec] = useState(false);
  const [saving,     setSaving]     = useState(false);

  // Form state
  const [showForm,     setShowForm]     = useState(!!initialApptId);
  const [activeApptId, setActiveApptId] = useState<number | null>(initialApptId ?? null);
  const [patientAppts, setPatientAppts] = useState<Appointment[]>([]);

  const [vitals,          setVitals]          = useState(EMPTY_VITALS);
  const [analysisResults, setAnalysisResults] = useState('');
  const [diagnosis,       setDiagnosis]       = useState('');
  const [prescriptions,   setPrescriptions]   = useState('');

  const { saveState, reset: resetSave } = useAutoSave([analysisResults, vitals, diagnosis, prescriptions]);
  const prescriptionsRef = useRef<HTMLTextAreaElement>(null);

  const selectedPatient = patients.find(p => p.id === selectedId) ?? null;

  useEffect(() => { patientsApi.list().then(r => setPatients(r.data)); }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingRec(true);
    setRecords([]);
    recordsApi.list(selectedId).then(r => setRecords(r.data)).finally(() => setLoadingRec(false));
    appointmentsApi.list({ patient_id: selectedId }).then(r => {
      const now = new Date();
      setPatientAppts(r.data.filter(a => a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.appointment_date) >= now));
    }).catch(() => {});
    if (!initialApptId) {
      setShowForm(false);
      setActiveApptId(null);
    }
    setVitals(EMPTY_VITALS);
    setAnalysisResults(''); setDiagnosis(''); setPrescriptions('');
    resetSave();
  }, [selectedId]);

  const startConsulta = (apptId: number | null = null) => {
    setActiveApptId(apptId);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setActiveApptId(null);
    setVitals(EMPTY_VITALS);
    setAnalysisResults(''); setDiagnosis(''); setPrescriptions('');
    resetSave();
  };

  const finalizeConsulta = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const { data: rec } = await recordsApi.create(selectedId, {
        vitals: {
          temperature: Number(vitals.temperature) || 0,
          weight:      Number(vitals.weight)      || 0,
          height:      Number(vitals.height)      || 0,
          systolic:    Number(vitals.systolic)    || 0,
          diastolic:   Number(vitals.diastolic)   || 0,
          heart_rate:  Number(vitals.heart_rate)  || 0,
        },
        diagnosis, prescriptions, analysis_results: analysisResults,
      });
      if (activeApptId) {
        try {
          await appointmentsApi.update(activeApptId, { status: 'completed' });
          setPatientAppts(a => a.filter(x => x.id !== activeApptId));
        } catch { /* non-critical */ }
      }
      setRecords(r => [rec, ...r]);
      setVitals(EMPTY_VITALS);
      setAnalysisResults(''); setDiagnosis(''); setPrescriptions('');
      resetSave();
      setShowForm(false);
      setActiveApptId(null);
      toast.push({ tone: 'sage', title: 'Consulta finalizada', body: `Relatoría guardada para ${selectedPatient?.name.split(' ')[0]}` });
    } catch { toast.push({ tone: 'danger', title: 'Error al guardar' }); }
    finally { setSaving(false); }
  };

  const updV = (k: string, v: string) => setVitals(prev => ({ ...prev, [k]: v }));

  const bmi = (() => {
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height) / 100;
    if (!w || !h) return null;
    return w / (h * h);
  })();
  const bmiCat  = !bmi ? '—' : bmi < 18.5 ? 'Bajo' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidad';
  const bmiTone = bmiCat === 'Normal' ? 'sage' : bmiCat === 'Bajo' ? 'lavender' : bmiCat === 'Sobrepeso' ? 'butter' : 'blush';

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <button className="btn-ghost" style={{ marginBottom: 8, fontSize: 13, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => onNavigate('pacientes')}>
            <ArrowLeft size={14} /> Volver al directorio
          </button>
          <h1 className="page-title">
            Historia clínica{selectedPatient ? <> · <em>{selectedPatient.name.split(' ')[0]}</em></> : ''}
          </h1>
          <p className="page-subtitle">
            {selectedPatient
              ? showForm
                ? `Consulta del ${fmtDate(new Date().toISOString())}`
                : 'Historial del paciente'
              : 'Selecciona un paciente para comenzar'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {showForm && <SaveBadge state={saveState} />}
          {showForm && (
            <button className="btn btn-secondary" onClick={cancelForm}>
              Cancelar llenado
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 22 }} className="resp-historia-3">

        {/* Col 1: Patient summary + picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedPatient ? (
            <PatientSummaryCard patient={selectedPatient} />
          ) : (
            <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
              <FileText size={28} style={{ marginBottom: 8, opacity: 0.4, margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13 }}>Selecciona un paciente</p>
            </div>
          )}
          <PatientPickerCard patients={patients} activeId={selectedId} onSelect={setSelectedId} />
        </div>

        {/* Col 2: Form or appointment browser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
          {!showForm ? (
            /* Browse mode: upcoming appointments */
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="section-title" style={{ marginBottom: 2 }}>Próximas citas</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
                    {selectedId ? 'Selecciona una para iniciar la consulta' : 'Selecciona un paciente'}
                  </div>
                </div>
                {selectedId && (
                  <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => startConsulta(null)}>
                    <CalendarDays size={14} /> Iniciar consulta libre
                  </button>
                )}
              </div>
              {selectedId && patientAppts.length === 0 ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  Sin citas próximas para este paciente
                </div>
              ) : patientAppts.length > 0 ? (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {patientAppts.map(a => (
                    <div key={a.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--lavender)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <CalendarDays size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="serif" style={{ fontSize: 14, fontWeight: 500 }}>{fmtDate(a.appointment_date)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {fmtTime(a.appointment_date)}</span>
                          {a.reason && <span>· {a.reason}</span>}
                        </div>
                      </div>
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => startConsulta(a.id)}>
                        Iniciar cita
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            /* Consultation form */
            <>
              <div>
                <div className="section-title">Signos vitales <span className="count">al inicio de la consulta</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }} className="resp-vitals-3">
                  <VitalInput Icon={Thermometer} label="Temperatura" unit="°C" tone="peach" hint="36 – 37.5" value={vitals.temperature} onChange={v => updV('temperature', v)} />
                  <VitalInput Icon={Weight}      label="Peso"        unit="kg"  tone="sage"   hint="kg" value={vitals.weight}      onChange={v => updV('weight', v)} />
                  <VitalInput Icon={Ruler}       label="Altura"      unit="cm"  tone="butter" hint="cm" value={vitals.height}      onChange={v => updV('height', v)} />
                  <div className="card lift" style={{ padding: 18, gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--lavender)', display: 'grid', placeItems: 'center' }}><Activity size={20} /></div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>mmHg</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>Presión arterial</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <input className="input" value={vitals.systolic} onChange={e => updV('systolic', e.target.value)} style={{ fontFamily: '"Newsreader", serif', fontWeight: 500, fontSize: 22, padding: '4px 10px', width: 72, border: '1px solid var(--hairline)' }} placeholder="120" />
                        <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 18 }}>/</span>
                        <input className="input" value={vitals.diastolic} onChange={e => updV('diastolic', e.target.value)} style={{ fontFamily: '"Newsreader", serif', fontWeight: 500, fontSize: 22, padding: '4px 10px', width: 72, border: '1px solid var(--hairline)' }} placeholder="80" />
                      </div>
                    </div>
                  </div>
                  <VitalInput Icon={Heart} label="Frec. cardíaca" unit="bpm" tone="blush" hint="60 – 100" value={vitals.heart_rate} onChange={v => updV('heart_rate', v)} />
                  <div className="card lift" style={{ padding: 18, background: 'var(--card-tint)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="chip chip-ink" style={{ width: 'fit-content' }}><Sparkles size={11} /> Calculado</span>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>Índice de masa corporal</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="serif" style={{ fontSize: 24, fontWeight: 500 }}>{bmi ? bmi.toFixed(1) : '—'}</span>
                      {bmi && <span className={`chip chip-${bmiTone}`}>{bmiCat}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="section-title" style={{ marginBottom: 2 }}>Relatoría médica</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Diagnóstico, hallazgos, prescripciones e indicaciones</div>
                  </div>
                </div>
                <div style={{ padding: '0 24px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="field">
                    <label>Diagnóstico</label>
                    <textarea className="textarea" style={{ minHeight: 72 }} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Diagnóstico principal…" />
                  </div>
                  <div className="field">
                    <label>Prescripciones</label>
                    <textarea ref={prescriptionsRef} className="textarea" style={{ minHeight: 72 }} value={prescriptions} onChange={e => setPrescriptions(e.target.value)} placeholder="Medicamentos, dosis, indicaciones…" />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <div className="field">
                      <label>Resultados de análisis</label>
                      <textarea className="textarea" value={analysisResults} onChange={e => setAnalysisResults(e.target.value)}
                        style={{ minHeight: 180, fontFamily: '"Newsreader", serif', fontSize: 15, lineHeight: 1.65, padding: '14px 18px', borderRadius: 12 }}
                        placeholder="Resultados de laboratorio, estudios de imagen, observaciones clínicas…" />
                    </div>
                    <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none' }}>
                      <span style={{ animation: 'lock-breathe 3s ease-in-out infinite', display: 'inline-flex' }}><Lock size={13} color="var(--ok)" /></span>
                      <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Guardado con candado</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 24px', background: 'var(--card-tint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--hairline)' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => { prescriptionsRef.current?.focus(); prescriptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><FileText size={15} /> Agregar receta</button>
                  </div>
                  <button className="btn btn-primary" disabled={saving || !selectedId} onClick={finalizeConsulta}>
                    {saving ? 'Guardando…' : 'Finalizar consulta'} <Check size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Col 3: Timeline */}
        <div>
          <div className="section-title">Consultas anteriores <span className="count">{records.length}</span></div>
          {loadingRec ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>Cargando…</div>
          ) : !selectedId ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>Selecciona un paciente</div>
          ) : records.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>Sin consultas registradas</div>
          ) : (
            <RecordTimeline records={records} />
          )}
        </div>
      </div>
    </div>
  );
}
