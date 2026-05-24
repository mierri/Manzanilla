import type { Patient, Appointment } from '@/types';
import { barChartSVG, fmtDate, todayLong, MONTHS, parseD, wrapDoc } from './base';

export function buildOverviewHTML(patients: Patient[], appts: Appointment[]): string {
  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  const monthAppts = appts.filter(a => {
    const d = parseD(a.appointment_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const confirmed = appts.filter(a => a.status === 'confirmed').length;
  const pending   = appts.filter(a => a.status === 'pending').length;
  const cancelled = appts.filter(a => a.status === 'cancelled').length;
  const total     = confirmed + pending + cancelled || 1;

  const weekBuckets = [0, 0, 0, 0, 0];
  monthAppts.forEach(a => {
    const d = parseD(a.appointment_date);
    weekBuckets[Math.min(Math.floor((d.getDate() - 1) / 7), 4)]++;
  });

  const topPats = [...patients]
    .sort((a, b) => (b.notes_count ?? 0) - (a.notes_count ?? 0))
    .slice(0, 4);

  const statCards = [
    { val: appts.length,   lbl: 'Total citas',  bg: '#F8D9C2' },
    { val: confirmed,      lbl: 'Confirmadas',   bg: '#D9E5CF' },
    { val: pending,        lbl: 'Pendientes',    bg: '#F5E5BD' },
    { val: patients.length,lbl: 'Pacientes',     bg: '#E5DBF0' },
  ].map(c => `
    <div class="stat-card" style="background:${c.bg}">
      <div class="val">${c.val}</div>
      <div class="lbl">${c.lbl}</div>
    </div>`).join('');

  const statusBars = [
    { lbl: 'Confirmadas', count: confirmed, pct: Math.round(confirmed / total * 100), fill: '#D9E5CF' },
    { lbl: 'Pendientes',  count: pending,   pct: Math.round(pending   / total * 100), fill: '#F5E5BD' },
    { lbl: 'Canceladas',  count: cancelled, pct: Math.round(cancelled / total * 100), fill: '#F4C9C4' },
  ].map(s => `
    <div class="status-row">
      <span class="status-lbl">${s.lbl}</span>
      <div class="status-track"><div class="status-fill" style="width:${Math.max(s.pct,1)}%;background:${s.fill}"></div></div>
      <span class="status-pct">${s.pct}% <span style="color:var(--muted);font-size:10px">(${s.count})</span></span>
    </div>`).join('');

  const topCards = topPats.length === 0
    ? `<p style="color:var(--muted);font-style:italic;font-size:12px">Sin datos de pacientes</p>`
    : topPats.map((p, i) => `
      <div class="tp-card">
        <div class="rank">#${i + 1}</div>
        <div class="name">${p.name}</div>
        <div class="count">${p.notes_count ?? 0} consultas</div>
      </div>`).join('');

  const lastAppts = [...appts]
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date))
    .slice(0, 6);

  const recentRows = lastAppts.map(a => `
    <tr>
      <td>${fmtDate(a.appointment_date)}</td>
      <td>${a.patient?.name ?? '—'}</td>
      <td>${
        a.status === 'confirmed' ? '<span style="color:var(--ok);font-weight:600">Confirmada</span>'
        : a.status === 'cancelled' ? '<span style="color:var(--danger);font-weight:600">Cancelada</span>'
        : '<span style="color:var(--warn);font-weight:600">Pendiente</span>'
      }</td>
    </tr>`).join('');

  const body = `
<div class="doc-header">
  <div class="doc-header-inner">
    <div>
      <div class="doc-header-label">Consultorio Manzanilla · Reporte</div>
      <h1>Resumen General</h1>
      <div class="doc-header-sub">${MONTHS[month]} ${year}</div>
    </div>
    <div class="doc-header-meta">
      <strong>Consultorio Manzanilla</strong>
      <span>${todayLong()}</span>
    </div>
  </div>
</div>

<div class="wrap">
  <div class="section-label">Indicadores del período</div>
  <div class="stat-cards">${statCards}</div>

  <div class="section-label">Consultas por semana · ${MONTHS[month]} ${year}</div>
  ${barChartSVG(weekBuckets, ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5'])}

  <div class="section-label">Distribución de estados</div>
  ${statusBars}

  <div class="section-label">Pacientes con más consultas</div>
  <div class="top-patients">${topCards}</div>

  ${lastAppts.length > 0 ? `
  <div class="section-label">Últimas citas registradas</div>
  <table class="patient-table">
    <thead><tr><th>Fecha</th><th>Paciente</th><th>Estado</th></tr></thead>
    <tbody>${recentRows}</tbody>
  </table>` : ''}

  <div class="doc-footer">
    Consultorio Manzanilla &nbsp;·&nbsp; Reporte generado el ${todayLong()}
    <br>Documento de uso interno — no distribuir sin autorización
  </div>
</div>`;

  return wrapDoc({
    title: `Resumen General · ${MONTHS[month]} ${year}`,
    pageCSS: `@page { size: A4; margin: 18mm 20mm; }`,
    body,
  });
}
