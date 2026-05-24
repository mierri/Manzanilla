import type { Patient, ClinicalRecord } from '@/types';
import { fmtDate, todayLong, wrapDoc } from './base';

export function buildHistoryHTML(patient: Patient, records: ClinicalRecord[]): string {
  const chips = [
    patient.age ? `${patient.age} años` : null,
    patient.sex === 'F' ? 'Femenino' : patient.sex === 'M' ? 'Masculino' : 'Otro',
    `Expediente #${patient.id}`,
  ].filter(Boolean).map(c => `<span class="chip">${c}</span>`).join('');

  const dataFields = `
    <div class="data-fields">
      <div class="df">
        <div class="label">Correo</div>
        <div class="value">${patient.email || '—'}</div>
      </div>
      <div class="df">
        <div class="label">Teléfono</div>
        <div class="value">${patient.phone || '—'}</div>
      </div>
      <div class="df" style="grid-column:1/-1">
        <div class="label">Dirección</div>
        <div class="value">${patient.address || '—'}</div>
      </div>
      <div class="df">
        <div class="label">Usuario</div>
        <div class="value" style="font-family:'DM Mono',monospace;font-size:13px">@${patient.username}</div>
      </div>
    </div>`;

  const recordBlocks = records.length === 0
    ? `<p style="text-align:center;color:var(--muted);font-style:italic;padding:32px 0">Sin consultas registradas</p>`
    : records.map(r => {
        const vitals = r.vitals ? `
          <div class="vitals">
            <div class="vital"><div class="vl">Temperatura</div><div class="vv">${r.vitals.temperature}°C</div></div>
            <div class="vital"><div class="vl">Peso</div><div class="vv">${r.vitals.weight} kg</div></div>
            <div class="vital"><div class="vl">Altura</div><div class="vv">${r.vitals.height} cm</div></div>
            <div class="vital"><div class="vl">Presión</div><div class="vv">${r.vitals.systolic}/${r.vitals.diastolic}</div></div>
            <div class="vital"><div class="vl">Frec. Card.</div><div class="vv">${r.vitals.heart_rate} bpm</div></div>
          </div>` : '';

        const diag = r.diagnosis
          ? `<p class="record-diag">${r.diagnosis}</p>` : '';

        const rx = r.prescriptions
          ? `<div class="record-field"><strong>Prescripciones</strong>${r.prescriptions}</div>` : '';

        const anl = r.analysis_results
          ? `<div class="record-field"><strong>Resultados</strong>${r.analysis_results}</div>` : '';

        const title = r.diagnosis?.split('.')[0]?.trim()?.slice(0, 60) || 'Consulta médica';

        return `
          <div class="record">
            <div class="record-head">
              <h3>${title}</h3>
              <span class="rdate">${fmtDate(r.created_at)}</span>
            </div>
            ${vitals}${diag}${rx}${anl}
          </div>`;
      }).join('');

  const body = `
<div class="doc-header">
  <div class="doc-header-inner">
    <div>
      <div class="doc-header-label">Historial Clínico</div>
      <h1>${patient.name}</h1>
      <div class="chips">${chips}</div>
    </div>
    <div class="doc-header-meta">
      <strong>Consultorio Manzanilla</strong>
      <span>${todayLong()}</span>
    </div>
  </div>
</div>

<div class="wrap">
  <div class="section-label">Datos del paciente</div>
  ${dataFields}

  <div class="section-label">Consultas registradas
    <span style="font-family:'DM Mono',monospace;font-weight:400;font-size:9px;color:var(--muted);text-transform:none;letter-spacing:0;margin-left:8px">(${records.length})</span>
  </div>
  ${recordBlocks}

  <div class="security">
    <div class="icon">🔒</div>
    <div>
      <strong>Documento confidencial</strong>
      <p>Solo el paciente y su médico tratante tienen acceso a este historial clínico.</p>
    </div>
  </div>

  <div class="doc-footer">
    Consultorio Manzanilla &nbsp;·&nbsp; Historial generado el ${todayLong()}
    <br>Documento confidencial — uso exclusivo médico-paciente
  </div>
</div>`;

  return wrapDoc({
    title: `Historial · ${patient.name}`,
    pageCSS: `@page { size: A4; margin: 18mm 20mm; }`,
    body,
  });
}
