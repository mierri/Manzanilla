import { Document, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Patient } from '@/types';
import { C } from './colors';
import { DocPage, SLabel } from './DocPage';
import { fmtDate, todayLong } from './utils';

const s = StyleSheet.create({
  tableHead: { flexDirection: 'row', backgroundColor: C.ink, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tableTh: { fontSize: 6.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: '#FFF9EE', paddingVertical: 7, paddingHorizontal: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.hair, alignItems: 'center' },
  tableRowAlt: { backgroundColor: C.ct },
  tableTd: { fontSize: 9.5, color: C.inkS, paddingVertical: 7, paddingHorizontal: 8 },
  mono: { fontSize: 9 },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.ct,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
  },
});

interface Props { patients: Patient[] }

export function PatientsPDF({ patients }: Props) {
  const today = todayLong();

  return (
    <Document>
      <DocPage
        label="Consultorio Manzanilla · Reporte"
        title="Lista de Pacientes"
        sub={`${patients.length} pacientes registrados`}
        footer={`Consultorio Manzanilla · Lista generada el ${today}\nDocumento de uso interno — no distribuir sin autorización`}
        todayStr={today}
      >
        <SLabel text="Directorio de pacientes" />
        <View>
          <View style={s.tableHead}>
            <Text style={[s.tableTh, { flex: 0.4 }]}>#</Text>
            <Text style={[s.tableTh, { flex: 2 }]}>Nombre</Text>
            <Text style={[s.tableTh, { flex: 0.5 }]}>Edad</Text>
            <Text style={[s.tableTh, { flex: 0.7 }]}>Sexo</Text>
            <Text style={[s.tableTh, { flex: 1.1 }]}>Teléfono</Text>
            <Text style={[s.tableTh, { flex: 1.8 }]}>Correo</Text>
            <Text style={[s.tableTh, { flex: 0.5 }]}>Citas</Text>
            <Text style={[s.tableTh, { flex: 1 }]}>Última visita</Text>
          </View>

          {patients.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: C.muted }}>Sin pacientes registrados</Text>
            </View>
          ) : patients.map((p, i) => (
            <View key={p.id} wrap={false} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableTd, s.mono, { flex: 0.4 }]}>{String(i + 1).padStart(3, '0')}</Text>
              <View style={{ flex: 2, paddingVertical: 7, paddingHorizontal: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: 600, color: C.ink }}>{p.name}</Text>
                <Text style={{ fontSize: 8, color: C.muted }}>@{p.username}</Text>
              </View>
              <Text style={[s.tableTd, s.mono, { flex: 0.5 }]}>{p.age ?? '—'}</Text>
              <Text style={[s.tableTd, { flex: 0.7 }]}>
                {p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : p.sex ?? '—'}
              </Text>
              <Text style={[s.tableTd, s.mono, { flex: 1.1 }]}>{p.phone || '—'}</Text>
              <Text style={[s.tableTd, { flex: 1.8, fontSize: 8.5 }]}>{p.email || '—'}</Text>
              <Text style={[s.tableTd, s.mono, { flex: 0.5, fontWeight: 700 }]}>{p.notes_count ?? 0}</Text>
              <Text style={[s.tableTd, s.mono, { flex: 1 }]}>{p.last_visit ? fmtDate(p.last_visit) : '—'}</Text>
            </View>
          ))}
        </View>

        <View style={s.totalBar}>
          <Text style={{ fontSize: 10, color: C.inkS }}>
            Total: <Text style={{ fontWeight: 700, color: C.ink }}>{patients.length} pacientes</Text>
          </Text>
          <Text style={{ fontSize: 9, color: C.muted }}>Generado: {today}</Text>
        </View>
      </DocPage>
    </Document>
  );
}
