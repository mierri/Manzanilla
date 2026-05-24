import { Document, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Patient, Appointment } from '@/types';
import { C } from './colors';
import { DocPage, SLabel, FONT_HEADING } from './DocPage';
import { BarChart } from './BarChart';
import { MONTHS, parseD, fmtDate, todayLong } from './utils';

const s = StyleSheet.create({
  statCards: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statCard: { flex: 1, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 12 },
  statVal: { fontFamily: FONT_HEADING, fontSize: 26, fontWeight: 700, color: C.ink, marginBottom: 4, lineHeight: 1 },
  statLbl: { fontSize: 6.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkS },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 },
  statusLbl: { fontSize: 10, color: C.inkS, width: 72 },
  statusTrack: { flex: 1, height: 8, borderRadius: 999, backgroundColor: C.bgAlt },
  statusFill: { height: 8, borderRadius: 999 },
  statusPct: { fontSize: 9.5, color: C.ink, width: 56, textAlign: 'right' },

  topCards: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  topCard: { flex: 1, backgroundColor: C.ct, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 10 },
  topRank: { fontSize: 17, fontWeight: 700, color: C.hair, textAlign: 'right', marginBottom: 6 },
  topName: { fontSize: 10, fontWeight: 600, color: C.ink, marginBottom: 3 },
  topCount: { fontSize: 8.5, color: C.muted },

  tableHead: { flexDirection: 'row', backgroundColor: C.ink, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tableTh: { fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#FFF9EE', paddingVertical: 7, paddingHorizontal: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.hair },
  tableRowAlt: { backgroundColor: C.ct },
  tableTd: { fontSize: 10, color: C.inkS, paddingVertical: 8, paddingHorizontal: 10 },
});

interface Props { patients: Patient[]; appts: Appointment[] }

export function OverviewPDF({ patients, appts }: Props) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = todayLong();

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

  const topPats = [...patients].sort((a, b) => (b.notes_count ?? 0) - (a.notes_count ?? 0)).slice(0, 4);
  const lastAppts = [...appts].sort((a, b) => b.appointment_date.localeCompare(a.appointment_date)).slice(0, 6);

  const statCards = [
    { val: appts.length,    lbl: 'Total citas',  bg: C.peach },
    { val: confirmed,       lbl: 'Confirmadas',   bg: C.sage },
    { val: pending,         lbl: 'Pendientes',    bg: C.butter },
    { val: patients.length, lbl: 'Pacientes',     bg: C.lavender },
  ];

  const statusBars = [
    { lbl: 'Confirmadas', count: confirmed, pct: Math.round(confirmed / total * 100), fill: C.sage },
    { lbl: 'Pendientes',  count: pending,   pct: Math.round(pending   / total * 100), fill: C.butter },
    { lbl: 'Canceladas',  count: cancelled, pct: Math.round(cancelled / total * 100), fill: C.blush },
  ];

  return (
    <Document>
      <DocPage
        label="Consultorio Manzanilla · Reporte"
        title="Resumen General"
        sub={`${MONTHS[month]} ${year}`}
        footer={`Consultorio Manzanilla · Reporte generado el ${today}\nDocumento de uso interno — no distribuir sin autorización`}
        todayStr={today}
      >
        <SLabel text="Indicadores del período" />
        <View style={s.statCards}>
          {statCards.map(c => (
            <View key={c.lbl} style={[s.statCard, { backgroundColor: c.bg }]}>
              <Text style={s.statVal}>{c.val}</Text>
              <Text style={s.statLbl}>{c.lbl}</Text>
            </View>
          ))}
        </View>

        <SLabel text={`Consultas por semana · ${MONTHS[month]} ${year}`} />
        <BarChart buckets={weekBuckets} labels={['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5']} width={460} />

        <SLabel text="Distribución de estados" />
        {statusBars.map(bar => (
          <View key={bar.lbl} style={s.statusRow}>
            <Text style={s.statusLbl}>{bar.lbl}</Text>
            <View style={s.statusTrack}>
              <View style={[s.statusFill, { width: `${Math.max(bar.pct, 1)}%`, backgroundColor: bar.fill }]} />
            </View>
            <Text style={s.statusPct}>{bar.pct}% ({bar.count})</Text>
          </View>
        ))}

        {topPats.length > 0 && (
          <>
            <SLabel text="Pacientes con más consultas" />
            <View style={s.topCards}>
              {topPats.map((p, i) => (
                <View key={p.id} style={s.topCard}>
                  <Text style={s.topRank}>#{i + 1}</Text>
                  <Text style={s.topName}>{p.name}</Text>
                  <Text style={s.topCount}>{p.notes_count ?? 0} consultas</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {lastAppts.length > 0 && (
          <>
            <SLabel text="Últimas citas registradas" />
            <View>
              <View style={s.tableHead}>
                <Text style={[s.tableTh, { flex: 1.2 }]}>Fecha</Text>
                <Text style={[s.tableTh, { flex: 2 }]}>Paciente</Text>
                <Text style={[s.tableTh, { flex: 1 }]}>Estado</Text>
              </View>
              {lastAppts.map((a, i) => (
                <View key={a.id} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                  <Text style={[s.tableTd, { flex: 1.2 }]}>{fmtDate(a.appointment_date)}</Text>
                  <Text style={[s.tableTd, { flex: 2 }]}>{a.patient?.name ?? '—'}</Text>
                  <Text style={[s.tableTd, {
                    flex: 1,
                    color: a.status === 'confirmed' ? C.ok : a.status === 'cancelled' ? C.danger : C.warn,
                    fontWeight: 600,
                  }]}>
                    {a.status === 'confirmed' ? 'Confirmada' : a.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </DocPage>
    </Document>
  );
}
