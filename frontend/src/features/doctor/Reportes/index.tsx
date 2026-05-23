import { useState, useEffect } from 'react';
import { BarChart2, Users, Calendar, FileText, Printer, Download } from 'lucide-react';
import { reportsApi } from '@/lib/api';
import { useToast } from '@/app/ToastContext';
import type { Patient, Appointment } from '@/types';
import { OverviewReport } from './components/OverviewReport';
import { PatientListReport } from './components/PatientListReport';
import { CalendarReport } from './components/CalendarReport';
import { HistoryReport } from './components/HistoryReport';
import { downloadReportPDF } from './components/ReportPDF';

interface Props { onNavigate: (id: string, params?: Record<string, unknown>) => void; }

type Tab = 'overview' | 'pacientes' | 'calendario' | 'historia';

export default function Reportes({ onNavigate: _onNavigate }: Props) {
  const toast = useToast();
  const [tab,        setTab]       = useState<Tab>('overview');
  const [patients,   setPatients]  = useState<Patient[]>([]);
  const [appts,      setAppts]     = useState<Appointment[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [pdfLoading, setPdfLoading]= useState(false);

  useEffect(() => {
    Promise.all([reportsApi.patients(), reportsApi.calendar()])
      .then(([pRes, cRes]) => {
        setPatients((pRes.data as Patient[]) ?? []);
        setAppts((cRes.data as Appointment[]) ?? []);
      }).finally(() => setLoading(false));
  }, []);

  const reportNum = `R-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-001`;

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadReportPDF({ patients, appts, type: tab });
      toast.push({ tone: 'sage', title: 'PDF descargado', body: 'Reporte guardado en tus descargas' });
    } catch (e) {
      console.error(e);
      toast.push({ tone: 'danger', title: 'Error al generar PDF', body: (e as Error).message });
    } finally { setPdfLoading(false); }
  };

  const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'overview',   label: 'Resumen',           Icon: BarChart2 },
    { id: 'pacientes',  label: 'Lista de pacientes', Icon: Users     },
    { id: 'calendario', label: 'Calendario',         Icon: Calendar  },
    { id: 'historia',   label: 'Historial clínico',  Icon: FileText  },
  ];

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes <em>impecables</em></h1>
          <p className="page-subtitle">Vistas listas para imprimir, exportar o compartir con tus pacientes</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary no-print" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </button>
          <button className="btn btn-primary no-print" disabled={pdfLoading} onClick={handleDownloadPDF}>
            <Download size={16} /> {pdfLoading ? 'Generando…' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--card)', padding: 5, borderRadius: 999, marginBottom: 22, boxShadow: 'var(--shadow-sm)', width: 'fit-content' }} className="no-print resp-tab-bar">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 999,
            fontSize: 13, fontWeight: 500,
            background: tab === id ? 'var(--ink)' : 'transparent',
            color:      tab === id ? 'var(--bg-warm-white)' : 'var(--ink-soft)',
            transition: 'all .2s var(--ease)',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>Generando reporte…</div>
      ) : (
        <>
          {tab === 'overview'   && <OverviewReport   patients={patients} appts={appts} />}
          {tab === 'pacientes'  && <PatientListReport patients={patients} reportNum={reportNum} />}
          {tab === 'calendario' && <CalendarReport    appts={appts} />}
          {tab === 'historia'   && <HistoryReport     patients={patients} />}
        </>
      )}
    </div>
  );
}
