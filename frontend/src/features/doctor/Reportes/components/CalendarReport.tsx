import { Calendar } from 'lucide-react';
import { fmtTime, fmtDate, parseApptDate } from '@/lib/utils';
import type { Appointment } from '@/types';

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_SH   = ['dom','lun','mar','mié','jue','vie','sáb'];

function addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function fmtRange(from: Date, to: Date): string {
  return `${from.getDate()} al ${to.getDate()} de ${MONTHS_ES[to.getMonth()]} ${to.getFullYear()}`;
}

interface Props { appts: Appointment[]; }

export function CalendarReport({ appts }: Props) {
  const today = new Date();
  const days  = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const apptsByDay = (d: Date) =>
    appts.filter(a => {
      const ap = parseApptDate(a.appointment_date);
      return ap.getFullYear() === d.getFullYear() && ap.getMonth() === d.getMonth() && ap.getDate() === d.getDate();
    }).sort((a, b) => parseApptDate(a.appointment_date).getTime() - parseApptDate(b.appointment_date).getTime());

  const totalThisWeek = days.reduce((s, d) => s + apptsByDay(d).length, 0);

  return (
    <div className="card print-doc" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '26px 32px', background: 'var(--card-tint)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/flor.svg" width={42} height={42} aria-hidden />
          <div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>Calendario semanal</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>{fmtRange(days[0], days[6])}</div>
          </div>
        </div>
        <span className="chip chip-butter"><Calendar size={12} /> {totalThisWeek} citas esta semana</span>
      </div>
      <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, overflowX: 'auto' }} className="resp-cal-7">
        {days.map((d, di) => {
          const dayAppts = apptsByDay(d);
          const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
          return (
            <div key={di} style={{ background: isToday ? 'var(--butter)' : 'var(--card-tint)', borderRadius: 16, padding: 14, minHeight: 200 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>{DAYS_SH[d.getDay()]}</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 2, marginBottom: 12 }}>{d.getDate()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayAppts.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>sin citas</div>}
                {dayAppts.map(a => (
                  <div key={a.id} style={{ background: '#fff', borderRadius: 10, padding: '6px 9px' }}>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-soft)' }}>{fmtTime(a.appointment_date)}</div>
                    <div style={{ fontWeight: 500, fontSize: 12, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.patient?.name?.split(' ').slice(0, 2).join(' ') ?? 'Paciente'}
                    </div>
                    {a.reason && <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '16px 32px', background: 'var(--bg)', fontSize: 11.5, color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--hairline)' }}>
        <span>Semana del {fmtRange(days[0], days[6])}</span>
        <span>Generado el {fmtDate(new Date().toISOString())}</span>
      </div>
    </div>
  );
}
