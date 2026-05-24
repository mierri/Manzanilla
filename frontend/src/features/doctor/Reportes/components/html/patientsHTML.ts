import type { Patient } from '@/types';
import { fmtDate, todayLong, wrapDoc } from './base';

export function buildPatientsHTML(patients: Patient[]): string {
  const rows = patients.map((p, i) => `
    <tr>
      <td style="color:var(--muted);font-family:'DM Mono',monospace;font-size:10.5px">${String(i + 1).padStart(3, '0')}</td>
      <td>
        <span class="n-name">${p.name}</span>
        <span class="n-user">@${p.username}</span>
      </td>
      <td style="font-family:'DM Mono',monospace;font-size:11.5px">${p.age ?? '—'}</td>
      <td>${p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : p.sex ?? '—'}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11px">${p.phone || '—'}</td>
      <td style="font-size:11px;color:var(--inks)">${p.email || '—'}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11.5px;font-weight:600;color:var(--ink)">${p.notes_count ?? 0}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11px;color:var(--inks)">${p.last_visit ? fmtDate(p.last_visit) : '—'}</td>
    </tr>`).join('');

  const empty = patients.length === 0
    ? `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--muted);font-style:italic">Sin pacientes registrados</td></tr>`
    : '';

  const body = `
<div class="doc-header">
  <div class="doc-header-inner">
    <div>
      <div class="doc-header-label">Consultorio Manzanilla · Reporte</div>
      <h1>Lista de Pacientes</h1>
      <div class="doc-header-sub">${patients.length} pacientes registrados</div>
    </div>
    <div class="doc-header-meta">
      <strong>Consultorio Manzanilla</strong>
      <span>${todayLong()}</span>
    </div>
  </div>
</div>

<div class="wrap">
  <div class="section-label">Directorio de pacientes</div>
  <table class="patient-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Edad</th>
        <th>Sexo</th>
        <th>Teléfono</th>
        <th>Correo</th>
        <th>Citas</th>
        <th>Última visita</th>
      </tr>
    </thead>
    <tbody>${rows}${empty}</tbody>
  </table>

  <div style="background:var(--ct);border-radius:10px;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-top:14px;color:var(--inks)">
    <span>Total: <strong style="color:var(--ink)">${patients.length} pacientes</strong></span>
    <span>Generado: ${todayLong()}</span>
  </div>

  <div class="doc-footer">
    Consultorio Manzanilla &nbsp;·&nbsp; Lista generada el ${todayLong()}
    <br>Documento de uso interno — no distribuir sin autorización
  </div>
</div>`;

  return wrapDoc({
    title: `Lista de Pacientes · ${todayLong()}`,
    pageCSS: `@page { size: A4; margin: 18mm 20mm; }`,
    body,
  });
}
