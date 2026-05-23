import jsPDF from 'jspdf';
import { reportsApi } from '@/lib/api';
import type { Patient, Appointment, ClinicalRecord } from '@/types';

export interface HistoryData { patient: Patient; records: ClinicalRecord[] }

// ── Palette (mirrors CSS variables) ──────────────────────────
type RGB = [number, number, number];
const C: Record<string, RGB> = {
  bg:       [251, 245, 236],
  cardTint: [255, 249, 238],
  peach:    [248, 217, 194],
  butter:   [245, 229, 189],
  sage:     [217, 229, 207],
  blush:    [244, 201, 196],
  lavender: [229, 219, 240],
  ink:      [43,  37,  32 ],
  inkSoft:  [92,  80,  72 ],
  muted:    [161, 149, 138],
  hairline: [239, 229, 210],
  ok:       [74,  124, 86 ],
  warn:     [201, 122, 61 ],
  danger:   [181, 82,  76 ],
  white:    [255, 255, 255],
  sageText: [60,  90,  63 ],
};

// ── Color setters ─────────────────────────────────────────────
const fc = (p: jsPDF, c: RGB) => p.setFillColor(c[0], c[1], c[2]);
const dc = (p: jsPDF, c: RGB) => p.setDrawColor(c[0], c[1], c[2]);
const tc = (p: jsPDF, c: RGB) => p.setTextColor(c[0], c[1], c[2]);

// ── Layout constants ──────────────────────────────────────────
const ML = 18; const MR = 18;
const pw = (p: jsPDF) => p.internal.pageSize.getWidth();
const ph = (p: jsPDF) => p.internal.pageSize.getHeight();
const cw = (p: jsPDF) => pw(p) - ML - MR;

// ── Date helpers ──────────────────────────────────────────────
const parseD = (s: string) => new Date(s.includes('T') ? s : s.replace(' ', 'T'));
const fmtD   = (s: string) => s
  ? parseD(s).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
  : '—';
const fmtT = (s: string) =>
  parseD(s).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
const todayLong = () =>
  new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                'septiembre','octubre','noviembre','diciembre'];
const DAYS_SHORT = ['dom','lun','mar','mié','jue','vie','sáb'];

// ── Shared drawing helpers ────────────────────────────────────

function drawPageHeader(pdf: jsPDF, title: string, subtitle: string): number {
  const W = pw(pdf); const H = 42;
  fc(pdf, C.butter); pdf.rect(0, 0, W, H, 'F');
  fc(pdf, C.warn);   pdf.rect(0, 0, 5, H, 'F');

  pdf.setFont('helvetica', 'bold');   pdf.setFontSize(19); tc(pdf, C.ink);
  pdf.text(title, ML + 9, 18);

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);  tc(pdf, C.inkSoft);
  pdf.text(subtitle, ML + 9, 27);

  pdf.setFont('helvetica', 'bold');   pdf.setFontSize(9.5); tc(pdf, C.ink);
  pdf.text('Consultorio Manzanilla', W - MR, 16, { align: 'right' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);   tc(pdf, C.muted);
  pdf.text(todayLong(), W - MR, 24, { align: 'right' });

  return H + 6;
}

function drawPageFooter(pdf: jsPDF, page: number, total: number): void {
  const W = pw(pdf); const H = ph(pdf); const y = H - 10;
  dc(pdf, C.hairline); pdf.setLineWidth(0.3);
  pdf.line(ML, y - 4, W - MR, y - 4);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); tc(pdf, C.muted);
  pdf.text('Consultorio Manzanilla · Documento generado automáticamente', ML, y);
  pdf.text(`Página ${page} de ${total}`, W - MR, y, { align: 'right' });
}

function addAllFooters(pdf: jsPDF): void {
  const n = pdf.getNumberOfPages();
  for (let i = 1; i <= n; i++) { pdf.setPage(i); drawPageFooter(pdf, i, n); }
}

function sectionLabel(pdf: jsPDF, text: string, y: number): number {
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); tc(pdf, C.muted);
  pdf.text(text.toUpperCase(), ML, y);
  dc(pdf, C.hairline); pdf.setLineWidth(0.25);
  pdf.line(ML, y + 1.5, ML + cw(pdf), y + 1.5);
  return y + 7;
}

// ── 1. PATIENTS LIST ──────────────────────────────────────────
function buildPatientsPDF(patients: Patient[]): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pw(pdf); const CW = cw(pdf); const PH = ph(pdf);
  const FOOTER_Y = PH - 16;

  // Column x positions (widths sum to CW=174)
  const cols = [8, 44, 11, 15, 24, 38, 12, 22]; // widths
  const colX: number[] = [];
  cols.reduce((acc, w, i) => { colX[i] = acc; return acc + w; }, ML);

  const ROW_H = 9.5;

  let y = drawPageHeader(pdf,
    'Lista de Pacientes',
    `${patients.length} pacientes registrados`
  );

  const drawTHead = (yy: number): number => {
    fc(pdf, C.bg); pdf.rect(ML, yy, CW, 8.5, 'F');
    const headers = ['#', 'Nombre', 'Edad', 'Sexo', 'Teléfono', 'Correo', 'Citas', 'Última visita'];
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); tc(pdf, C.muted);
    headers.forEach((h, i) => pdf.text(h, colX[i] + 1.5, yy + 5.8));
    dc(pdf, C.hairline); pdf.setLineWidth(0.3);
    pdf.line(ML, yy + 8.5, ML + CW, yy + 8.5);
    return yy + 8.5;
  };

  y = drawTHead(y);

  patients.forEach((p, i) => {
    if (y + ROW_H > FOOTER_Y) {
      pdf.addPage(); y = 20; y = drawTHead(y);
    }
    if (i % 2 === 1) { fc(pdf, C.cardTint); pdf.rect(ML, y, CW, ROW_H, 'F'); }

    // #
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); tc(pdf, C.muted);
    pdf.text(String(i + 1).padStart(3, '0'), colX[0] + 1.5, y + 6.5);

    // Name + username
    const nameStr = pdf.splitTextToSize(p.name, cols[1] - 4)[0] as string;
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); tc(pdf, C.ink);
    pdf.text(nameStr, colX[1] + 1.5, y + 5.5);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); tc(pdf, C.muted);
    pdf.text(`@${p.username}`, colX[1] + 1.5, y + 8.8);

    // Remaining cells
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.inkSoft);
    pdf.text(p.age ? String(p.age) : '—', colX[2] + 1.5, y + 6.5);
    pdf.text(p.sex === 'F' ? 'F' : p.sex === 'M' ? 'M' : 'X', colX[3] + 1.5, y + 6.5);
    pdf.text(p.phone || '—', colX[4] + 1.5, y + 6.5);
    const emailStr = pdf.splitTextToSize(p.email || '—', cols[5] - 3)[0] as string;
    pdf.text(emailStr, colX[5] + 1.5, y + 6.5);

    pdf.setFont('helvetica', 'bold'); tc(pdf, C.ink);
    pdf.text(String(p.notes_count ?? 0), colX[6] + 1.5, y + 6.5);
    pdf.setFont('helvetica', 'normal'); tc(pdf, C.inkSoft);
    pdf.text(p.last_visit ? fmtD(p.last_visit) : '—', colX[7] + 1.5, y + 6.5);

    dc(pdf, C.hairline); pdf.setLineWidth(0.2);
    pdf.line(ML, y + ROW_H, ML + CW, y + ROW_H);
    y += ROW_H;
  });

  if (patients.length === 0) {
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(10); tc(pdf, C.muted);
    pdf.text('Sin pacientes registrados', W / 2, y + 20, { align: 'center' });
  }

  if (y + 14 < FOOTER_Y) {
    y += 6;
    fc(pdf, C.bg); pdf.rect(ML, y, CW, 10, 'F');
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.inkSoft);
    pdf.text(`Total: ${patients.length} pacientes`, ML + 4, y + 6.8);
    pdf.text(`Generado: ${todayLong()}`, ML + CW, y + 6.8, { align: 'right' });
  }

  addAllFooters(pdf);
  return pdf;
}

// ── 2. CALENDAR ───────────────────────────────────────────────
function buildCalendarPDF(appts: Appointment[]): jsPDF {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = pw(pdf); const H = ph(pdf); // 297 × 210

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

  // Header
  const HH = 38;
  fc(pdf, C.butter); pdf.rect(0, 0, W, HH, 'F');
  fc(pdf, C.warn);   pdf.rect(0, 0, 5, HH, 'F');

  pdf.setFont('helvetica', 'bold');   pdf.setFontSize(18); tc(pdf, C.ink);
  pdf.text('Calendario Semanal', 14 + 9, 16);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);  tc(pdf, C.inkSoft);
  pdf.text(rangeStr, 14 + 9, 26);

  pdf.setFont('helvetica', 'bold');   pdf.setFontSize(9.5); tc(pdf, C.ink);
  pdf.text('Consultorio Manzanilla', W - 14, 15, { align: 'right' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);   tc(pdf, C.muted);
  pdf.text(`${weekAppts.length} citas esta semana`, W - 14, 24, { align: 'right' });

  // Day columns
  const ML2 = 14; const calW = W - ML2 * 2;
  const colW = calW / 7;
  const startY = HH + 4;
  const FOOTER_Y = H - 12;
  const colH = FOOTER_Y - startY;

  days.forEach((day, di) => {
    const cx = ML2 + di * colW;
    const isToday = day.toDateString() === today.toDateString();

    // Column background
    fc(pdf, isToday ? C.butter : C.cardTint);
    pdf.rect(cx + 1, startY, colW - 2, colH, 'F');

    // Day name + number
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5);
    tc(pdf, isToday ? C.warn : C.muted);
    pdf.text(DAYS_SHORT[day.getDay()].toUpperCase(), cx + 4, startY + 7);

    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(17);
    tc(pdf, isToday ? C.warn : C.ink);
    pdf.text(String(day.getDate()), cx + 4, startY + 17);

    // Separator
    dc(pdf, isToday ? C.peach : C.hairline); pdf.setLineWidth(0.3);
    pdf.line(cx + 2, startY + 20, cx + colW - 3, startY + 20);

    // Appointments
    const dayAppts = appts
      .filter(a => parseD(a.appointment_date).toDateString() === day.toDateString())
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

    let ay = startY + 24;
    const MAX_Y = FOOTER_Y - 6;

    if (dayAppts.length === 0) {
      pdf.setFont('helvetica', 'italic'); pdf.setFontSize(7); tc(pdf, C.muted);
      pdf.text('sin citas', cx + colW / 2, ay + 4, { align: 'center' });
    }

    dayAppts.forEach(a => {
      if (ay + 13 > MAX_Y) return;
      fc(pdf, C.white); pdf.rect(cx + 2, ay, colW - 5, 13, 'F');

      // Time in warm orange
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); tc(pdf, C.warn);
      pdf.text(fmtT(a.appointment_date), cx + 4, ay + 5.5);

      // Patient
      const patName = a.patient?.name?.split(' ').slice(0, 2).join(' ') ?? 'Paciente';
      const nameStr = pdf.splitTextToSize(patName, colW - 10)[0] as string;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); tc(pdf, C.ink);
      pdf.text(nameStr, cx + 4, ay + 10.5);

      // Status dot
      const dotColor = a.status === 'confirmed' ? C.ok : a.status === 'cancelled' ? C.danger : C.warn;
      fc(pdf, dotColor);
      pdf.circle(cx + colW - 6, ay + 5, 1.8, 'F');

      ay += 15;
    });

    if (dayAppts.length > 0) {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); tc(pdf, C.muted);
      pdf.text(`${dayAppts.length} cita${dayAppts.length !== 1 ? 's' : ''}`,
        cx + colW / 2, MAX_Y - 1, { align: 'center' });
    }
  });

  addAllFooters(pdf);
  return pdf;
}

// ── 3. CLINICAL HISTORY ───────────────────────────────────────
async function buildHistoryPDF(patientId: number): Promise<jsPDF> {
  const res = await reportsApi.history(patientId);
  const { patient: p, records }: { patient: Patient; records: ClinicalRecord[] } = res.data;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pw(pdf); const PH = ph(pdf); const CW = cw(pdf);
  const FOOTER_Y = PH - 16;

  // ── Patient banner ──
  const BH = 52;
  fc(pdf, C.butter); pdf.rect(0, 0, W, BH, 'F');
  fc(pdf, C.warn);   pdf.rect(0, 0, 5, BH, 'F');

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); tc(pdf, C.warn);
  pdf.text('HISTORIAL CLÍNICO', ML + 9, 11);

  pdf.setFont('times', 'bold'); pdf.setFontSize(22); tc(pdf, C.ink);
  pdf.text(p.name, ML + 9, 24);

  // Demographic chips
  const chips = [
    p.age ? `${p.age} años` : null,
    p.sex === 'F' ? 'Femenino' : p.sex === 'M' ? 'Masculino' : 'Otro',
    `Exp. #${p.id}`,
  ].filter(Boolean) as string[];

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
  let chipX = ML + 9;
  chips.forEach(chip => {
    const chipW = (pdf.getStringUnitWidth(chip) * 8) / pdf.internal.scaleFactor + 8;
    fc(pdf, C.peach); pdf.rect(chipX, 29, chipW, 7.5, 'F');
    tc(pdf, C.inkSoft); pdf.text(chip, chipX + 4, 34.5);
    chipX += chipW + 4;
  });

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9.5); tc(pdf, C.ink);
  pdf.text('Consultorio Manzanilla', W - MR, 16, { align: 'right' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.muted);
  pdf.text(todayLong(), W - MR, 24, { align: 'right' });

  let y = BH + 8;

  // ── General data (2-col grid) ──
  y = sectionLabel(pdf, 'Datos del paciente', y);

  const fieldRows: [string, string][][] = [
    [['Correo', p.email || '—'], ['Teléfono', p.phone || '—']],
    [['Dirección', p.address || '—'], ['Usuario', `@${p.username}`]],
  ];

  fieldRows.forEach(row => {
    row.forEach(([label, value], ci) => {
      const fx = ci === 0 ? ML : ML + CW / 2 + 4;
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); tc(pdf, C.muted);
      pdf.text(label.toUpperCase(), fx, y);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); tc(pdf, C.ink);
      const vStr = pdf.splitTextToSize(value, CW / 2 - 8)[0] as string;
      pdf.text(vStr, fx, y + 5.5);
    });
    y += 12;
  });

  y += 4;
  y = sectionLabel(pdf, `Consultas registradas (${records.length})`, y);

  if (records.length === 0) {
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(10); tc(pdf, C.muted);
    pdf.text('Sin consultas registradas', W / 2, y + 12, { align: 'center' });
  }

  records.forEach((r, ri) => {
    const estH = 18 + (r.vitals ? 20 : 0)
      + (r.diagnosis ? Math.min(pdf.splitTextToSize(r.diagnosis, CW).length, 5) * 5.5 : 0)
      + (r.prescriptions ? 9 : 0) + (r.analysis_results ? 9 : 0) + 12;

    if (y + Math.min(estH, 50) > FOOTER_Y) { pdf.addPage(); y = 20; }

    // Record header bar
    fc(pdf, C.cardTint); pdf.rect(ML, y, CW, 13, 'F');
    fc(pdf, C.warn);     pdf.rect(ML, y, 3.5, 13, 'F');

    const diagTitle = (r.diagnosis?.split('.')[0]?.trim()?.slice(0, 55)) || 'Consulta médica';
    pdf.setFont('times', 'bold'); pdf.setFontSize(13); tc(pdf, C.ink);
    pdf.text(diagTitle, ML + 8, y + 9);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.muted);
    pdf.text(fmtD(r.created_at), W - MR, y + 9, { align: 'right' });

    y += 17;

    // Vitals row
    if (r.vitals) {
      if (y + 16 > FOOTER_Y) { pdf.addPage(); y = 20; }
      const vitals: [string, string][] = [
        ['Temperatura', `${r.vitals.temperature}°C`],
        ['Peso',        `${r.vitals.weight} kg`],
        ['Altura',      `${r.vitals.height} cm`],
        ['Presión',     `${r.vitals.systolic}/${r.vitals.diastolic}`],
        ['Frec. Card.', `${r.vitals.heart_rate} bpm`],
      ];
      const vW = CW / vitals.length;
      vitals.forEach(([label, value], vi) => {
        const vx = ML + vi * vW;
        fc(pdf, C.white); pdf.rect(vx + 1, y, vW - 2, 16, 'F');
        dc(pdf, C.hairline); pdf.setLineWidth(0.2);
        pdf.rect(vx + 1, y, vW - 2, 16, 'S');
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(6.5); tc(pdf, C.muted);
        pdf.text(label.toUpperCase(), vx + vW / 2, y + 5.5, { align: 'center' });
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); tc(pdf, C.ink);
        pdf.text(value, vx + vW / 2, y + 12.5, { align: 'center' });
      });
      y += 20;
    }

    // Diagnosis text
    if (r.diagnosis) {
      if (y + 10 > FOOTER_Y) { pdf.addPage(); y = 20; }
      pdf.setFont('times', 'italic'); pdf.setFontSize(10); tc(pdf, C.ink);
      const lines = pdf.splitTextToSize(r.diagnosis, CW);
      const shown = lines.slice(0, 5) as string[];
      pdf.text(shown, ML, y + 5);
      y += shown.length * 5.5 + 4;
    }

    // Prescriptions
    if (r.prescriptions) {
      if (y + 9 > FOOTER_Y) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); tc(pdf, C.inkSoft);
      pdf.text('Prescripciones:', ML, y + 5);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.ink);
      const lines = pdf.splitTextToSize(r.prescriptions, CW - 30) as string[];
      pdf.text(lines[0], ML + 30, y + 5);
      y += 9;
    }

    // Analysis
    if (r.analysis_results) {
      if (y + 9 > FOOTER_Y) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); tc(pdf, C.inkSoft);
      pdf.text('Resultados:', ML, y + 5);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.ink);
      const lines = pdf.splitTextToSize(r.analysis_results, CW - 24) as string[];
      pdf.text(lines.slice(0, 2), ML + 24, y + 5);
      y += 9;
    }

    if (ri < records.length - 1) {
      dc(pdf, C.hairline); pdf.setLineWidth(0.3);
      pdf.line(ML, y + 4, ML + CW, y + 4);
      y += 10;
    }
  });

  // Security notice
  y += 8;
  if (y + 16 > FOOTER_Y) { pdf.addPage(); y = 20; }
  fc(pdf, C.sage); pdf.rect(ML, y, CW, 14, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); tc(pdf, C.sageText);
  pdf.text('Documento confidencial', ML + 5, y + 6);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); tc(pdf, C.inkSoft);
  pdf.text('Solo el paciente y su médico tratante tienen acceso a este historial clínico.', ML + 5, y + 11.5);

  addAllFooters(pdf);
  return pdf;
}

// ── 4. OVERVIEW ───────────────────────────────────────────────
function buildOverviewPDF(patients: Patient[], appts: Appointment[]): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = pw(pdf); const PH = ph(pdf); const CW = cw(pdf);
  const FOOTER_Y = PH - 16;

  const now = new Date();
  const month = now.getMonth(); const year = now.getFullYear();

  const monthAppts = appts.filter(a => {
    const d = parseD(a.appointment_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const confirmed = appts.filter(a => a.status === 'confirmed').length;
  const pending   = appts.filter(a => a.status === 'pending').length;
  const cancelled = appts.filter(a => a.status === 'cancelled').length;

  let y = drawPageHeader(pdf, 'Resumen General', `${MONTHS[month]} ${year} · Consultorio Manzanilla`);

  // ── 4 stat cards ──
  const CARD_W = (CW - 9) / 4;
  const statsCards = [
    { label: 'Total citas',  value: appts.length,     color: C.peach,    tc: C.inkSoft },
    { label: 'Confirmadas',  value: confirmed,         color: C.sage,     tc: C.sageText },
    { label: 'Pendientes',   value: pending,           color: C.butter,   tc: C.inkSoft },
    { label: 'Pacientes',    value: patients.length,   color: C.lavender, tc: C.inkSoft },
  ];

  statsCards.forEach((card, ci) => {
    const cx = ML + ci * (CARD_W + 3);
    fc(pdf, card.color); pdf.rect(cx, y, CARD_W, 24, 'F');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(22); tc(pdf, card.tc);
    pdf.text(String(card.value), cx + CARD_W / 2, y + 14.5, { align: 'center' });
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5);
    pdf.text(card.label.toUpperCase(), cx + CARD_W / 2, y + 21, { align: 'center' });
  });
  y += 30;

  // ── Bar chart: weekly buckets ──
  y = sectionLabel(pdf, `Consultas por semana · ${MONTHS[month]} ${year}`, y);

  const weekBuckets = [0, 0, 0, 0, 0];
  monthAppts.forEach(a => {
    const d = parseD(a.appointment_date);
    weekBuckets[Math.min(Math.floor((d.getDate() - 1) / 7), 4)]++;
  });
  const maxBar = Math.max(...weekBuckets, 1);
  const BAR_AREA_H = 48;
  const BAR_W = 22;
  const gap = (CW - weekBuckets.length * BAR_W) / (weekBuckets.length + 1);

  weekBuckets.forEach((v, i) => {
    const bx = ML + gap + i * (BAR_W + gap);
    const bh = Math.max((v / maxBar) * (BAR_AREA_H - 10), v > 0 ? 4 : 2);
    const by = y + BAR_AREA_H - bh;
    fc(pdf, i === weekBuckets.length - 1 ? C.ink : C.peach);
    pdf.rect(bx, by, BAR_W, bh, 'F');
    if (v > 0) {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); tc(pdf, C.ink);
      pdf.text(String(v), bx + BAR_W / 2, by - 2, { align: 'center' });
    }
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); tc(pdf, C.muted);
    pdf.text(`Sem ${i + 1}`, bx + BAR_W / 2, y + BAR_AREA_H + 6, { align: 'center' });
  });
  y += BAR_AREA_H + 14;

  // ── Status distribution ──
  y = sectionLabel(pdf, 'Distribución de estados', y);
  const total = confirmed + pending + cancelled || 1;
  const statuses = [
    { label: 'Confirmadas', count: confirmed, pct: Math.round(confirmed / total * 100), color: C.sage   },
    { label: 'Pendientes',  count: pending,   pct: Math.round(pending   / total * 100), color: C.butter },
    { label: 'Canceladas',  count: cancelled, pct: Math.round(cancelled / total * 100), color: C.blush  },
  ];

  const BAR_H = 8; const labelW = 28; const barW = CW - labelW - 20;
  statuses.forEach(s => {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); tc(pdf, C.inkSoft);
    pdf.text(s.label, ML, y + 6);
    fc(pdf, C.bg); pdf.rect(ML + labelW, y, barW, BAR_H, 'F');
    fc(pdf, s.color); pdf.rect(ML + labelW, y, Math.max(s.pct / 100 * barW, 1), BAR_H, 'F');
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); tc(pdf, C.ink);
    pdf.text(`${s.pct}%  (${s.count})`, ML + labelW + barW + 3, y + 6);
    y += BAR_H + 5;
  });
  y += 8;

  // ── Top patients ──
  if (y + 30 > FOOTER_Y) { pdf.addPage(); y = 20; }
  y = sectionLabel(pdf, 'Pacientes con más consultas', y);
  const topPats = [...patients].sort((a, b) => (b.notes_count ?? 0) - (a.notes_count ?? 0)).slice(0, 4);
  const PAT_W = (CW - 9) / 4;

  topPats.forEach((p, pi) => {
    const px = ML + pi * (PAT_W + 3);
    fc(pdf, C.cardTint); pdf.rect(px, y, PAT_W, 24, 'F');
    // Rank watermark
    pdf.setFont('times', 'bold'); pdf.setFontSize(20); tc(pdf, C.hairline);
    pdf.text(`#${pi + 1}`, px + PAT_W - 4, y + 16, { align: 'right' });
    // Name
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8.5); tc(pdf, C.ink);
    const nameLines = pdf.splitTextToSize(p.name, PAT_W - 8) as string[];
    pdf.text(nameLines[0], px + 5, y + 9);
    if (nameLines[1]) pdf.text(nameLines[1], px + 5, y + 14);
    // Count
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); tc(pdf, C.muted);
    pdf.text(`${p.notes_count ?? 0} consultas`, px + 5, y + 20.5);
  });

  if (topPats.length === 0) {
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(10); tc(pdf, C.muted);
    pdf.text('Sin datos de pacientes', W / 2, y + 12, { align: 'center' });
  }

  addAllFooters(pdf);
  return pdf;
}

// ── Main export ───────────────────────────────────────────────
export async function downloadReportPDF(options: {
  patients: Patient[];
  appts: Appointment[];
  type: 'overview' | 'pacientes' | 'calendario' | 'historia';
  historyPatientId?: number | null;
}): Promise<void> {
  const { patients, appts, type, historyPatientId } = options;
  let pdf: jsPDF;

  switch (type) {
    case 'pacientes':
      pdf = buildPatientsPDF(patients);
      break;
    case 'calendario':
      pdf = buildCalendarPDF(appts);
      break;
    case 'historia': {
      const pid = historyPatientId ?? patients[0]?.id;
      if (!pid) throw new Error('No hay pacientes para generar el historial');
      pdf = await buildHistoryPDF(pid);
      break;
    }
    default:
      pdf = buildOverviewPDF(patients, appts);
  }

  pdf.save(`manzanilla-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
}
