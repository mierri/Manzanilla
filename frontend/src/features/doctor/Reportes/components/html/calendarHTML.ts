import type { Appointment } from '@/types';
import { fmtTime, todayLong, MONTHS, DAYS_S, parseD, wrapDoc } from './base';

export function buildCalendarHTML(appts: Appointment[]): string {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() + i); return d;
  });

  const from = days[0]; const to = days[6];
  const rangeStr = from.getMonth() === to.getMonth()
    ? `${from.getDate()} – ${to.getDate()} de ${MONTHS[to.getMonth()]} ${to.getFullYear()}`
    : `${from.getDate()} ${MONTHS[from.getMonth()]} – ${to.getDate()} ${MONTHS[to.getMonth()]} ${to.getFullYear()}`;

  const weekAppts = appts.filter(a =>
    days.some(d => parseD(a.appointment_date).toDateString() === d.toDateString())
  );

  const cols = days.map(day => {
    const isToday = day.toDateString() === today.toDateString();
    const dayAppts = appts
      .filter(a => parseD(a.appointment_date).toDateString() === day.toDateString())
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

    const cards = dayAppts.length === 0
      ? `<div class="cal-empty">sin citas</div>`
      : dayAppts.map(a => {
          const dotColor = a.status === 'confirmed' ? '#4A7C56'
            : a.status === 'cancelled' ? '#B5524C' : '#C97A3D';
          const patName = a.patient?.name?.split(' ').slice(0, 2).join(' ') ?? 'Paciente';
          return `
            <div class="cal-appt">
              <div class="ca-time" style="display:flex;align-items:center;gap:5px">
                <span style="width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0;display:inline-block"></span>
                ${fmtTime(a.appointment_date)}
              </div>
              <div class="ca-pat">${patName}</div>
            </div>`;
        }).join('');

    const count = dayAppts.length;
    return `
      <div class="cal-col${isToday ? ' today' : ''}">
        <div class="cal-day-name">${DAYS_S[day.getDay()]}</div>
        <div class="cal-day-num">${day.getDate()}</div>
        ${cards}
        ${count > 0 ? `<div style="font-size:9.5px;color:var(--muted);margin-top:8px;text-align:center">${count} cita${count !== 1 ? 's' : ''}</div>` : ''}
      </div>`;
  }).join('');

  const body = `
<div class="doc-header" style="padding:36px 52px">
  <div class="doc-header-inner">
    <div>
      <div class="doc-header-label">Consultorio Manzanilla · Reporte</div>
      <h1 style="font-size:2rem">Calendario Semanal</h1>
      <div class="doc-header-sub">${rangeStr}</div>
    </div>
    <div class="doc-header-meta">
      <strong>Consultorio Manzanilla</strong>
      <span>${weekAppts.length} citas esta semana</span>
    </div>
  </div>
</div>

<div style="padding:28px 32px 60px">
  <div class="cal-grid">${cols}</div>

  <div class="doc-footer" style="margin-top:32px">
    Consultorio Manzanilla &nbsp;·&nbsp; Semana generada el ${todayLong()}
  </div>
</div>`;

  return wrapDoc({
    title: `Calendario ${rangeStr}`,
    pageCSS: `
      @page { size: A4 landscape; margin: 14mm 16mm; }
      body { font-size: 12px; }
      .cal-grid { gap: 5px; }
      .cal-col { padding: 9px 7px; }
    `,
    body,
  });
}
