export const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'];

export const DAYS_S = ['dom','lun','mar','mié','jue','vie','sáb'];

export function parseD(s: string): Date {
  return new Date(s.includes('T') ? s : s.replace(' ', 'T'));
}

export function fmtDate(s: string): string {
  return s ? parseD(s).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';
}

export function fmtTime(s: string): string {
  return parseD(s).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function todayLong(): string {
  return new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}
