import { Document, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Patient, ClinicalRecord } from '@/types';
import { C } from './colors';
import { DocPage, SLabel, FONT_HEADING } from './DocPage';
import { fmtDate, todayLong } from './utils';

const s = StyleSheet.create({
  chips: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  chip: { fontSize: 9, fontWeight: 500, backgroundColor: C.peach, color: C.inkS, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },

  dataFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 14 },
  dfLabel: { fontSize: 6.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, marginBottom: 2 },
  dfValue: { fontSize: 12, color: C.ink },

  record: { marginBottom: 18, paddingBottom: 18, borderBottomWidth: 0.75, borderBottomColor: C.hair },
  recordHead: {
    backgroundColor: C.ct,
    borderLeftWidth: 3,
    borderLeftColor: C.warn,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: { fontFamily: FONT_HEADING, fontSize: 13, fontWeight: 600, color: C.ink, flex: 1 },
  recordDate: { fontSize: 9.5, color: C.muted, marginLeft: 10 },

  vitals: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  vital: { flex: 1, backgroundColor: C.card, borderWidth: 0.75, borderColor: C.hair, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center' },
  vitalLbl: { fontSize: 6, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.muted, marginBottom: 4, textAlign: 'center' },
  vitalVal: { fontFamily: FONT_HEADING, fontSize: 13, fontWeight: 600, color: C.ink, textAlign: 'center' },

  diag: { fontSize: 11.5, color: C.ink, lineHeight: 1.7, marginBottom: 8 },
  field: { fontSize: 10.5, color: C.inkS, lineHeight: 1.6, marginTop: 5 },
  fieldLabel: { fontSize: 7.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: C.muted },

  securityBox: {
    backgroundColor: C.sage,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  securityTitle: { fontSize: 11, fontWeight: 700, color: C.ok, marginBottom: 3 },
  securityText: { fontSize: 9.5, color: C.inkS },
});

interface Props { patient: Patient; records: ClinicalRecord[] }

export function HistoryPDF({ patient, records }: Props) {
  const today = todayLong();

  const chips = [
    patient.age ? `${patient.age} años` : null,
    patient.sex === 'F' ? 'Femenino' : patient.sex === 'M' ? 'Masculino' : 'Otro',
    `Expediente #${patient.id}`,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <DocPage
        label="Historial Clínico"
        title={patient.name}
        footer={`Consultorio Manzanilla · Historial generado el ${today}\nDocumento confidencial — uso exclusivo médico-paciente`}
        todayStr={today}
      >
        <View style={s.chips}>
          {chips.map(c => <Text key={c} style={s.chip}>{c}</Text>)}
        </View>

        <SLabel text="Datos del paciente" />
        <View style={s.dataFields}>
          <View style={{ width: '45%' }}>
            <Text style={s.dfLabel}>Correo</Text>
            <Text style={s.dfValue}>{patient.email || '—'}</Text>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={s.dfLabel}>Teléfono</Text>
            <Text style={s.dfValue}>{patient.phone || '—'}</Text>
          </View>
          <View style={{ width: '92%' }}>
            <Text style={s.dfLabel}>Dirección</Text>
            <Text style={s.dfValue}>{patient.address || '—'}</Text>
          </View>
          <View style={{ width: '45%' }}>
            <Text style={s.dfLabel}>Usuario</Text>
            <Text style={[s.dfValue, { fontSize: 11 }]}>@{patient.username}</Text>
          </View>
        </View>

        <SLabel text={`Consultas registradas (${records.length})`} />

        {records.length === 0 ? (
          <Text style={{ fontSize: 10.5, color: C.muted, textAlign: 'center', paddingVertical: 20 }}>
            Sin consultas registradas
          </Text>
        ) : records.map(r => {
          const title = r.diagnosis?.split('.')[0]?.trim()?.slice(0, 60) || 'Consulta médica';
          return (
            <View key={r.id} style={s.record} wrap={false}>
              <View style={s.recordHead}>
                <Text style={s.recordTitle}>{title}</Text>
                <Text style={s.recordDate}>{fmtDate(r.created_at)}</Text>
              </View>

              {r.vitals && (
                <View style={s.vitals}>
                  {[
                    { lbl: 'Temperatura', val: `${r.vitals.temperature}°C` },
                    { lbl: 'Peso',        val: `${r.vitals.weight} kg` },
                    { lbl: 'Altura',      val: `${r.vitals.height} cm` },
                    { lbl: 'Presión',     val: `${r.vitals.systolic}/${r.vitals.diastolic}` },
                    { lbl: 'Frec. Card.', val: `${r.vitals.heart_rate} bpm` },
                  ].map(v => (
                    <View key={v.lbl} style={s.vital}>
                      <Text style={s.vitalLbl}>{v.lbl}</Text>
                      <Text style={s.vitalVal}>{v.val}</Text>
                    </View>
                  ))}
                </View>
              )}

              {r.diagnosis && <Text style={s.diag}>{r.diagnosis}</Text>}
              {r.prescriptions && (
                <Text style={s.field}>
                  <Text style={s.fieldLabel}>Prescripciones{'  '}</Text>{r.prescriptions}
                </Text>
              )}
              {r.analysis_results && (
                <Text style={s.field}>
                  <Text style={s.fieldLabel}>Resultados{'  '}</Text>{r.analysis_results}
                </Text>
              )}
            </View>
          );
        })}

        <View style={s.securityBox} wrap={false}>
          <View style={{ flex: 1 }}>
            <Text style={s.securityTitle}>Documento confidencial</Text>
            <Text style={s.securityText}>
              Solo el paciente y su médico tratante tienen acceso a este historial clínico.
            </Text>
          </View>
        </View>
      </DocPage>
    </Document>
  );
}
