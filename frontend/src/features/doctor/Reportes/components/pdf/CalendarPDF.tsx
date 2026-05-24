import { Document, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Appointment } from '@/types';
import { C } from './colors';
import { DocPage } from './DocPage';
import { MONTHS, DAYS_S, parseD, fmtTime, todayLong } from './utils';

const s = StyleSheet.create({
  // Landscape LETTER body ≈ 516h − 100 header − 32 body padding − 40 footer clearance = ~344
  calGrid: { flexDirection: 'row', gap: 5, marginTop: 4, height: 344 },
  calCol: { flex: 1, backgroundColor: C.ct, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 7, overflow: 'hidden' },
  calColToday: { backgroundColor: C.butter },
  calDayName: { fontSize: 6.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: C.muted, marginBottom: 2 },
  calDayNameToday: { color: C.warn },
  calDayNum: { fontSize: 18, fontWeight: 700, color: C.ink, lineHeight: 1, marginBottom: 6, paddingBottom: 5, borderBottomWidth: 0.75, borderBottomColor: C.hair },
  calDayNumToday: { color: C.warn },
  calAppt: { backgroundColor: C.card, borderRadius: 5, paddingVertical: 4, paddingHorizontal: 5, marginBottom: 3, borderLeftWidth: 2.5 },
  calTime: { fontSize: 7, fontWeight: 700, color: C.warn, marginBottom: 1 },
  calPat: { fontSize: 7.5, color: C.ink, lineHeight: 1.2 },
  calEmpty: { fontSize: 8, color: C.muted, textAlign: 'center', paddingTop: 10 },
  calCount: { fontSize: 7.5, color: C.muted, textAlign: 'center', marginTop: 6 },
});

interface Props { appts: Appointment[] }

export function CalendarPDF({ appts }: Props) {
  const today = new Date();
  const todayStr = todayLong();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const from = days[0]; const to = days[6];
  const rangeStr = from.getMonth() === to.getMonth()
    ? `${from.getDate()} – ${to.getDate()} de ${MONTHS[to.getMonth()]} ${to.getFullYear()}`
    : `${from.getDate()} ${MONTHS[from.getMonth()]} – ${to.getDate()} ${MONTHS[to.getMonth()]} ${to.getFullYear()}`;

  const weekAppts = appts.filter(a =>
    days.some(d => parseD(a.appointment_date).toDateString() === d.toDateString())
  );

  return (
    <Document>
      <DocPage
        size="LETTER"
        orientation="landscape"
        label="Consultorio Manzanilla · Reporte"
        title="Calendario Semanal"
        sub={rangeStr}
        footer={`Consultorio Manzanilla · Semana generada el ${todayStr} · ${weekAppts.length} citas esta semana`}
        todayStr={todayStr}
      >
        <View style={s.calGrid}>
          {days.map(day => {
            const isToday = day.toDateString() === today.toDateString();
            const dayAppts = appts
              .filter(a => parseD(a.appointment_date).toDateString() === day.toDateString())
              .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
            const count = dayAppts.length;

            return (
              <View key={day.toISOString()} style={[s.calCol, isToday ? s.calColToday : {}]}>
                <Text style={[s.calDayName, isToday ? s.calDayNameToday : {}]}>
                  {DAYS_S[day.getDay()]}
                </Text>
                <Text style={[s.calDayNum, isToday ? s.calDayNumToday : {}]}>
                  {day.getDate()}
                </Text>

                {dayAppts.length === 0 ? (
                  <Text style={s.calEmpty}>sin citas</Text>
                ) : dayAppts.map(a => {
                  const borderColor = a.status === 'confirmed' ? C.ok
                    : a.status === 'cancelled' ? C.danger : C.warn;
                  const patName = a.patient?.name?.split(' ').slice(0, 2).join(' ') ?? 'Paciente';
                  return (
                    <View key={a.id} style={[s.calAppt, { borderLeftColor: borderColor }]}>
                      <Text style={s.calTime}>{fmtTime(a.appointment_date)}</Text>
                      <Text style={s.calPat}>{patName}</Text>
                    </View>
                  );
                })}

                {count > 0 && (
                  <Text style={s.calCount}>{count} cita{count !== 1 ? 's' : ''}</Text>
                )}
              </View>
            );
          })}
        </View>
      </DocPage>
    </Document>
  );
}
