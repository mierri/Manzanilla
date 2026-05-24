import React from 'react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { reportsApi } from '@/lib/api';
import type { Patient, Appointment } from '@/types';
import { OverviewPDF } from './OverviewPDF';
import { PatientsPDF } from './PatientsPDF';
import { CalendarPDF } from './CalendarPDF';
import { HistoryPDF } from './HistoryPDF';

export async function openReportPDF(options: {
  patients: Patient[];
  appts: Appointment[];
  type: 'overview' | 'pacientes' | 'calendario' | 'historia';
  historyPatientId?: number | null;
}): Promise<void> {
  const { patients, appts, type, historyPatientId } = options;

  let doc: React.ReactElement<DocumentProps>;
  let filename: string;

  switch (type) {
    case 'pacientes':
      doc = <PatientsPDF patients={patients} />;
      filename = 'pacientes.pdf';
      break;
    case 'calendario':
      doc = <CalendarPDF appts={appts} />;
      filename = 'calendario.pdf';
      break;
    case 'historia': {
      const pid = historyPatientId ?? patients[0]?.id;
      if (!pid) throw new Error('No hay pacientes para generar el historial');
      const res = await reportsApi.history(pid);
      const name = (res.data.patient.name as string).replace(/\s+/g, '-').toLowerCase();
      doc = <HistoryPDF patient={res.data.patient} records={res.data.records} />;
      filename = `historial-${name}.pdf`;
      break;
    }
    default:
      doc = <OverviewPDF patients={patients} appts={appts} />;
      filename = 'resumen-general.pdf';
  }

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
