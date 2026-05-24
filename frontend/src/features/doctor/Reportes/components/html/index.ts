import { reportsApi } from '@/lib/api';
import type { Patient, Appointment } from '@/types';
import { openHTML } from './base';
import { buildOverviewHTML }  from './overviewHTML';
import { buildPatientsHTML }  from './patientsHTML';
import { buildCalendarHTML }  from './calendarHTML';
import { buildHistoryHTML }   from './historyHTML';

export async function openReportHTML(options: {
  patients: Patient[];
  appts: Appointment[];
  type: 'overview' | 'pacientes' | 'calendario' | 'historia';
  historyPatientId?: number | null;
}): Promise<void> {
  const { patients, appts, type, historyPatientId } = options;
  let html: string;

  switch (type) {
    case 'pacientes':
      html = buildPatientsHTML(patients);
      break;
    case 'calendario':
      html = buildCalendarHTML(appts);
      break;
    case 'historia': {
      const pid = historyPatientId ?? patients[0]?.id;
      if (!pid) throw new Error('No hay pacientes para generar el historial');
      const res = await reportsApi.history(pid);
      html = buildHistoryHTML(res.data.patient, res.data.records);
      break;
    }
    default:
      html = buildOverviewHTML(patients, appts);
  }

  openHTML(html);
}
