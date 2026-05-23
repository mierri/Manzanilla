import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Patient, Appointment, ClinicalRecord } from '@/types';

export interface HistoryData { patient: Patient; records: ClinicalRecord[] }

const SCALE = 4; // 4× resolución → PDF nítido

export async function downloadReportPDF(options: {
  patients: Patient[];
  appts: Appointment[];
  type: 'overview' | 'pacientes' | 'calendario' | 'historia';
  historyData?: HistoryData;
}) {
  const { type } = options;

  const node = document.querySelector<HTMLElement>('.print-doc');
  if (!node) throw new Error('No se encontró el contenedor del reporte (.print-doc)');

  const canvas = await html2canvas(node, {
    scale: SCALE,
    useCORS: true,
    backgroundColor: '#FFFCF6',
    logging: false,
    windowWidth:  node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const imgW = canvas.width;
  const imgH = canvas.height;

  const orientation = type === 'calendario' ? 'landscape' : 'portrait';
  const pageW = orientation === 'landscape' ? 297 : 210;
  const pageH = orientation === 'landscape' ? 210 : 297;

  // mm per pixel (at scale SCALE, 1 CSS px = SCALE canvas px)
  const mmPerPx = pageW / (imgW / SCALE);
  const contentH = (imgH / SCALE) * mmPerPx;   // total height in mm
  const pageImgPx = Math.floor((pageH / mmPerPx) * SCALE); // canvas px per page

  const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  let yOffset = 0;
  let pageNum = 0;

  while (yOffset < imgH) {
    if (pageNum > 0) pdf.addPage();

    const sliceH = Math.min(pageImgPx, imgH - yOffset);

    const slice = document.createElement('canvas');
    slice.width  = imgW;
    slice.height = sliceH;
    slice.getContext('2d')!.drawImage(canvas, 0, yOffset, imgW, sliceH, 0, 0, imgW, sliceH);

    const sliceMMH = (sliceH / SCALE) * mmPerPx;
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, pageW, sliceMMH);

    yOffset  += sliceH;
    pageNum  += 1;
  }

  pdf.save(`manzanilla-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
}
